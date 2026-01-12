"use client";

import { useRouter } from "next/navigation";
import { FileText, Download, Receipt } from "lucide-react";
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
  totalAmount: number;
}

interface Item {
  productName: string;
  quantity: number;
  price: number;
}

interface BillClientProps {
  order: Order;
  items: Item[];
  staffId: string;
  role: "salesman" | "delivery_boy";
}

export default function BillClient({ order, items, staffId, role }: BillClientProps) {
  const router = useRouter();

  const handleDownloadPDF = () => {
    try {
      const orderData = {
        ...order,
        areaName: order.areaName || "",
        items: items.map((item) => ({
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: order.totalAmount,
      };

      generatePDF([orderData], `Bill_${order.shopName}`);
      toastManager.success("Bill Downloaded! 📄");
    } catch (error) {
      toastManager.error("Download failed 😢");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-30">
        <div className="px-5 py-4 flex items-center gap-3">
          <BackButton />
          <div className="flex-1">
            <h1 className="text-xl font-black text-slate-800">Bill</h1>
            <p className="text-xs text-slate-500">{order.shopName}</p>
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

      {/* Bill Card */}
      <div className="px-5 py-4">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Receipt size={24} />
              <h2 className="text-2xl font-black">INVOICE</h2>
            </div>
            <p className="text-sm opacity-90">Euro India Foods Agency</p>
          </div>

          {/* Bill To */}
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-500 uppercase mb-3">Bill To:</h3>
            <p className="text-lg font-black text-slate-800 mb-1">{order.shopName}</p>
            <p className="text-sm text-slate-600">{order.shopMobile || "N/A"}</p>
            <p className="text-sm text-slate-600 mt-1">{order.areaName || "N/A"}</p>
          </div>

          {/* Order Info */}
          <div className="p-6 border-b border-slate-100 bg-slate-50">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase mb-1">Order ID</p>
                <p className="text-slate-800 font-bold">
                  #{order.id.slice(0, 8).toUpperCase()}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase mb-1">Date</p>
                <p className="text-slate-800 font-bold">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase mb-1">Status</p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                    order.status === "delivered"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {order.status}
                </span>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="p-6">
            <div className="space-y-3 mb-4">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0"
                >
                  <div className="flex-1">
                    <p className="font-bold text-slate-800">{item.productName}</p>
                    <p className="text-xs text-slate-500">
                      {item.quantity} × ₹{(item.price / item.quantity).toFixed(2)}
                    </p>
                  </div>
                  <p className="text-lg font-black text-slate-800">
                    ₹{item.price.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="pt-4 border-t-2 border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-lg font-black text-slate-800">Grand Total:</span>
                <span className="text-2xl font-black text-emerald-600">
                  ₹{order.totalAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 bg-slate-50 text-center">
            <p className="text-xs text-slate-500">Thank you for your business!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
