// app/owner-admin/categories/components/AddCategory.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const addCategorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
});

type AddCategoryForm = z.infer<typeof addCategorySchema>;

export default function AddCategory() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddCategoryForm>({
    resolver: zodResolver(addCategorySchema),
  });

  const onSubmit = async (data: AddCategoryForm) => {
    setLoading(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to add category");
      }

      await res.json(); // we don’t need to pass it up anymore
      reset();
      setIsOpen(false);
      toast.success("Category added successfully");
      router.refresh(); // 🔑 refresh server component
    } catch (err: any) {
      toast.error(err.message || "Failed to add category");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="bg-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-700 shadow-lg"
      >
        + Add New Category
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-6">
        <h2 className="text-2xl font-bold text-center">Add New Category</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Category Name
            </label>
            <input
              {...register("name")}
              placeholder="e.g. Chips"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-2">{errors.name.message}</p>
            )}
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex-1 border border-slate-300 py-3 rounded-xl font-medium hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700 disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                "Add Category"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
