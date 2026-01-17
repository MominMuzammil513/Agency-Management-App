"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, MapPin, ShoppingBag, FileText, ArrowLeft, Loader2 } from "lucide-react";
import BackButton from "@/components/ui/BackButton";

interface Staff {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: string;
}

interface Area {
  areaId: string | null;
  areaName: string | null;
  totalOrders: number;
  totalAmount: number;
}

interface Order {
  id: string;
  createdAt: string;
  status: string;
  shopName: string;
  shopId: string;
  areaName: string | null;
  areaId: string | null;
  totalAmount: number;
  itemCount: number;
}

interface StaffDetailClientProps {
  staff: Staff;
  areas: Area[];
  orders: Order[];
  period: "daily" | "weekly" | "monthly" | "custom";
  dateRange: { from: string; to: string };
  role: "salesman" | "delivery_boy";
  isOwnerAdmin?: boolean;
}

export default function StaffDetailClient({
  staff,
  areas,
  orders,
  period,
  dateRange,
  role,
  isOwnerAdmin = false,
}: StaffDetailClientProps) {
  const router = useRouter();
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<"daily" | "weekly" | "monthly" | "custom">(period);
  const [loadingAreaId, setLoadingAreaId] = useState<string | null>(null);
  const [loadingOrderId, setLoadingOrderId] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<"maal-load" | "bill" | null>(null);
  const [customFrom, setCustomFrom] = useState<string>(
    new Date(dateRange.from).toISOString().split("T")[0]
  );
  const [customTo, setCustomTo] = useState<string>(
    new Date(dateRange.to).toISOString().split("T")[0]
  );
  const [showCustomDate, setShowCustomDate] = useState(period === "custom");

  const handlePeriodChange = (newPeriod: "daily" | "weekly" | "monthly" | "custom") => {
    setDateFilter(newPeriod);
    setShowCustomDate(newPeriod === "custom");
    
    if (newPeriod !== "custom") {
      const params = new URLSearchParams();
      params.set("period", newPeriod);
      router.push(`/admin/staff-activity/${role}/${staff.id}?${params.toString()}`);
    }
  };

  const handleCustomDateApply = () => {
    if (!customFrom || !customTo) return;
    const params = new URLSearchParams();
    params.set("period", "custom");
    params.set("from", customFrom);
    params.set("to", customTo);
    router.push(`/admin/staff-activity/${role}/${staff.id}?${params.toString()}`);
  };

  const handleViewArea = (areaId: string | null) => {
    if (!areaId) return;
    setLoadingAreaId(areaId);
    router.push(`/admin/staff-activity/${role}/${staff.id}/area/${areaId}`);
  };

  const filteredOrders = selectedAreaId
    ? orders.filter((o) => o.areaId === selectedAreaId)
    : orders;

  const totalStats = {
    orders: orders.length,
    amount: orders.reduce((sum, o) => sum + o.totalAmount, 0),
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-30">
        <div className="px-5 py-4 flex items-center gap-3">
          <BackButton />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-800">{staff.name}</h1>
              {isOwnerAdmin && (
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs font-bold">
                  You
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">{staff.mobile}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-5 py-4 grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <p className="text-xs text-slate-500 font-bold uppercase mb-1">Total Orders</p>
          <p className="text-2xl font-black text-slate-800">{totalStats.orders}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <p className="text-xs text-slate-500 font-bold uppercase mb-1">Total Amount</p>
          <p className="text-2xl font-black text-emerald-600">
            ₹{totalStats.amount.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Date Filters */}
      <div className="px-5 py-4 bg-white border-b border-slate-100">
        <div className="flex gap-2 mb-3">
          {(["daily", "weekly", "monthly", "custom"] as const).map((p) => {
            const displayName = p === "daily" ? "Today" : p.charAt(0).toUpperCase() + p.slice(1);
            return (
              <button
                key={p}
                onClick={() => handlePeriodChange(p)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                  dateFilter === p
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {displayName}
              </button>
            );
          })}
        </div>

        {showCustomDate && (
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="text-xs text-slate-500 font-bold mb-1 block">From</label>
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-slate-500 font-bold mb-1 block">To</label>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
              />
            </div>
            <button
              onClick={handleCustomDateApply}
              className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold text-sm"
            >
              Apply
            </button>
          </div>
        )}
      </div>

      {/* Areas List */}
      <div className="px-5 py-4">
        <h2 className="text-lg font-black text-slate-800 mb-3 flex items-center gap-2">
          <MapPin size={20} />
          Areas ({areas.length})
        </h2>
        <div className="space-y-2">
          {areas.length === 0 ? (
            <div className="text-center py-12 text-slate-400 bg-white rounded-2xl p-6">
              <MapPin size={48} className="mx-auto mb-3 opacity-50" />
              <p className="font-bold">No areas found</p>
              <p className="text-xs mt-1">No orders in any area for this period</p>
            </div>
          ) : (
            areas
              .filter((area) => area.areaId !== null)
              .map((area) => {
                const isLoading = loadingAreaId === area.areaId;
                return (
                  <button
                    key={area.areaId!}
                    onClick={() => handleViewArea(area.areaId)}
                    disabled={isLoading}
                    className="w-full bg-white rounded-2xl p-4 shadow-sm border border-slate-100 transition-colors text-left disabled:opacity-50 disabled:cursor-wait"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-800">{area.areaName || "Unknown Area"}</h3>
                        <p className="text-xs text-slate-500 mt-1">
                          {area.totalOrders} orders • ₹{area.totalAmount.toLocaleString()}
                        </p>
                      </div>
                      {isLoading ? (
                        <Loader2 size={18} className="text-emerald-600 animate-spin" />
                      ) : (
                        <ArrowLeft size={18} className="text-slate-400 rotate-180" />
                      )}
                    </div>
                  </button>
                );
              })
          )}
        </div>
      </div>

      {/* Orders List */}
      <div className="px-5 py-4">
        <h2 className="text-lg font-black text-slate-800 mb-3 flex items-center gap-2">
          <ShoppingBag size={20} />
          Orders ({filteredOrders.length})
        </h2>
        <div className="space-y-2">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-slate-400 bg-white rounded-2xl p-6">
              <ShoppingBag size={48} className="mx-auto mb-3 opacity-50" />
              <p className="font-bold">No orders found</p>
              <p className="text-xs mt-1">
                {selectedAreaId ? "No orders in this area" : "No orders for this period"}
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">{order.shopName}</h3>
                    <p className="text-xs text-slate-500">{order.areaName || "Unknown Area"}</p>
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
                    {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-800">
                      ₹{order.totalAmount.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-500">{order.itemCount} items</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => {
                      setLoadingOrderId(order.id);
                      setLoadingAction("maal-load");
                      router.push(
                        `/admin/staff-activity/${role}/${staff.id}/order/${order.id}/maal-load`
                      );
                    }}
                    disabled={loadingOrderId === order.id && loadingAction === "maal-load"}
                    className="flex-1 bg-slate-100 text-slate-700 px-3 py-2 rounded-xl font-bold text-xs hover:bg-slate-200 transition-colors flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-wait"
                  >
                    {loadingOrderId === order.id && loadingAction === "maal-load" ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Loading...</span>
                      </>
                    ) : (
                      <>
                        <FileText size={14} />
                        Maal Load
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setLoadingOrderId(order.id);
                      setLoadingAction("bill");
                      router.push(
                        `/admin/staff-activity/${role}/${staff.id}/order/${order.id}/bill`
                      );
                    }}
                    disabled={loadingOrderId === order.id && loadingAction === "bill"}
                    className="flex-1 bg-emerald-100 text-emerald-700 px-3 py-2 rounded-xl font-bold text-xs transition-colors disabled:opacity-50 disabled:cursor-wait flex items-center justify-center gap-1"
                  >
                    {loadingOrderId === order.id && loadingAction === "bill" ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Loading...</span>
                      </>
                    ) : (
                      "Bill"
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
