"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom"; // 🔥 Portal Import
import { Loader2, Plus, X } from "lucide-react";
import { toastManager } from "@/lib/toast-manager";

interface AddShopProps {
  areaId: string;
  onSuccess: (shop: any) => void; // Using 'any' to match your flow, strictly type if needed
}

export default function AddShop({ areaId, onSuccess }: AddShopProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false); // To handle hydration

  const [formData, setFormData] = useState({
    name: "",
    ownerName: "",
    mobile: "",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/shops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, areaId }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create shop");
      }
      const data = await res.json();

      console.log("✅ Shop created successfully, response:", data);
      
      // Ensure shop data has areaId
      const shopData = {
        ...data.shop,
        areaId: areaId, // Ensure areaId is set
      };
      
      toastManager.success("Shop added successfully! 🏪");
      onSuccess(shopData); // Pass shop with areaId
      setIsOpen(false);
      setFormData({ name: "", ownerName: "", mobile: "" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not add shop";
      toastManager.error(message);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 Portal Content
  const modalContent = (
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Scrollable Wrapper for Mobile Keyboard safety */}
      <div className="w-full max-h-[90vh] overflow-y-auto flex justify-center">
        <div className="bg-white w-full max-w-sm rounded-4xl p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
          {/* Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 p-2 bg-slate-50 text-slate-400 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            <X size={20} />
          </button>

          <h2 className="text-2xl font-black text-slate-800 mb-6 text-center">
            New Shop 🏪
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase ml-2">
                Shop Name
              </label>
              <input
                autoFocus
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full bg-emerald-50/50 border-2 border-emerald-100 rounded-xl px-4 py-3.5 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all placeholder:text-slate-300"
                placeholder="e.g. Gupta General Store"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase ml-2">
                  Owner
                </label>
                <input
                  value={formData.ownerName}
                  onChange={(e) =>
                    setFormData({ ...formData, ownerName: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 placeholder:text-slate-300"
                  placeholder="Name"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase ml-2">
                  Mobile
                </label>
                <input
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) =>
                    setFormData({ ...formData, mobile: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 placeholder:text-slate-300"
                  placeholder="123..."
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
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
                className="flex-1 py-3.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  "Save Shop"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-2xl shadow-lg shadow-emerald-200 transition-all shrink-0 flex items-center justify-center h-full aspect-square"
      >
        <Plus size={24} />
      </button>

      {/* Render Modal via Portal if Open & Mounted */}
      {isOpen && mounted && createPortal(modalContent, document.body)}
    </>
  );
}
