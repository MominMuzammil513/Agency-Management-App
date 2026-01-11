"use client";

import { toastManager } from "@/lib/toast-manager";
import { Trash2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteCategoryButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure? This will hide products in this category."))
      return;
    setLoading(true);
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");

      toastManager.success("Category removed 👋");
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
      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
      title="Delete"
    >
      {loading ? (
        <Loader2 className="animate-spin" size={18} />
      ) : (
        <Trash2 size={18} />
      )}
    </button>
  );
}
