"use client";

import { useState, useEffect, useDeferredValue } from "react";
import { toast } from "sonner";
import { Search, Trash2 } from "lucide-react";
import AddShop from "./AddShop";
import EditShop from "./EditShop";
import Link from "next/link";

export interface Shop {
  id: string;
  name: string;
  ownerName: string | null;
  mobile: string | null;
}

export default function ShopsPage({
  areaId,
  initialShops,
}: {
  areaId: string;
  initialShops: Shop[];
}) {
  const [shops, setShops] = useState<Shop[]>(initialShops);
  const [filteredShops, setFilteredShops] = useState<Shop[]>(initialShops);
  const [searchQuery, setSearchQuery] = useState("");
  const deferredQuery = useDeferredValue(searchQuery);

  // Debounced search
  useEffect(() => {
    if (deferredQuery.trim() === "") {
      setFilteredShops(shops);
    } else {
      const lower = deferredQuery.toLowerCase();
      setFilteredShops(
        shops.filter(
          (s) =>
            s.name.toLowerCase().includes(lower) ||
            s.ownerName?.toLowerCase().includes(lower) ||
            s.mobile?.includes(deferredQuery)
        )
      );
    }
  }, [deferredQuery, shops]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this shop?")) return;
    try {
      const res = await fetch(`/api/shops/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setShops((prev) => prev.filter((s) => s.id !== id));
      toast.success("Shop deleted");
    } catch {
      toast.error("Failed to delete shop");
    }
  };

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold">Shops in this Area</h1>

      {/* Search + Add */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search shops..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <AddShop
          areaId={areaId}
          onSuccess={(newShop: Shop) => {
            setShops((prev) => [...prev, newShop]);
            toast.success("Shop added");
          }}
        />
      </div>

      {/* Shops List */}
      {filteredShops.length === 0 ? (
        <p className="text-center text-slate-500 py-12">
          {searchQuery
            ? "No shops found"
            : "No shops in this area yet. Add one!"}
        </p>
      ) : (
        <div className="flex flex-col gap-y-3">
          {filteredShops.map((shop) => (
            <div
              key={shop.id}
              className="bg-white rounded-2xl shadow-lg py-3.5 px-5 hover:shadow-xl transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-0">
                  <h3 className="font-bold text-xl">{shop.name}</h3>
                  {shop.ownerName && (
                    <h6 className="text-slate-600 text-sm">
                      Owner: {shop.ownerName}
                    </h6>
                  )}
                  {shop.mobile && (
                    <h6 className="text-slate-600 text-sm">
                      Mobile: {shop.mobile}
                    </h6>
                  )}
                </div>
                <Link
                  href={`/salesman/order?shopId=${shop.id}`}
                  className="bg-orange-600 text-white px-3 py-1 rounded-2xl hover:bg-orange-700 font-medium"
                >
                  Order
                </Link>
              </div>
              <div className="flex justify-end gap-x-3">
                <EditShop
                  shop={shop}
                  onSuccess={(updated) => {
                    setShops((prev) =>
                      prev.map((s) => (s.id === updated.id ? updated : s))
                    );
                    toast.success("Shop updated");
                  }}
                />
                <button
                  onClick={() => handleDelete(shop.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
