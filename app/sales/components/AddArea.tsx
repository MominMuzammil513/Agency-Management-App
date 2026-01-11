"use client";

import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { toastManager } from "@/lib/toast-manager";

interface AddAreaProps {
  onSuccess: (newArea: { id: string; name: string }) => void;
}

export default function AddArea({ onSuccess }: AddAreaProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/areas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) throw new Error("Failed to add");
      const data = await res.json();

      onSuccess(data.area);
      toastManager.success("Area added successfully! 🌱");
      setIsOpen(false);
      setName("");
    } catch (err) {
      toastManager.error("Could not add area");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* 🌿 Floating Add Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="bg-emerald-600 text-white p-3 rounded-2xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 hover:scale-105 transition-all shrink-0"
      >
        <Plus size={20} />
      </button>

      {/* 🌿 Cute Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-sm rounded-4xl p-6 shadow-2xl animate-in slide-in-from-bottom-10">
            <h2 className="text-2xl font-black text-slate-800 mb-6 text-center">
              New Area 📍
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase ml-2">
                  Area Name
                </label>
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Market Yard"
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
                    "Save Area"
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
