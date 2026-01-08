// app/owner-admin/categories/components/DeleteCategoryButton.tsx
"use client";

import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteCategoryButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Delete this category?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      if (!res.ok)
        throw new Error(
          (await res.json().catch(() => ({}))).message || "Delete failed"
        );
      toast.success("Category deleted");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
      aria-label="Delete category"
      title="Delete"
    >
      <Trash2 size={18} />
    </button>
  );
}
