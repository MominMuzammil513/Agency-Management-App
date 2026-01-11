// app/owner-admin/stock/components/DeleteStock.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toastManager } from "@/lib/toast-manager";
import { Loader2, Trash2 } from "lucide-react";

interface DeleteStockProps {
  productId: string;
}

export default function DeleteStock({ productId }: DeleteStockProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this stock entry? This cannot be undone."
      )
    )
      return;

    setLoading(true);
    try {
      const res = await fetch(`/api/stock/${productId}`, {
        method: "DELETE",
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to delete");

      toastManager.success("Stock deleted successfully");
      router.refresh();
    } catch (err: any) {
      toastManager.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
      title="Delete Stock"
    >
      {loading ? (
        <Loader2 className="animate-spin" size={20} />
      ) : (
        <Trash2 size={20} />
      )}
    </button>
  );
}
