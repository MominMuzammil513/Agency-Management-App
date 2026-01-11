"use client";

import {
  ArrowLeft,
  CheckSquare,
  Square,
  Truck,
  Download,
  Loader2,
  Search,
} from "lucide-react";
import OrderCard from "./OrderCard";
import { Order } from "../types";
import { useState, Dispatch, SetStateAction } from "react"; // 👈 Import Dispatch & SetStateAction
import { toastManager } from "@/lib/toast-manager";
import { useRouter } from "next/navigation";

interface OrderListProps {
  areaName: string;
  orders: Order[];
  selectedIds: string[];
  // 👇 Change this line:
  setSelectedIds: Dispatch<SetStateAction<string[]>>;
  onBack: () => void;
  onViewBill: (order: Order) => void;
  onOpenLoadSheet: () => void;
  onDownloadPDF: () => void;
  loadingAction: string | null;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export default function OrderListView({
  areaName,
  orders,
  selectedIds,
  setSelectedIds,
  onBack,
  onViewBill,
  onOpenLoadSheet,
  onDownloadPDF,
  loadingAction,
  searchQuery = "",
  onSearchChange,
}: OrderListProps) {
  const router = useRouter();
  const [localOrders, setLocalOrders] = useState(orders);

  // Toggle Selection
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Select All
  const toggleSelectAll = () => {
    if (selectedIds.length === localOrders.length) setSelectedIds([]);
    else setSelectedIds(localOrders.map((o) => o.id));
  };

  // Mark Delivered Logic
  const handleDeliver = async (id: string) => {
    if (!confirm("Delivered & Paid?")) return;

    // Optimistic Update
    const prev = [...localOrders];
    setLocalOrders((curr) => curr.filter((o) => o.id !== id));

    try {
      await fetch("/api/delivery/update-status", {
        method: "POST",
        body: JSON.stringify({ orderId: id, status: "delivered" }),
      });
      toastManager.success("Done! 💰");
      router.refresh();
    } catch {
      setLocalOrders(prev);
      toastManager.error("Failed");
    }
  };

  return (
    <>
      {/* 🌿 Sticky Header */}
      <div className="bg-white/90 backdrop-blur-md sticky top-0 z-30 px-5 pt-5 pb-4 border-b border-orange-100 rounded-b-[2.5rem] shadow-sm">
        {/* Search Bar */}
        {onSearchChange && (
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by shop name or mobile..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            />
          </div>
        )}
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="p-3 bg-slate-50 rounded-full hover:bg-slate-100 text-slate-600 transition-all active:scale-90"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="text-center">
            <h2 className="text-xl font-black text-slate-800">{areaName}</h2>
            <p className="text-xs text-slate-400 font-bold uppercase">
              {orders.length} Orders
            </p>
          </div>
          <button
            onClick={toggleSelectAll}
            className="p-3 bg-slate-50 rounded-full hover:bg-orange-50 text-orange-600 transition-all active:scale-90"
          >
            {selectedIds.length === orders.length && orders.length > 0 ? (
              <CheckSquare size={20} />
            ) : (
              <Square size={20} />
            )}
          </button>
        </div>
      </div>

      {/* List */}
      <div className="p-5 space-y-4">
        {localOrders.map((order) => {
          const isSelected = selectedIds.includes(order.id);
          return (
            <div
              key={order.id}
              className="relative transition-all duration-200"
            >
              {/* Selection Overlay Logic */}
              <div
                onClick={() => toggleSelect(order.id)}
                className={`absolute left-0 top-0 bottom-0 w-12 z-20 flex items-center justify-center cursor-pointer ${
                  isSelected ? "opacity-100" : "opacity-0"
                }`}
              >
                {/* Invisible Hitbox for easy selection if needed, or rely on card click logic */}
              </div>

              <div
                className={`border-2 rounded-4xl transition-all duration-300 ${
                  isSelected
                    ? "border-emerald-500 scale-[1.02] bg-emerald-50/30"
                    : "border-transparent"
                }`}
                onClick={(e) => {
                  // Smart Selection: If selection mode is active (>=1 selected), clicking card toggles selection
                  if (selectedIds.length > 0) toggleSelect(order.id);
                }}
              >
                <OrderCard
                  order={order}
                  isLoading={false}
                  onDeliver={handleDeliver}
                  onView={onViewBill}
                  // Pass a prop to OrderCard to visually show selection checkbox if needed
                />

                {/* Selection Indicator on Card */}
                {selectedIds.length > 0 && (
                  <div className="absolute top-6 right-6 z-30 pointer-events-none">
                    {isSelected ? (
                      <div className="bg-emerald-500 text-white p-1 rounded-full shadow-lg animate-in zoom-in">
                        <CheckSquare size={16} />
                      </div>
                    ) : (
                      <div className="bg-slate-200 p-1 rounded-full">
                        <Square size={16} className="text-slate-400" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 🚀 Floating Action Bar (Only when items selected) */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-slate-900/90 backdrop-blur-xl text-white p-2 pl-5 rounded-full shadow-2xl z-40 animate-in slide-in-from-bottom-10 flex justify-between items-center ring-4 ring-white/20">
          <div className="text-sm font-bold">
            <span className="text-emerald-400">{selectedIds.length}</span>{" "}
            Selected
          </div>

          <div className="flex gap-2">
            <button
              onClick={onOpenLoadSheet}
              className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 transition-all active:scale-95"
            >
              <Truck size={14} /> Load Maal
            </button>
            <button
              onClick={onDownloadPDF}
              className="bg-white text-emerald-900 hover:bg-emerald-50 px-4 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 transition-all active:scale-95 shadow-lg"
            >
              {loadingAction === "pdf" ? (
                <Loader2 className="animate-spin" size={14} />
              ) : (
                <Download size={14} />
              )}{" "}
              PDF
            </button>
          </div>
        </div>
      )}
    </>
  );
}
