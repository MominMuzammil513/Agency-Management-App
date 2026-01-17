"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  TrendingUp,
  DollarSign,
  Package,
  Filter,
  ArrowRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface StatsProps {
  data: {
    totalRevenue: number;
    totalProfit: number;
    inventoryValue: number;
    areaStats: Record<string, { revenue: number; profit: number }>;
    dateRange: { from: Date; to: Date; type: string };
  };
}

export default function StatsClient({ data }: StatsProps) {
  const router = useRouter();
  const [customDates, setCustomDates] = useState({ from: "", to: "" });

  // Convert Area Stats to Graph Data
  const graphData = Object.entries(data.areaStats).map(([name, val]) => ({
    name,
    profit: val.profit,
    revenue: val.revenue,
  }));

  const applyFilter = (range: string) => {
    router.push(`?range=${range}`);
  };

  const applyCustomFilter = () => {
    if (customDates.from && customDates.to) {
      router.push(
        `?range=custom&from=${customDates.from}&to=${customDates.to}`
      );
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50/60 pb-24 font-sans">
      {/* 🌿 Header & Filters */}
      <div className="bg-white/80 backdrop-blur-md sticky top-0 z-30 px-6 py-5 border-b border-emerald-100 rounded-b-[2.5rem] shadow-sm mb-6">
        <h1 className="text-2xl font-black text-slate-800 mb-4">
          Analytics & Profit 📈
        </h1>

        {/* Date Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {["today", "yesterday", "weekly", "monthly"].map((filter) => (
            <button
              key={filter}
              onClick={() => applyFilter(filter)}
              className={`px-4 py-2 rounded-full text-xs font-bold capitalize whitespace-nowrap transition-all ${
                data.dateRange.type === filter
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200"
                  : "bg-white text-slate-500 border border-slate-100"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Custom Date Inputs (Simple UI) */}
        <div className="mt-3 flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100">
          <input
            type="date"
            className="bg-transparent text-xs font-bold text-slate-600 outline-none"
            onChange={(e) =>
              setCustomDates({ ...customDates, from: e.target.value })
            }
          />
          <span className="text-slate-400 text-[10px]">TO</span>
          <input
            type="date"
            className="bg-transparent text-xs font-bold text-slate-600 outline-none"
            onChange={(e) =>
              setCustomDates({ ...customDates, to: e.target.value })
            }
          />
          <button
            onClick={applyCustomFilter}
            className="bg-slate-800 text-white p-1.5 rounded-lg ml-auto"
          >
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      <div className="px-6 space-y-6">
        {/* 💰 Big Stats Cards */}
        <div className="grid grid-cols-1 gap-4">
          {/* Profit Card */}
          <div className="bg-linear-to-r from-emerald-600 to-teal-600 p-6 rounded-[2.5rem] text-white shadow-xl shadow-emerald-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
            <div className="flex items-center gap-2 mb-2 opacity-90">
              <TrendingUp size={20} />{" "}
              <span className="font-bold text-sm">Net Profit</span>
            </div>
            <h2 className="text-4xl font-black">
              ₹{data.totalProfit.toLocaleString()}
            </h2>
            <p className="text-xs opacity-80 mt-1">Based on selected range</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Revenue */}
            <div className="bg-white p-5 rounded-4xl shadow-sm border border-slate-50">
              <div className="text-blue-500 bg-blue-50 w-10 h-10 rounded-full flex items-center justify-center mb-2">
                <DollarSign size={20} />
              </div>
              <p className="text-xs text-slate-400 font-bold uppercase">
                Total Sales
              </p>
              <p className="text-xl font-black text-slate-800">
                ₹{data.totalRevenue.toLocaleString()}
              </p>
            </div>

            {/* Inventory Value */}
            <div className="bg-white p-5 rounded-4xl shadow-sm border border-slate-50">
              <div className="text-orange-500 bg-orange-50 w-10 h-10 rounded-full flex items-center justify-center mb-2">
                <Package size={20} />
              </div>
              <p className="text-xs text-slate-400 font-bold uppercase">
                Stock Value
              </p>
              <p className="text-xl font-black text-slate-800">
                ₹{data.inventoryValue.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* 📊 Area Wise Profit Graph */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-50">
          <h3 className="font-black text-slate-800 mb-6">
            Area Performance 🏘️
          </h3>
          <div className="h-64 w-full min-h-[256px]">
            <ResponsiveContainer width="100%" height="100%" minHeight={256}>
              <BarChart
                data={graphData}
                layout="vertical"
                margin={{ left: 20 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={80}
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "#f1f5f9" }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                  }}
                />
                <Bar
                  dataKey="profit"
                  name="Profit"
                  fill="#10b981"
                  radius={[0, 10, 10, 0]}
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 📋 Detailed List Area Wise */}
        <div className="bg-white p-5 rounded-4xl shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wide">
            Breakdown by Area
          </h3>
          <div className="space-y-3">
            {graphData.map((item, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl transition-colors"
              >
                <span className="font-bold text-slate-700 text-sm">
                  {item.name}
                </span>
                <div className="text-right">
                  <span className="block text-emerald-600 font-black text-sm">
                    +₹{item.profit}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Sale: ₹{item.revenue}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
