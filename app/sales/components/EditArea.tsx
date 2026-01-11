// FILE: app/sales/components/EditArea.tsx
"use client";

import { useState } from "react";
import { Loader2, Edit2 } from "lucide-react";
import { toastManager } from "@/lib/toast-manager";

interface EditAreaProps {
  area: { id: string; name: string };
  onSuccess: (updatedArea: { id: string; name: string }) => void;
}

export default function EditArea({ area, onSuccess }: EditAreaProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(area.name);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/areas?id=${area.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) throw new Error("Failed");
      const data = await res.json();

      onSuccess(data.area);
      toastManager.success("Area updated! ✏️");
      setIsOpen(false);
    } catch {
      toastManager.error("Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation(); // Link click hone se rokega
          setIsOpen(true);
        }}
        className="p-2 text-emerald-600 hover:text-slate-300 bg-emerald-50 rounded-xl transition-all"
      >
        <Edit2 size={18} />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white w-full max-w-sm rounded-4xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-black text-slate-800 mb-6 text-center">
              Edit Area ✏️
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase ml-2">
                  Area Name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-emerald-50/50 border border-emerald-100 rounded-xl px-4 py-3.5 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 py-3.5 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    "Update"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
