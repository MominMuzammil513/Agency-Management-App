"use client";

import { createPortal } from "react-dom";
import { X, Receipt, MapPin, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { Order } from "../types"; // Types file se import

interface ViewBillModalProps {
  order: Order | null;
  onClose: () => void;
}

export default function ViewBillModal({ order, onClose }: ViewBillModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!order || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-in fade-in duration-200">
      {/* Modal Container */}
      <div className="bg-white w-full max-w-sm max-h-[85vh] overflow-y-auto rounded-[2.5rem] p-6 shadow-2xl relative animate-in zoom-in-95 ring-8 ring-white/20">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 bg-slate-50 text-slate-400 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors"
        >
          <X size={20} />
        </button>

        {/* 🧾 Header Section */}
        <div className="text-center mt-2 mb-6">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Receipt size={30} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
            Order Receipt
          </h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
            ID: #{order.id.slice(0, 6).toUpperCase()}
          </p>
        </div>

        {/* 🏪 Shop Info Box */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6">
          <h3 className="font-bold text-slate-800 text-lg leading-tight mb-1">
            {order.shopName}
          </h3>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <MapPin size={12} className="text-orange-400" />
              {order.areaName || "Unknown Area"}
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <Calendar size={12} className="text-blue-400" />
              {order.createdAt
                ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Date N/A"}
            </div>
          </div>
        </div>

        {/* 🛒 Items List */}
        <div className="space-y-4 mb-6">
          <div className="flex justify-between text-[10px] font-black text-slate-300 uppercase border-b border-slate-100 pb-2 px-1">
            <span>Item Name</span>
            <span>Qty x Rate</span>
            <span>Amt</span>
          </div>

          <div className="flex flex-col gap-3">
            {order.items.map((item, idx) => (
              <div
                key={idx}
                className="flex justify-between items-start text-sm group"
              >
                <div className="font-bold text-slate-700 flex-1 pr-2 leading-tight">
                  {item.productName}
                </div>
                <div className="text-xs text-slate-400 font-medium whitespace-nowrap text-right w-20">
                  {item.quantity} x ₹{Math.round(item.price / item.quantity)}
                </div>
                <div className="font-black text-slate-800 w-16 text-right">
                  ₹{item.price}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 💰 Total Banner */}
        <div className="bg-emerald-600 p-5 rounded-2xl flex justify-between items-center text-white shadow-lg shadow-emerald-200">
          <span className="font-bold uppercase text-xs tracking-wider opacity-80">
            Grand Total
          </span>
          <span className="text-2xl font-black">₹{order.totalAmount}</span>
        </div>

        {/* Done Button */}
        <button
          onClick={onClose}
          className="w-full mt-4 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors"
        >
          Close Receipt
        </button>
      </div>
    </div>,
    document.body
  );
}
