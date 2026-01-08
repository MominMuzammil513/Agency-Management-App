// components/area/AreaList.tsx
"use client";

import { useState, useEffect, useDeferredValue } from "react";
import { MoveRight, Search } from "lucide-react";
import { toast } from "sonner";
import AddArea from "./add-area";
import EditArea from "./edit-area";
import { AreaListType } from "../main-sales";
import Link from "next/link";

interface Area {
  id: string;
  name: string;
}

export default function AreaList({ areaList }: { areaList: AreaListType }) {
  // initialise local state from props
  const [areas, setAreas] = useState<Area[]>(areaList);
  const [filteredAreas, setFilteredAreas] = useState<Area[]>(areaList);
  const [searchQuery, setSearchQuery] = useState("");
  const deferredQuery = useDeferredValue(searchQuery);

  // Real-time debounced filtering
  useEffect(() => {
    if (deferredQuery.trim() === "") {
      setFilteredAreas(areas);
    } else {
      const lowerQuery = deferredQuery.toLowerCase();
      setFilteredAreas(
        areas.filter((area) => area.name.toLowerCase().includes(lowerQuery))
      );
    }
  }, [deferredQuery, areas]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this area?")) return;

    try {
      const res = await fetch(`/api/areas?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setAreas((prev) => prev.filter((a) => a.id !== id));
      toast.success("Area deleted successfully");
    } catch {
      toast.error("Failed to delete area");
    }
  };

  return (
    <div className="px-4 space-y-6">
      <div>
        <h3 className="font-bold text-slate-800 mb-3 text-sm uppercase tracking-wider">
          Select Area
        </h3>

        {/* Real-Time Search with Debouncing */}
        <div className="relative mb-4">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search areas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
          />
        </div>

        <AddArea
          onSuccess={(newArea: Area) => {
            setAreas((prev) => [...prev, newArea]);
            toast.success("Area added successfully");
          }}
        />
      </div>

      {filteredAreas.length === 0 ? (
        <p className="text-center text-slate-500 py-8">
          {searchQuery
            ? "No areas match your search"
            : "No areas yet. Add one to get started!"}
        </p>
      ) : (
        filteredAreas.map((area) => (
          <div
            key={area.id}
            className="bg-white px-5 py-4 rounded-2xl border border-orange-100 shadow-sm mb-3 flex justify-between items-center hover:shadow-md transition-shadow"
          >
            <Link
              className="flex-1 cursor-pointer"
              href={`/sales/shops?areaId=${area.id}`}
            >
              <h2 className="text-xl font-black text-slate-800">{area.name}</h2>
            </Link>

            <div className="flex items-center gap-4">
              <EditArea
                area={area}
                onSuccess={(updatedArea) => {
                  setAreas((prev) =>
                    prev.map((a) => (a.id === updatedArea.id ? updatedArea : a))
                  );
                  toast.success("Area updated");
                }}
              />

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(area.id);
                }}
                className="text-red-500 hover:text-red-700 font-medium text-sm"
              >
                Delete
              </button>

              <Link
                href={`/sales/shops?areaId=${area.id}`}
                className="bg-emerald-100 text-emerald-700 p-2 rounded-full"
              >
                <MoveRight size={20} />
              </Link>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
