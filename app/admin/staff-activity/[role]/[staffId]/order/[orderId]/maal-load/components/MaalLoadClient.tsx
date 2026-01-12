"use client";

import { useRouter } from "next/navigation";
import { FileText, Download, ArrowLeft, Package } from "lucide-react";
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
}

interface Item {
  productName: string;
  quantity: number;
  price: number;
}

interface MaalLoadClientProps {
  order: Order;
  summary: Record<string, number>;
  items: Item[];
  staffId: string;
  role: "salesman" | "delivery_boy";
}

export default function MaalLoadClient({
  order,
  summary,
  items,
  staffId,
  role,
}: MaalLoadClientProps) {
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
        totalAmount: items.reduce((sum, item) => sum + item.price, 0),
      };

      generatePDF([orderData], `Maal_Load_${order.shopName}`);
      toastManager.success("PDF Downloaded! 📄");
    } catch (error) {
      toastManager.error("Download failed 😢");
    }
  };

  const totalAmount = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-30">
        <div className="px-5 py-4 flex items-center gap-3">
          <BackButton />
          <div className="flex-1">
            <h1 className="text-xl font-black text-slate-800">Maal Load Sheet</h1>
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

      {/* Order Info */}
      <div className="px-5 py-4 bg-white border-b border-slate-100">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-xs text-slate-500">Shop:</span>
            <span className="text-sm font-bold text-slate-800">{order.shopName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-slate-500">Mobile:</span>
            <span className="text-sm font-bold text-slate-800">{order.shopMobile || "N/A"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-slate-500">Area:</span>
            <span className="text-sm font-bold text-slate-800">{order.areaName || "N/A"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-slate-500">Date:</span>
            <span className="text-sm font-bold text-slate-800">
              {new Date(order.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="px-5 py-4">
        <h2 className="text-lg font-black text-slate-800 mb-3 flex items-center gap-2">
          <Package size={20} />
          Load Summary
        </h2>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-3">
          {Object.entries(summary).map(([productName, quantity]) => (
            <div
              key={productName}
              className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
            >
              <span className="text-sm font-bold text-slate-800">{productName}</span>
              <span className="text-sm font-bold text-emerald-600">{quantity} units</span>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Items */}
      <div className="px-5 py-4">
        <h2 className="text-lg font-black text-slate-800 mb-3 flex items-center gap-2">
          <FileText size={20} />
          Order Details
        </h2>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="divide-y divide-slate-100">
            {items.map((item, index) => (
              <div key={index} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-slate-800">{item.productName}</span>
                  <span className="text-sm font-bold text-emerald-600">
                    ₹{item.price.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Quantity: {item.quantity}</span>
                  <span className="text-xs text-slate-500">
                    Unit: ₹{(item.price / item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 bg-emerald-50 border-t border-emerald-200">
            <div className="flex items-center justify-between">
              <span className="text-lg font-black text-slate-800">Total Amount:</span>
              <span className="text-lg font-black text-emerald-600">
                ₹{totalAmount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
