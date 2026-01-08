// components/shop/EditShop.tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Edit } from "lucide-react";

interface Shop {
  id: string;
  name: string;
  ownerName: string | null;
  mobile: string | null;
}

interface EditShopProps {
  shop: Shop;
  onSuccess: (updatedShop: Shop) => void;
}

export default function EditShop({ shop, onSuccess }: EditShopProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(shop.name);
  const [ownerName, setOwnerName] = useState(shop.ownerName || "");
  const [mobile, setMobile] = useState(shop.mobile || "");

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Shop name required");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/shops/${shop.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          ownerName: ownerName.trim() || null,
          mobile: mobile.trim() || null,
        }),
      });

      if (!res.ok) throw new Error("Update failed");

      const data = await res.json();
      onSuccess(data.shop);
      setIsOpen(false);
    } catch (err) {
      toast.error("Failed to update shop");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-blue-600 hover:text-blue-800"
      >
        <Edit size={18} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-6">
            <h2 className="text-2xl font-bold text-center">Edit Shop</h2>

            <div className="space-y-4">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Shop Name *"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />

              <input
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="Owner Name (optional)"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />

              <input
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="Mobile (optional)"
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
                  "Update"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
