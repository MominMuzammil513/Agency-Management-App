"use client";

import { useState, useEffect, useMemo } from "react";
import {
  TrendingUp,
  Users,
  ShoppingBag,
  ArrowUpRight,
  Clock,
  Truck,
  CheckCircle2,
  Phone,
  Filter,
  XCircle,
} from "lucide-react";
import { AreaChart, Area, Tooltip, ResponsiveContainer } from "recharts";

interface DashboardProps {
  stats: {
    todaySales: number;
    todayOrders: number;
    activeStaff: number;
  };
  graphData: { name: string; sales: number }[];
  recentOrders: any[];
  staffData: {
    sales: any[];
    delivery: any[];
  };
}

export default function AdminDashboardClient({
  stats,
  graphData,
  recentOrders,
  staffData,
}: DashboardProps) {
  const [greeting, setGreeting] = useState("Hello");
  const [activeTab, setActiveTab] = useState<"sales" | "delivery">("sales");

  // 🔥 NEW: Order Status Filter State
  const [orderFilter, setOrderFilter] = useState<
    "All" | "Pending" | "Delivered"
  >("All");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning ☀️");
    else if (hour < 18) setGreeting("Good Afternoon 🌤️");
    else setGreeting("Good Evening 🌙");
  }, []);

  // 🔍 Filter Logic
  const filteredOrders = useMemo(() => {
    return recentOrders.filter((order) => {
      if (orderFilter === "All") return true;
      if (orderFilter === "Pending")
        return order.status === "pending" || order.status === "confirmed";
      if (orderFilter === "Delivered")
        return order.status === "delivered" || order.status === "completed";
      return true;
    });
  }, [recentOrders, orderFilter]);

  return (
    <div className="min-h-screen bg-emerald-50/60 pb-24 font-sans">
      {/* 🌿 Header */}
      <div className="bg-white/80 backdrop-blur-md sticky top-0 z-30 px-6 py-6 border-b border-emerald-100 rounded-b-[3rem] shadow-sm mb-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-emerald-600 font-bold text-xs uppercase tracking-widest mb-1">
              Owner Dashboard
            </p>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">
              {greeting}
            </h1>
          </div>
          <div className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center text-2xl shadow-inner border-2 border-white">
            👨‍💼
          </div>
        </div>
      </div>

      <div className="px-6 space-y-8">
        {/* 📊 Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[2rem] p-5 text-white shadow-lg shadow-emerald-200 relative overflow-hidden">
            <div className="flex items-center gap-3 mb-3 opacity-90">
              <div className="p-2 bg-white/20 rounded-full">
                <TrendingUp size={18} />
              </div>
              <span className="text-sm font-bold">Today's Sales</span>
            </div>
            <h3 className="text-3xl font-black">
              ₹{stats.todaySales.toLocaleString()}
            </h3>
          </div>
          <div className="bg-white rounded-[2rem] p-5 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-3 text-slate-500">
              <div className="p-2 bg-orange-50 text-orange-500 rounded-full">
                <ShoppingBag size={18} />
              </div>
              <span className="text-sm font-bold">Orders Today</span>
            </div>
            <h3 className="text-3xl font-black text-slate-800">
              {stats.todayOrders}
            </h3>
          </div>
          <div className="bg-white rounded-[2rem] p-5 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-3 text-slate-500">
              <div className="p-2 bg-blue-50 text-blue-500 rounded-full">
                <Users size={18} />
              </div>
              <span className="text-sm font-bold">Active Staff</span>
            </div>
            <h3 className="text-3xl font-black text-slate-800">
              {stats.activeStaff}
            </h3>
          </div>
        </div>

        {/* 📈 Graph */}
        <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-emerald-50">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-black text-slate-800">
              Weekly Trends 📉
            </h2>
            <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase">
              Last 7 Days
            </div>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={graphData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  }}
                  formatter={(value: number | undefined) => [
                    `₹${value ?? 0}`,
                    "Sales",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorSales)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 👥 Live Team Tracking */}
        <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-emerald-50">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-black text-slate-800">Live Team 📍</h2>
            <div className="flex bg-slate-100 p-1 rounded-full">
              <button
                onClick={() => setActiveTab("sales")}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  activeTab === "sales"
                    ? "bg-white text-emerald-600 shadow-sm"
                    : "text-slate-400"
                }`}
              >
                Sales
              </button>
              <button
                onClick={() => setActiveTab("delivery")}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  activeTab === "delivery"
                    ? "bg-white text-orange-600 shadow-sm"
                    : "text-slate-400"
                }`}
              >
                Delivery
              </button>
            </div>
          </div>
          <div className="space-y-3">
            {activeTab === "sales" ? (
              staffData.sales.length === 0 ? (
                <p className="text-center text-xs text-slate-400 py-4">
                  No activity 😴
                </p>
              ) : (
                staffData.sales.map((staff: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-emerald-200 text-emerald-700 rounded-full flex items-center justify-center font-bold text-sm">
                        {staff.staffName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">
                          {staff.staffName}
                        </p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">
                          📍 {staff.areaName}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-emerald-600">
                        ₹{staff.totalAmount}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {staff.totalOrders} Orders
                      </p>
                    </div>
                  </div>
                ))
              )
            ) : staffData.delivery.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-xs text-slate-400">
                  No active delivery boys.
                </p>
              </div>
            ) : (
              staffData.delivery.map((staff: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-orange-50/50 rounded-2xl border border-orange-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-orange-200 text-orange-700 rounded-full flex items-center justify-center font-bold text-sm">
                      <Truck size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">
                        {staff.staffName}
                      </p>
                      <p className="text-[10px] text-emerald-600 font-bold uppercase flex items-center gap-1">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>{" "}
                        {staff.status}
                      </p>
                    </div>
                  </div>
                  <div>
                    <a
                      href={`tel:${staff.mobile}`}
                      className="bg-white p-2 rounded-full text-slate-400 hover:text-orange-600 shadow-sm border border-slate-100 block"
                    >
                      <Phone size={16} />
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 📦 Recent Orders with Filters */}
        <div>
          <div className="flex justify-between items-end mb-4 px-2">
            <h2 className="text-lg font-black text-slate-800">
              Recent Activity
            </h2>

            {/* 🔥 Filters for Orders */}
            <div className="flex bg-slate-100 p-1 rounded-full gap-1">
              {["All", "Pending", "Delivered"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setOrderFilter(filter as any)}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${
                    orderFilter === filter
                      ? filter === "Delivered"
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-800 text-white"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-10 opacity-50 bg-white rounded-[2rem] border border-dashed border-slate-200">
                <p className="text-sm font-medium">No orders found 🔍</p>
              </div>
            ) : (
              filteredOrders.map((order: any) => {
                const isDelivered =
                  order.status === "delivered" || order.status === "completed";
                const isCancelled = order.status === "cancelled";

                return (
                  <div
                    key={order.id}
                    className="bg-white p-4 rounded-[2rem] shadow-sm border border-slate-50 flex justify-between items-center hover:scale-[1.01] transition-transform"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`h-12 w-12 rounded-2xl flex items-center justify-center text-lg shadow-inner ${
                          isDelivered
                            ? "bg-emerald-100 text-emerald-600"
                            : isCancelled
                            ? "bg-red-50 text-red-500"
                            : "bg-orange-50 text-orange-400"
                        }`}
                      >
                        {isDelivered ? (
                          <CheckCircle2 size={20} />
                        ) : isCancelled ? (
                          <XCircle size={20} />
                        ) : (
                          <Clock size={20} />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">
                          {order.shopName}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                          <span>{order.areaName || "Unknown Area"}</span>
                          <span>•</span>
                          <span>
                            {new Date(order.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-black ${
                          isDelivered ? "text-emerald-600" : "text-slate-800"
                        }`}
                      >
                        ₹{order.totalAmount}
                      </p>
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          isDelivered
                            ? "bg-emerald-50 text-emerald-600"
                            : isCancelled
                            ? "bg-red-50 text-red-500"
                            : "bg-orange-50 text-orange-500"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
