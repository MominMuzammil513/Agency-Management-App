"use client";

import { useRouter } from "next/navigation";
import { FileText, Download, Package, Users } from "lucide-react";
import BackButton from "@/components/ui/BackButton";
import { generatePDF } from "@/lib/generate-pdf";
import { toastManager } from "@/lib/toast-manager";

interface Order {
  id: string;
  createdAt: string;
  status: string;
  shopName: string;
  shopMobile: string | null;
  areaName: string | null;
  createdBy: string;
}

interface Item {
  orderId: string;
  productId?: string;
  productName: string;
  categoryId?: string | null;
  categoryName?: string | null;
  quantity: number;
  price: number;
}

interface Staff {
  id: string;
  name: string;
}

interface CombinedMaalLoadClientProps {
  orders: Order[];
  items: Item[];
  summary: Record<string, number>;
  staffList: Staff[];
  role: "salesman" | "delivery_boy";
}

export default function CombinedMaalLoadClient({
  orders,
  items,
  summary,
  staffList,
  role,
}: CombinedMaalLoadClientProps) {
  const router = useRouter();

  const handleDownloadPDF = () => {
    try {
      // Group items by order
      const ordersWithItems = orders.map((order) => {
        const orderItems = items.filter((item) => item.orderId === order.id);
        return {
          ...order,
          areaName: order.areaName || "",
          items: orderItems.map((item) => ({
            productName: item.productName,
            quantity: item.quantity,
            price: item.price,
          })),
          totalAmount: orderItems.reduce((sum, item) => sum + item.price, 0),
        };
      });

      generatePDF(ordersWithItems, `Combined_Maal_Load_${staffList.map((s) => s.name).join("_")}`);
      toastManager.success("PDF Downloaded! 📄");
    } catch (error) {
      toastManager.error("Download failed 😢");
    }
  };

  const totalAmount = orders.reduce((sum, order) => {
    const orderItems = items.filter((item) => item.orderId === order.id);
    return sum + orderItems.reduce((s, item) => s + item.price, 0);
  }, 0);

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-30">
        <div className="px-5 py-4 flex items-center gap-3">
          <BackButton />
          <div className="flex-1">
            <h1 className="text-xl font-black text-slate-800">Combined Maal Load</h1>
            <p className="text-xs text-slate-500">
              {staffList.length} {staffList.length === 1 ? "staff" : "staffs"}
            </p>
          </div>
          <button
            onClick={handleDownloadPDF}
            className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-emerald-700 transition-colors"
          >
            <Download size={16} />
            PDF
          </button>
        </div>
      </div>

      {/* Staff List */}
      <div className="px-5 py-4 bg-white border-b border-slate-100">
        <h2 className="text-sm font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
          <Users size={16} />
          Selected Staff
        </h2>
        <div className="flex flex-wrap gap-2">
          {staffList.map((staff) => (
            <span
              key={staff.id}
              className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold"
            >
              {staff.name}
            </span>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="px-5 py-4 grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <p className="text-xs text-slate-500 font-bold uppercase mb-1">Orders</p>
          <p className="text-2xl font-black text-slate-800">{orders.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <p className="text-xs text-slate-500 font-bold uppercase mb-1">Products</p>
          <p className="text-2xl font-black text-slate-800">{Object.keys(summary).length}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <p className="text-xs text-slate-500 font-bold uppercase mb-1">Total</p>
          <p className="text-2xl font-black text-emerald-600">
            ₹{totalAmount.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="px-5 py-4">
        <h2 className="text-lg font-black text-slate-800 mb-3 flex items-center gap-2">
          <Package size={20} />
          Load Summary
        </h2>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-3">
          {Object.entries(summary).map(([key, quantity]) => {
            // Extract product name from key (format: categoryId:productName)
            const productName = key.split(':').slice(1).join(':');
            return (
              <div
                key={key}
                className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
              >
                <div>
                  <span className="text-sm font-bold text-slate-800 block">{productName}</span>
                  <span className="text-xs text-slate-400 font-bold uppercase">
                    {items.find(i => `${i.categoryId || 'uncategorized'}:${i.productName}` === key)?.categoryName || 'Uncategorized'}
                  </span>
                </div>
                <span className="text-sm font-bold text-emerald-600">{quantity} units</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Orders List */}
      <div className="px-5 py-4">
        <h2 className="text-lg font-black text-slate-800 mb-3 flex items-center gap-2">
          <FileText size={20} />
          Orders ({orders.length})
        </h2>
        <div className="space-y-2">
          {orders.map((order) => {
            const orderItems = items.filter((item) => item.orderId === order.id);
            const orderTotal = orderItems.reduce((sum, item) => sum + item.price, 0);
            const staffName = staffList.find((s) => s.id === order.createdBy)?.name || "Unknown";

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">{order.shopName}</h3>
                    <p className="text-xs text-slate-500">{order.areaName || "Unknown Area"}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {order.shopMobile && `${order.shopMobile} • `}Staff: {staffName}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      order.status === "delivered"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                  <div className="text-xs text-slate-500">
                    {orderItems.length} items • {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                  <div className="text-sm font-bold text-slate-800">
                    ₹{orderTotal.toLocaleString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
