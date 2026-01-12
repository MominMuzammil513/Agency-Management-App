"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom"; // 🔥 Portal added
import { toastManager } from "@/lib/toast-manager";
import { Loader2, Plus, X } from "lucide-react";
import { productSchema, ProductFormData } from "@/lib/zod.schema/products";
import { useRouter } from "next/navigation";
import ImageUploader from "./ImageUploader";

interface Category {
  id: string;
  name: string;
}

interface AddProductProps {
  categories: Category[];
}

export default function AddProduct({ categories }: AddProductProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false); // For hydration safety
  const router = useRouter();

  useEffect(() => setMounted(true), []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      categoryId: "",
      purchasePrice: 0,
      sellingPrice: 0,
      imageUrl: "",
    },
  });

  const imageUrl = watch("imageUrl");

  const onSubmit = async (data: ProductFormData) => {
    setLoading(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed");
      }

      toastManager.success("Product added! 🎉");
      reset();
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
        className="bg-emerald-600 text-white p-3 rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all active:scale-95 flex items-center gap-2"
      >
        <Plus size={20} />{" "}
        <span className="hidden sm:inline font-bold">New</span>
      </button>

      {/* MODAL using Portal */}
      {isOpen &&
        mounted &&
        createPortal(
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-9999 p-4 animate-in fade-in"
            onClick={(e) => {
              // Close only when clicking the backdrop, not the modal content
              if (e.target === e.currentTarget) {
                setIsOpen(false);
              }
            }}
          >
            <div 
              className="bg-white rounded-4xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in zoom-in-95 ring-8 ring-white/20"
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onFocus={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-2 bg-slate-50 text-slate-400 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors"
              >
                <X size={20} />
              </button>

              <div className="p-6">
                <h2 className="text-2xl font-black text-slate-800 text-center mb-6">
                  Add Product 📦
                </h2>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase ml-2 mb-1">
                      Name
                    </label>
                    <input
                      {...register("name")}
                      placeholder="e.g. Lays Classic"
                      className="w-full bg-emerald-50/30 border border-emerald-100 rounded-xl px-4 py-3 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all placeholder:text-slate-300"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-xs mt-1 ml-2 font-bold">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase ml-2 mb-1">
                      Category
                    </label>
                    <select
                      {...register("categoryId")}
                      className="w-full bg-emerald-50/30 border border-emerald-100 rounded-xl px-4 py-3 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all"
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    {errors.categoryId && (
                      <p className="text-red-500 text-xs mt-1 ml-2 font-bold">
                        {errors.categoryId.message}
                      </p>
                    )}
                  </div>

                  {/* Prices Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase ml-2 mb-1">
                        Buy Price
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        {...register("purchasePrice", { 
                          valueAsNumber: true,
                          setValueAs: (value) => {
                            if (value === "" || value === null || value === undefined) return 0;
                            const num = typeof value === "string" ? parseFloat(value) : value;
                            return isNaN(num) ? 0 : Math.round(num * 100) / 100;
                          }
                        })}
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
                        {...register("sellingPrice", { 
                          valueAsNumber: true,
                          setValueAs: (value) => {
                            if (value === "" || value === null || value === undefined) return 0;
                            const num = typeof value === "string" ? parseFloat(value) : value;
                            return isNaN(num) ? 0 : Math.round(num * 100) / 100;
                          }
                        })}
                        className="w-full bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-emerald-700 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Image Uploader */}
                  <ImageUploader
                    value={imageUrl || ""}
                    onChange={(url) => setValue("imageUrl", url)}
                    label="Product Image"
                  />
                  {errors.imageUrl && (
                    <p className="text-red-500 text-xs mt-1 ml-2 font-bold">
                      {errors.imageUrl.message}
                    </p>
                  )}

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
                        "Save Product"
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
