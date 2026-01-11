// app/admin/more/managestaff/earnings/components/StaffEarningsClient.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  Package,
  Filter,
} from "lucide-react";
import BackButton from "@/components/ui/BackButton";

interface StaffEarningsClientProps {
  staff: {
    id: string;
    name: string;
    role: string;
    email: string;
    mobile: string;
    isActive: boolean;
  }[];
  earnings: {
    staffId: string;
    staffName: string;
    role: string;
    totalOrders: number;
    totalAmount: number;
    areas: { name: string; orders: number; amount: number }[];
  }[];
  period: "daily" | "weekly" | "monthly";
  selectedStaffId?: string;
  dateRange: { start: Date; end: Date };
}

export default function StaffEarningsClient({
  staff,
  earnings,
  period,
  selectedStaffId,
  dateRange,
}: StaffEarningsClientProps) {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState(period);
  const [filterStaffId, setFilterStaffId] = useState(selectedStaffId || "");

  const handlePeriodChange = (newPeriod: "daily" | "weekly" | "monthly") => {
    setSelectedPeriod(newPeriod);
    const params = new URLSearchParams();
    params.set("period", newPeriod);
    if (filterStaffId) params.set("staffId", filterStaffId);
    router.push(`?${params.toString()}`);
  };

  const handleStaffFilter = (staffId: string) => {
    setFilterStaffId(staffId);
    const params = new URLSearchParams();
    params.set("period", selectedPeriod);
    if (staffId) params.set("staffId", staffId);
    router.push(`?${params.toString()}`);
  };

  const totalEarnings = earnings.reduce((sum, e) => sum + e.totalAmount, 0);
  const totalOrders = earnings.reduce((sum, e) => sum + e.totalOrders, 0);

  return (
    <div className="min-h-screen bg-emerald-50/60 pb-24 font-sans">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md sticky top-0 z-30 px-6 py-5 border-b border-emerald-100 rounded-b-[2.5rem] shadow-sm mb-6">
        <div className="flex items-center gap-4 mb-4">
          <BackButton />
          <div>
            <h1 className="text-2xl font-black text-slate-800">Staff Earnings 💰</h1>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
              Performance Analytics
            </p>
          </div>
        </div>

        {/* Period Filter */}
        <div className="flex gap-2 mb-4">
          {(["daily", "weekly", "monthly"] as const).map((p) => (
            <button
              key={p}
              onClick={() => handlePeriodChange(p)}
              className={`px-4 py-2 rounded-full text-xs font-bold capitalize transition-all ${
                selectedPeriod === p
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200"
                  : "bg-white text-slate-500 border border-slate-100"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Staff Filter */}
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => handleStaffFilter("")}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${
              !filterStaffId
                ? "bg-slate-800 text-white"
                : "bg-white text-slate-500 border border-slate-100"
            }`}
          >
            All Staff
          </button>
          {staff.map((s) => (
            <button
              key={s.id}
              onClick={() => handleStaffFilter(s.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${
                filterStaffId === s.id
                  ? "bg-emerald-600 text-white"
                  : "bg-white text-slate-500 border border-slate-100"
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-emerald-50">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-100 rounded-full">
                <Package size={18} className="text-emerald-600" />
              </div>
              <span className="text-xs text-slate-400 font-bold uppercase">
                Total Orders
              </span>
            </div>
            <p className="text-3xl font-black text-slate-800">{totalOrders}</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white shadow-lg">
            <div className="flex items-center gap-3 mb-2 opacity-90">
              <div className="p-2 bg-white/20 rounded-full">
                <DollarSign size={18} />
              </div>
              <span className="text-xs font-bold uppercase">Total Earnings</span>
            </div>
            <p className="text-3xl font-black">₹{totalEarnings.toLocaleString()}</p>
          </div>
        </div>

        {/* Staff List */}
        <div className="space-y-4">
          {earnings.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-emerald-200">
              <Users size={48} className="mx-auto text-emerald-300 mb-3" />
              <p className="text-slate-500 font-bold">No earnings data found</p>
            </div>
          ) : (
            earnings.map((staffEarning) => (
              <div
                key={staffEarning.staffId}
                className="bg-white rounded-3xl p-6 shadow-sm border border-emerald-50"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-800">
                      {staffEarning.staffName}
                    </h3>
                    <p className="text-xs text-slate-400 font-bold uppercase">
                      {staffEarning.role.replace("_", " ")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-emerald-600">
                      ₹{staffEarning.totalAmount.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-400">
                      {staffEarning.totalOrders} Orders
                    </p>
                  </div>
                </div>

                {/* Area Breakdown */}
                {staffEarning.areas.length > 0 && (
                  <div className="pt-4 border-t border-slate-100">
                    <p className="text-xs text-slate-400 font-bold uppercase mb-3">
                      Area Breakdown
                    </p>
                    <div className="space-y-2">
                      {staffEarning.areas.map((area, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center p-2 bg-slate-50 rounded-xl"
                        >
                          <span className="text-sm font-bold text-slate-700">
                            {area.name}
                          </span>
                          <div className="text-right">
                            <span className="text-sm font-black text-emerald-600">
                              ₹{area.amount}
                            </span>
                            <span className="text-[10px] text-slate-400 ml-2">
                              ({area.orders} orders)
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
