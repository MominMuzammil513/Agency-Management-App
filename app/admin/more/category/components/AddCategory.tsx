"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom"; // 🔥 Portal
import { toast } from "sonner";
import { Loader2, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";

const addCategorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
});

type AddCategoryForm = z.infer<typeof addCategorySchema>;

export default function AddCategory() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => setMounted(true), []);

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
        throw new Error("Failed to add category");
      }

      reset();
      setIsOpen(false);
      toast.success("Category added successfully ✨");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-emerald-600 text-white px-5 py-3 rounded-2xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 active:scale-95 transition-all flex items-center gap-2"
      >
        <Plus size={20} /> <span className="hidden sm:inline">New</span>
      </button>

      {isOpen &&
        mounted &&
        createPortal(
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-in fade-in">
            <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-8 shadow-2xl relative animate-in zoom-in-95 ring-8 ring-white/20">
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-5 right-5 p-2 bg-slate-50 text-slate-400 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors"
              >
                <X size={20} />
              </button>

              <h2 className="text-2xl font-black text-slate-800 text-center mb-8">
                New Category 📦
              </h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase ml-2 mb-1">
                    Category Name
                  </label>
                  <input
                    {...register("name")}
                    placeholder="e.g. Snacks"
                    autoFocus
                    className="w-full bg-emerald-50/50 border-2 border-emerald-100 rounded-2xl px-5 py-3.5 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all placeholder:text-slate-300"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1 ml-2 font-bold">
                      {errors.name.message}
                    </p>
                  )}
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
                    className="flex-1 bg-emerald-600 text-white py-3.5 rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      "Save"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
