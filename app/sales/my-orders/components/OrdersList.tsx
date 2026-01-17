"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import {
  Calendar,
  MapPin,
  Search,
  Download,
  Eye,
  CheckCircle2,
  Circle,
  Loader2,
  X,
  Truck,
  Package,
  Trash2,
  HeartHandshake,
} from "lucide-react";
import { generatePDF } from "@/lib/generate-pdf";
import { toastManager } from "@/lib/toast-manager";

// --- Types ---
interface Order {
  id: string;
  shopId: string;
  createdAt: string | Date | null;
  status: string | null;
  shopName: string;
  areaName: string | null;
  totalAmount: number;
  itemCount: number;
}

interface OrderItem {
  productName: string;
  quantity: number;
  price: number;
}

interface FullOrderDetails extends Order {
  items: OrderItem[];
}

export default function OrdersList({ orders }: { orders: Order[] }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [loadingAction, setLoadingAction] = useState(false);

  // Modals State
  const [viewOrder, setViewOrder] = useState<FullOrderDetails | null>(null);
  const [loadingSummary, setLoadingSummary] = useState<Record<
    string,
    { quantity: number; categoryName: string }
  > | null>(null);

  // 🔍 Filter Logic - Only show pending and confirmed orders (exclude delivered and cancelled)
  const filteredOrders = useMemo(() => {
    const lower = searchQuery.toLowerCase();
    return orders
      .filter(
        (o) =>
          (o.shopName.toLowerCase().includes(lower) ||
            (o.areaName && o.areaName.toLowerCase().includes(lower))) &&
          o.status !== "cancelled" &&
          o.status !== "delivered" // Only show pending and confirmed
      );
  }, [searchQuery, orders]);

  // ☑️ Selection Logic
  const toggleSelect = (id: string) => {
    setSelectedOrders((prev) =>
      prev.includes(id) ? prev.filter((oid) => oid !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map((o) => o.id));
    }
  };

  // 🛠️ Helper: Fetch Details
  const fetchDetails = async (targetOrderIds: string[]) => {
    const res = await fetch("/api/orders/details", {
      method: "POST",
      body: JSON.stringify({ orderIds: targetOrderIds }),
    });
    const { items } = await res.json();
    return items;
  };

  // 👁️ View Single Bill
  const handleViewBill = async (order: Order) => {
    setLoadingAction(true);
    try {
      const items = await fetchDetails([order.id]);
      setViewOrder({ ...order, items });
    } catch {
      toastManager.error("Oops! Bill load nahi hua 💔");
    } finally {
      setLoadingAction(false);
    }
  };

  // 🚚 View Loading Sheet
  const handleLoadSheet = async () => {
    if (selectedOrders.length === 0) return;
    setLoadingAction(true);
    try {
      const items: any[] = await fetchDetails(selectedOrders);

      // Group by category + product name to separate same names from different categories
      const summary: Record<string, { quantity: number; categoryName: string }> = {};
      items.forEach((item) => {
        // Use categoryId + productName as key to separate same names from different categories
        const key = `${item.categoryId || 'uncategorized'}:${item.productName}`;
        if (!summary[key]) {
          summary[key] = { quantity: 0, categoryName: item.categoryName || 'Uncategorized' };
        }
        summary[key].quantity += item.quantity;
      });

      setLoadingSummary(summary);
    } catch {
      toastManager.error("Calculation failed 🥺");
    } finally {
      setLoadingAction(false);
    }
  };

  // 📄 Download PDF
  const handleDownloadPDF = async () => {
    if (selectedOrders.length === 0) return;
    setLoadingAction(true);
    try {
      const targetOrders = filteredOrders.filter((o) =>
        selectedOrders.includes(o.id)
      );
      const items = await fetchDetails(selectedOrders);

      const fullData = targetOrders.map((order) => ({
        ...order,
        areaName: order.areaName || "",
        items: items.filter((i: any) => i.orderId === order.id),
      }));

      generatePDF(
        fullData,
        selectedOrders.length === 1
          ? `Order_${fullData[0].shopName}`
          : "Loading_Sheet"
      );
      toastManager.success("Bill Downloaded! 💖");
    } catch {
      toastManager.error("Download failed 😢");
    } finally {
      setLoadingAction(false);
    }
  };

  // 🔥 HANDLE DELETE (Cancel Order)
  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm("Delete this order? 🥺 Stock will be restored.")) return;

    setLoadingAction(true);
    try {
      const res = await fetch(`/api/orders?id=${orderId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed");

      toastManager.success("Order removed cleanly ✨");
      router.refresh();
    } catch {
      toastManager.error("Could not delete");
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div className="pb-32">
      {/* 🌸 Cute Search Bar */}
      <div className="bg-white/80 backdrop-blur-xl sticky top-20 z-20 px-6 py-4 shadow-sm border-b border-emerald-50 flex gap-4 items-center">
        <div className="relative flex-1 group">
          <div className="absolute inset-0 bg-emerald-100 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400"
            size={18}
          />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your lovely shops..."
            className="w-full pl-12 pr-6 py-3 bg-white border-2 border-emerald-50 rounded-full text-sm font-medium text-slate-600 focus:outline-none focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50 transition-all placeholder:text-slate-300 relative z-10"
          />
        </div>
        <button
          onClick={selectAll}
          className="bg-emerald-50 p-3 rounded-full text-emerald-500 hover:bg-emerald-100 hover:scale-110 transition-all active:scale-90"
        >
          {selectedOrders.length === filteredOrders.length &&
          filteredOrders.length > 0 ? (
            <CheckCircle2 />
          ) : (
            <Circle />
          )}
        </button>
      </div>

      {/* 📋 Orders List */}
      <div className="p-5 space-y-5">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-20 opacity-60">
            <div className="bg-emerald-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <Package size={48} className="text-emerald-300" />
            </div>
            <p className="text-slate-400 font-medium">
              No orders yet, let's work! 💪
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => {
              const dateObj = order.createdAt
                ? new Date(order.createdAt)
                : new Date();
              const isSelected = selectedOrders.includes(order.id);
            return (
              <div
                key={order.id}
                onClick={() => toggleSelect(order.id)}
                className={`group relative rounded-4xl p-5 border-2 transition-all duration-300 cursor-pointer overflow-hidden ${
                  isSelected
                    ? "bg-emerald-50/80 border-emerald-300 shadow-[0_10px_40px_-10px_rgba(16,185,129,0.2)] scale-[1.02]"
                    : "bg-white border-transparent hover:border-emerald-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1"
                }`}
              >
                {/* Background Decoration */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-linear-to-br from-emerald-100 to-teal-50 rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity"></div>

                {/* Header */}
                <div className="flex justify-between items-start relative z-10">
                  <div>
                    <h3 className="text-xl font-black text-slate-800 leading-tight tracking-tight">
                      {order.shopName}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold mt-1.5 uppercase tracking-wide">
                      <MapPin size={12} className="text-emerald-400" />{" "}
                      {order.areaName}
                    </div>
                  </div>
                  <div
                    className={`transition-all duration-300 ${
                      isSelected
                        ? "text-emerald-500 scale-110"
                        : "text-slate-200 group-hover:text-slate-300"
                    }`}
                  >
                    {isSelected ? (
                      <CheckCircle2
                        size={24}
                        fill="currentColor"
                        className="text-white"
                      />
                    ) : (
                      <Circle size={24} />
                    )}
                  </div>
                </div>

                {/* Body */}
                <div className="mt-6 flex justify-between items-end relative z-10">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full w-fit">
                      <Calendar size={12} />
                      {dateObj.toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </div>
                    <div className="text-sm font-bold text-emerald-600 pl-1">
                      {order.itemCount} Items
                    </div>
                  </div>

                  <div className="flex gap-3 items-end">
                    {/* 🔥 ALWAYS VISIBLE ACTION BUTTONS (Mobile Friendly) */}
                    <div
                      className="flex bg-slate-50 rounded-2xl p-1 gap-1 border border-slate-100"
                      onClick={(e) => e.stopPropagation()} // Card click rokne ke liye
                    >
                      <button
                        onClick={() => handleViewBill(order)}
                        className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-white rounded-xl transition-all active:scale-90"
                        title="View Bill"
                      >
                        <Eye size={20} />
                      </button>
                      <div className="w-px bg-slate-200 my-1"></div>
                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-white rounded-xl transition-all active:scale-90"
                        title="Delete Order"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>

                    {/* Price Tag */}
                    <div className="text-right">
                      <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider mb-0.5">
                        Total
                      </p>
                      <div className="bg-linear-to-r from-emerald-500 to-teal-500 text-transparent bg-clip-text text-2xl font-black">
                        ₹{order.totalAmount}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 🟢 Floating Cloud Action Bar */}
      {selectedOrders.length > 0 && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-slate-900/90 backdrop-blur-xl text-white p-2 pl-4 rounded-full shadow-2xl shadow-emerald-900/20 z-40 animate-in slide-in-from-bottom-10 fade-in duration-300 flex justify-between items-center ring-4 ring-white/20">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500 h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm shadow-lg shadow-emerald-500/40">
              {selectedOrders.length}
            </div>
            <span className="text-xs font-bold text-slate-300">Selected</span>
          </div>

          <div className="flex gap-1 pr-1">
            <button
              onClick={handleLoadSheet}
              disabled={loadingAction}
              className="bg-slate-800 text-slate-200 px-4 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 hover:bg-slate-700 hover:text-white transition-all active:scale-95"
            >
              <Truck size={14} /> Load
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={loadingAction}
              className="bg-white text-emerald-900 px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 hover:bg-emerald-50 transition-all shadow-lg active:scale-95"
            >
              {loadingAction ? (
                <Loader2 className="animate-spin" size={14} />
              ) : (
                <Download size={14} />
              )}
              PDF
            </button>
          </div>
        </div>
      )}

      {/* ================= MODALS ================= */}

      {/* 1. View Bill Modal */}
      {viewOrder &&
        createPortal(
          <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-sm max-h-[85vh] overflow-y-auto rounded-[2.5rem] p-6 shadow-2xl relative animate-in zoom-in-95 duration-300 ring-8 ring-white/30">
              <button
                onClick={() => setViewOrder(null)}
                className="absolute top-5 right-5 p-2 bg-slate-50 text-slate-400 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors"
              >
                <X size={20} />
              </button>

              <div className="text-center mb-8 mt-2">
                <div className="inline-block bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-3">
                  Euro India Foods
                </div>
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">
                  Invoice 🧾
                </h2>
              </div>

              <div className="bg-linear-to-br from-slate-50 to-white p-5 rounded-3xl mb-6 border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-50 rounded-bl-full opacity-50"></div>
                <p className="font-black text-slate-800 text-xl mb-1 relative z-10">
                  {viewOrder.shopName}
                </p>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wide mb-4 relative z-10">
                  <MapPin size={10} /> {viewOrder.areaName}
                </div>

                <div className="flex justify-between pt-4 border-t border-slate-100 text-xs relative z-10">
                  <div className="flex flex-col">
                    <span className="text-slate-400 font-medium">Date</span>
                    <span className="font-bold text-slate-700">
                      {new Date(
                        viewOrder.createdAt as string
                      ).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-slate-400 font-medium">Order ID</span>
                    <span className="font-bold text-slate-700 font-mono">
                      #{viewOrder.id.slice(0, 6).toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-[10px] font-black text-slate-300 uppercase px-2">
                  <span>Product</span>
                  <span>Total</span>
                </div>
                {viewOrder.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center group"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="bg-emerald-50 text-emerald-600 w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold">
                        {item.quantity}
                      </div>
                      <span className="font-bold text-slate-700 text-sm leading-tight">
                        {item.productName}
                      </span>
                    </div>
                    <span className="font-black text-slate-800 text-sm pl-2">
                      ₹{item.price}
                    </span>
                  </div>
                ))}
              </div>

              <div className="bg-slate-900 p-5 rounded-3xl flex justify-between items-center shadow-xl shadow-slate-200">
                <span className="text-slate-400 font-bold uppercase text-xs tracking-wider">
                  Grand Total
                </span>
                <span className="text-2xl font-black text-white">
                  ₹{viewOrder.totalAmount}
                </span>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* 2. Load Sheet Modal */}
      {loadingSummary &&
        createPortal(
          <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-in fade-in">
            <div className="bg-white w-full max-w-sm max-h-[85vh] overflow-y-auto rounded-[2.5rem] p-6 shadow-2xl relative animate-in zoom-in-95 ring-8 ring-white/30">
              <button
                onClick={() => setLoadingSummary(null)}
                className="absolute top-5 right-5 p-2 bg-slate-50 text-slate-400 rounded-full hover:bg-red-50 hover:text-red-500"
              >
                <X size={20} />
              </button>

              <div className="text-center mb-6 mt-2">
                <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Truck size={32} />
                </div>
                <h2 className="text-2xl font-black text-slate-800">
                  Load Sheet
                </h2>
                <p className="text-xs text-slate-400 font-bold uppercase mt-1">
                  Summary for {selectedOrders.length} Shops
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl mb-6 text-xs text-amber-800 font-bold text-center leading-relaxed">
                Gadi mein bas yahi maal load karna hai. <br /> Check karke load
                karein. 📦
              </div>

              <div className="space-y-2 mb-6">
                {Object.entries(loadingSummary).map(([key, data]) => {
                  // Extract product name from key (format: categoryId:productName)
                  const productName = key.split(':').slice(1).join(':');
                  return (
                    <div
                      key={key}
                      className="p-3 pl-4 flex justify-between items-center bg-slate-50 rounded-2xl border border-slate-100"
                    >
                      <div>
                        <span className="font-bold text-slate-700 text-sm block">
                          {productName}
                        </span>
                        <span className="text-xs text-slate-400 font-bold uppercase">
                          {data.categoryName}
                        </span>
                      </div>
                      <span className="bg-slate-800 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-md shadow-slate-200">
                        {data.quantity}
                      </span>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => setLoadingSummary(null)}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold shadow-lg shadow-slate-200 active:scale-95 transition-transform"
              >
                Samajh gaya 👍
              </button>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
