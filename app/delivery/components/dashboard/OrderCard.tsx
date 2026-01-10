"use client";

import { MapPin, Phone, CheckCircle2, Eye, Loader2 } from "lucide-react";
import { Order } from "../types"; // Make sure types.ts exists

interface OrderCardProps {
  order: Order;
  isLoading: boolean;
  onDeliver: (id: string) => void;
  onView: (order: Order) => void;
}

export default function OrderCard({
  order,
  isLoading,
  onDeliver,
  onView,
}: OrderCardProps) {
  // Format items string (e.g., "2 x Chips, 5 x Pepsi...")
  const itemsSummary = order.items
    .map((i) => `${i.quantity} x ${i.productName}`)
    .join(", ");

  return (
    <div className="group relative bg-white rounded-[2rem] p-5 shadow-sm border border-orange-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden h-full">
      {/* 🎨 Decoration: Orange Blur */}
      <div className="absolute -top-8 -right-8 w-28 h-28 bg-orange-50 rounded-full blur-2xl opacity-60 pointer-events-none"></div>

      {/* --- Top Row: Header --- */}
      <div className="flex justify-between items-start mb-3 relative z-10">
        <div className="pr-2">
          <h3 className="font-black text-lg text-slate-800 leading-tight">
            {order.shopName}
          </h3>
          <div className="flex items-center gap-1 text-xs font-bold text-slate-400 mt-1 uppercase tracking-wide">
            <MapPin size={12} className="text-orange-400" />
            {order.areaName || "Unknown Area"}
          </div>
        </div>

        {/* View Bill Button */}
        <button
          onClick={(e) => {
            e.stopPropagation(); // Card selection rokne ke liye
            onView(order);
          }}
          className="p-2.5 bg-slate-50 rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all shadow-sm active:scale-90"
          title="View Details"
        >
          <Eye size={18} />
        </button>
      </div>

      {/* --- Middle: Items Summary --- */}
      <div className="text-xs font-medium text-slate-500 mb-4 bg-slate-50/80 p-3 rounded-xl line-clamp-2 border border-slate-100">
        {itemsSummary}
      </div>

      {/* --- Bottom: Actions --- */}
      <div className="flex items-end justify-between gap-3 relative z-10">
        {/* Money Section */}
        <div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">
            Collect
          </p>
          <p className="text-2xl font-black text-emerald-600">
            ₹{order.totalAmount}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {/* Call Button */}
          <a
            href={`tel:${order.shopMobile}`}
            onClick={(e) => e.stopPropagation()}
            className="bg-orange-50 text-orange-600 p-3.5 rounded-2xl hover:bg-orange-100 active:scale-95 transition-all"
          >
            <Phone size={20} />
          </a>

          {/* Deliver Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeliver(order.id);
            }}
            disabled={isLoading}
            className="bg-slate-900 text-white px-5 py-3 rounded-2xl font-bold flex items-center gap-2 active:scale-95 transition-all shadow-lg hover:bg-slate-800 disabled:opacity-70 disabled:active:scale-100"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <CheckCircle2 size={18} />
            )}
            <span className="hidden sm:inline">Deliver</span>
          </button>
        </div>
      </div>
    </div>
  );
}
