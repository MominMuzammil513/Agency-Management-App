"use client";

import { MapPin, ChevronRight, Package } from "lucide-react";

interface AreaGridProps {
  areaStats: Record<string, { count: number; amount: number }>;
  totalPending: number;
  onSelectArea: (area: string) => void;
  deliveryStats?: { totalDelivered: number; totalAmount: number };
}

export default function AreaGridView({
  areaStats,
  totalPending,
  onSelectArea,
  deliveryStats,
}: AreaGridProps) {
  const areas = Object.keys(areaStats);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8 mt-2">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">
          Delivery Zones 🌍
        </h1>
        <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">
          {totalPending} Orders waiting
        </p>
      </div>

      {/* Delivery Stats Cards */}
      {deliveryStats && deliveryStats.totalDelivered > 0 && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-orange-50">
            <p className="text-xs text-slate-400 font-bold uppercase mb-1">Delivered</p>
            <p className="text-2xl font-black text-emerald-600">{deliveryStats.totalDelivered}</p>
            <p className="text-[10px] text-slate-400 mt-1">Total Orders</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-orange-50">
            <p className="text-xs text-slate-400 font-bold uppercase mb-1">Earnings</p>
            <p className="text-2xl font-black text-emerald-600">₹{deliveryStats.totalAmount}</p>
            <p className="text-[10px] text-slate-400 mt-1">Total Amount</p>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4">
        {areas.length === 0 ? (
          <div className="text-center py-20 opacity-50">
            <Package size={60} className="mx-auto text-orange-300 mb-4" />
            <p className="font-bold text-slate-500">No areas assigned yet!</p>
          </div>
        ) : (
          areas.map((area) => (
            <button
              key={area}
              onClick={() => onSelectArea(area)}
              className="group relative bg-white rounded-[2.5rem] p-6 shadow-sm border border-orange-50 hover:shadow-xl hover:shadow-orange-100/50 hover:-translate-y-1 transition-all duration-300 text-left w-full overflow-hidden"
            >
              {/* Decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-full opacity-50 group-hover:scale-110 transition-transform"></div>

              <div className="relative z-10 flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-orange-100 text-orange-600 p-2 rounded-full">
                      <MapPin size={18} />
                    </div>
                    <h3 className="text-xl font-black text-slate-800">
                      {area}
                    </h3>
                  </div>
                  <p className="text-sm font-medium text-slate-400 pl-1">
                    {areaStats[area].count} Stops •{" "}
                    <span className="text-emerald-600 font-bold">
                      ₹{areaStats[area].amount}
                    </span>
                  </p>
                </div>

                <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 group-hover:bg-orange-500 group-hover:text-white transition-all shadow-sm">
                  <ChevronRight size={24} />
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
