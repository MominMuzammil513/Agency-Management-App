// components/shop/AddShop.tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface AddShopProps {
  areaId: string;
  onSuccess: (newShop: {
    id: string;
    name: string;
    ownerName: string | null;
    mobile: string | null;
  }) => void;
}

export default function AddShop({ areaId, onSuccess }: AddShopProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [mobile, setMobile] = useState("");

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Shop name required");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/shops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          ownerName: ownerName.trim() || null,
          mobile: mobile.trim() || null,
          areaId,
        }),
      });

      if (!res.ok) throw new Error("Failed to add shop");

      const data = await res.json();
      onSuccess(data.shop);
      setIsOpen(false);
      setName("");
      setOwnerName("");
      setMobile("");
    } catch (err) {
      toast.error("Failed to add shop");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="bg-orange-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-orange-700 shadow-lg"
      >
        + Add New Shop
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-6">
        <h2 className="text-2xl font-bold text-center">Add New Shop</h2>

        <div className="space-y-4">
          <input
            placeholder="Shop Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />

          <input
            placeholder="Owner Name (optional)"
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />

          <input
            placeholder="Mobile (optional)"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => setIsOpen(false)}
            className="flex-1 border border-slate-300 py-3 rounded-xl font-medium hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700 disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              "Add Shop"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
