"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Trash } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DeleteProductButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete product");
      toast.success("Product deleted");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-red-600 hover:text-red-800 flex justify-between items-center gap-x-2"
    >
      {loading ? (
        <Loader2 className="animate-spin" size={18} />
      ) : (
        <>
          <Trash size={18} />{" "}
          <span className="text-base font-semibold">Delete</span>
        </>
      )}
    </button>
  );
}
