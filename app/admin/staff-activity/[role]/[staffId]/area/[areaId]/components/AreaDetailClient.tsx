"use client";

import { useRouter } from "next/navigation";
import { Store, ShoppingBag, FileText, ArrowLeft } from "lucide-react";
import BackButton from "@/components/ui/BackButton";

interface Staff {
  id: string;
  name: string;
}

interface Area {
  id: string;
  name: string;
}

interface Shop {
  shopId: string;
  shopName: string;
  shopMobile: string | null;
  totalOrders: number;
  totalAmount: number;
}

interface Order {
  id: string;
  createdAt: string;
  status: string;
  shopName: string;
  shopId: string;
  totalAmount: number;
  itemCount: number;
}

interface AreaDetailClientProps {
  staff: Staff;
  area: Area;
  shops: Shop[];
  orders: Order[];
  role: "salesman" | "delivery_boy";
}

export default function AreaDetailClient({
  staff,
  area,
  shops,
  orders,
  role,
}: AreaDetailClientProps) {
  const router = useRouter();

  const totalStats = {
    shops: shops.length,
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
            <h1 className="text-xl font-black text-slate-800">{area.name}</h1>
            <p className="text-xs text-slate-500">Staff: {staff.name}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-5 py-4 grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <p className="text-xs text-slate-500 font-bold uppercase mb-1">Shops</p>
          <p className="text-2xl font-black text-slate-800">{totalStats.shops}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <p className="text-xs text-slate-500 font-bold uppercase mb-1">Orders</p>
          <p className="text-2xl font-black text-slate-800">{totalStats.orders}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <p className="text-xs text-slate-500 font-bold uppercase mb-1">Amount</p>
          <p className="text-2xl font-black text-emerald-600">
            ₹{totalStats.amount.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Shops List */}
      <div className="px-5 py-4">
        <h2 className="text-lg font-black text-slate-800 mb-3 flex items-center gap-2">
          <Store size={20} />
          Shops ({shops.length})
        </h2>
        <div className="space-y-2">
          {shops.length === 0 ? (
            <div className="text-center py-12 text-slate-400 bg-white rounded-2xl p-6">
              <Store size={48} className="mx-auto mb-3 opacity-50" />
              <p className="font-bold">No shops found</p>
              <p className="text-xs mt-1">No shops with orders in this area for this staff</p>
            </div>
          ) : (
            shops.map((shop) => (
              <div
                key={shop.shopId}
                className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800">{shop.shopName}</h3>
                    <p className="text-xs text-slate-500 mt-1">{shop.shopMobile || "N/A"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-800">
                      {shop.totalOrders} orders
                    </p>
                    <p className="text-xs text-emerald-600">
                      ₹{shop.totalAmount.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Orders List */}
      <div className="px-5 py-4">
        <h2 className="text-lg font-black text-slate-800 mb-3 flex items-center gap-2">
          <ShoppingBag size={20} />
          Orders ({orders.length})
        </h2>
        <div className="space-y-2">
          {orders.length === 0 ? (
            <div className="text-center py-12 text-slate-400 bg-white rounded-2xl p-6">
              <ShoppingBag size={48} className="mx-auto mb-3 opacity-50" />
              <p className="font-bold">No orders found</p>
              <p className="text-xs mt-1">No orders in this area for this staff</p>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">{order.shopName}</h3>
                    <p className="text-xs text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString()}
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
                  <div className="text-xs text-slate-500">{order.itemCount} items</div>
                  <div className="text-sm font-bold text-slate-800">
                    ₹{order.totalAmount.toLocaleString()}
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() =>
                      router.push(
                        `/admin/staff-activity/${role}/${staff.id}/order/${order.id}/maal-load`
                      )
                    }
                    className="flex-1 bg-slate-100 text-slate-700 px-3 py-2 rounded-xl font-bold text-xs hover:bg-slate-200 transition-colors flex items-center justify-center gap-1"
                  >
                    <FileText size={14} />
                    Maal Load
                  </button>
                  <button
                    onClick={() =>
                      router.push(
                        `/admin/staff-activity/${role}/${staff.id}/order/${order.id}/bill`
                      )
                    }
                    className="flex-1 bg-emerald-100 text-emerald-700 px-3 py-2 rounded-xl font-bold text-xs hover:bg-emerald-200 transition-colors"
                  >
                    Bill
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
