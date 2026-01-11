"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { toastManager } from "@/lib/toast-manager";
import { Loader2, Edit, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { productSchema, ProductFormData } from "@/lib/zod.schema/products";

export interface ProductEditType {
  id: string;
  name: string;
  categoryId: string;
  agencyId: string;
  purchasePrice: number;
  sellingPrice: number;
  imageUrl: string | null;
}

export default function EditProduct({
  product,
  categories,
}: {
  product: ProductEditType;
  categories: { id: string; name: string }[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => setMounted(true), []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product.name,
      categoryId: product.categoryId,
      purchasePrice: product.purchasePrice,
      sellingPrice: product.sellingPrice,
      imageUrl: product.imageUrl ?? "https://via.placeholder.com/150",
    },
  });

  const onSubmit = async (data: ProductFormData) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed");
      toastManager.success("Updated successfully! ✨");
      setIsOpen(false);
      router.refresh();
    } catch (err: any) {
      toastManager.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-slate-500 hover:text-emerald-600 flex items-center gap-3 w-full px-3 py-2 text-sm font-medium transition-colors"
      >
        <Edit size={16} /> Edit
      </button>

      {/* MODAL */}
      {isOpen &&
        mounted &&
        createPortal(
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-9999 p-4 animate-in fade-in">
            <div className="bg-white rounded-4xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in zoom-in-95 ring-8 ring-white/20">
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-2 bg-slate-50 text-slate-400 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors"
              >
                <X size={20} />
              </button>

              <div className="p-6">
                <h2 className="text-2xl font-black text-slate-800 text-center mb-6">
                  Edit Product ✏️
                </h2>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase ml-2 mb-1">
                      Name
                    </label>
                    <input
                      {...register("name")}
                      className="w-full bg-emerald-50/30 border border-emerald-100 rounded-xl px-4 py-3 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase ml-2 mb-1">
                      Category
                    </label>
                    <select
                      {...register("categoryId")}
                      className="w-full bg-emerald-50/30 border border-emerald-100 rounded-xl px-4 py-3 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Prices */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase ml-2 mb-1">
                        Buy Price
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        {...register("purchasePrice", { valueAsNumber: true })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-emerald-500 uppercase ml-2 mb-1">
                        Sell Price
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        {...register("sellingPrice", { valueAsNumber: true })}
                        className="w-full bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-emerald-700 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Image URL */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase ml-2 mb-1">
                      Image URL
                    </label>
                    <input
                      type="url"
                      {...register("imageUrl")}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>

                  {/* Buttons */}
                  <div className="pt-4 flex gap-3">
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
                        "Update"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
