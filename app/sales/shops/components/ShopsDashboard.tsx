"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Store,
  User,
  Phone,
  ShoppingBag,
  ArrowLeft,
  Trash2,
  RefreshCcw,
} from "lucide-react";
import { toast } from "sonner";
import useSWR from "swr"; // 🔥 SWR Import
import AddShop from "./AddShop";
import EditShop from "./EditShop";

interface Shop {
  id: string;
  name: string;
  ownerName: string | null;
  mobile: string | null;
}

interface ShopsDashboardProps {
  areaId: string;
  areaName: string;
  initialShops: Shop[];
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ShopsDashboard({
  areaId,
  areaName,
  initialShops,
}: ShopsDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // 🔥 SWR Configuration (Real-time Sync)
  const { data, mutate, isValidating } = useSWR(
    `/api/shops?areaId=${areaId}`,
    fetcher,
    {
      fallbackData: { shops: initialShops },
      refreshInterval: 15000, // ✅ Ab har 15 sec mein check karega (Server Relaxed)
      revalidateOnFocus: true, // ✅ Tab switch karne par update hoga
      revalidateOnReconnect: true, // ✅ Net aate hi update
      dedupingInterval: 5000, // ✅ 5 sec tak same request dobara nahi jayegi
    }
  );

  const shops: Shop[] = data?.shops || [];

  // Search Filter
  const filteredShops = useMemo(() => {
    const lower = searchQuery.toLowerCase();
    return shops.filter(
      (s) =>
        s.name.toLowerCase().includes(lower) ||
        s.ownerName?.toLowerCase().includes(lower) ||
        s.mobile?.includes(searchQuery)
    );
  }, [searchQuery, shops]);

  // 🔥 Delete Logic
  const handleDelete = async (id: string) => {
    if (!confirm("Remove this shop?")) return;

    // Optimistic Update
    const updatedShops = shops.filter((s) => s.id !== id);
    mutate({ shops: updatedShops }, false);

    try {
      const res = await fetch(`/api/shops/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      toast.success("Shop removed");
      mutate(); // Sync with server
    } catch {
      toast.error("Could not delete shop");
      mutate();
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50/60 font-sans pb-24">
      {/* 🌿 Header (Sticky & Blurry) */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-emerald-100/50 rounded-b-4xl shadow-sm px-5 pt-6 pb-6">
        {/* Navigation & Title */}
        <div className="flex items-center gap-3 mb-5">
          <Link
            href="/sales"
            className="h-10 w-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:bg-emerald-100 hover:text-emerald-600 transition-all"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <p className="text-emerald-600 font-bold text-[10px] tracking-widest uppercase">
              Current Area
            </p>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none">
              {areaName}
            </h1>
          </div>
        </div>

        {/* Search & Add Row */}
        <div className="flex gap-3">
          <div className="bg-white rounded-2xl shadow-lg border border-emerald-400 shadow-emerald-100/50 p-2 flex items-center flex-1">
            <div className="pl-3 text-emerald-300">
              {isValidating ? (
                <RefreshCcw size={18} className="animate-spin" />
              ) : (
                <Search size={20} />
              )}
            </div>
            <input
              type="text"
              placeholder="Find shop..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-3 pr-4 py-2.5 bg-transparent text-slate-700 placeholder:text-slate-400 focus:outline-none font-medium"
            />
          </div>

          {/* Add Shop Component */}
          <AddShop areaId={areaId} onSuccess={() => mutate()} />
        </div>
      </div>

      {/* 🏪 Shops List */}
      <div className="p-4 space-y-4">
        {filteredShops.length === 0 ? (
          <div className="text-center py-16 opacity-60 bg-white/40 rounded-3xl border border-dashed border-emerald-200">
            <Store size={48} className="mx-auto text-emerald-300 mb-3" />
            <p className="text-slate-500 font-medium">
              No shops found here.
              <br />
              Add one to start selling! 🚀
            </p>
          </div>
        ) : (
          filteredShops.map((shop) => (
            <div
              key={shop.id}
              className="group bg-white rounded-3xl p-5 shadow-[0_4px_20px_-4px_rgba(16,185,129,0.1)] border border-white hover:border-emerald-200 transition-all duration-300 relative overflow-hidden"
            >
              {/* Decorative Blur */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-4 -mt-4 z-0 opacity-50 pointer-events-none"></div>

              <div className="relative z-10">
                {/* Shop Name & Info */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-black text-slate-800 leading-tight mb-1">
                      {shop.name}
                    </h2>
                    {(shop.ownerName || shop.mobile) && (
                      <div className="flex flex-col gap-1 mt-2">
                        {shop.ownerName && (
                          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
                            <User size={12} className="text-emerald-400" />
                            {shop.ownerName}
                          </div>
                        )}
                        {shop.mobile && (
                          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
                            <Phone size={12} className="text-emerald-400" />
                            {shop.mobile}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions (Edit/Delete) */}
                  <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-100">
                    <EditShop shop={shop} onSuccess={() => mutate()} />
                    <div className="w-px h-3 bg-slate-200"></div>
                    <button
                      onClick={() => handleDelete(shop.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* 🔥 MAIN ACTION: ORDER BUTTON */}
                <Link
                  href={`/sales/order?shopId=${shop.id}`}
                  className="w-full bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 transform active:scale-[0.98] transition-all"
                >
                  <ShoppingBag size={20} />
                  Take Order
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
