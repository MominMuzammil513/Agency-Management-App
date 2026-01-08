"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Edit } from "lucide-react";
import { useRouter } from "next/navigation";
import { productSchema, ProductFormData } from "@/lib/zod.schema/products";

export interface ProductEditType {
  id: string;
  name: string;
  categoryId: string;
  agencyId: string;
  purchasePrice: number;
  sellingPrice: number;
  imageUrl: string | null; // ✅ allow null
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
  const router = useRouter();

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
      if (!res.ok) throw new Error("Failed to update product");
      toast.success("Product updated");
      setIsOpen(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="text-blue-600 hover:text-blue-800 flex justify-between items-center gap-x-2"
      >
        <Edit size={18} /> <span className="text-base font-semibold">Edit</span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 sm:p-6">
          <div className="bg-white rounded-2xl w-full max-w-lg h-auto max-h-[90vh] overflow-y-auto shadow-2xl border border-orange-100">
            {/* Header */}
            <div className="sticky top-0 bg-white px-6 py-5 border-b border-slate-200 z-10">
              <h2 className="text-2xl font-bold text-slate-800 text-center">
                Edit Product
              </h2>
            </div>

            {/* Form */}
            <div className="px-6 py-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Product Name
                  </label>
                  <input
                    {...register("name")}
                    placeholder="e.g. Lays Classic"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3.5 text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-2">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Category
                  </label>
                  <select
                    {...register("categoryId")}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {errors.categoryId && (
                    <p className="text-red-500 text-sm mt-2">
                      {errors.categoryId.message}
                    </p>
                  )}
                </div>

                {/* Purchase Price */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Purchase Price (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register("purchasePrice", { valueAsNumber: true })}
                    placeholder="0.00"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3.5 text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                  />
                  {errors.purchasePrice && (
                    <p className="text-red-500 text-sm mt-2">
                      {errors.purchasePrice.message}
                    </p>
                  )}
                </div>

                {/* Selling Price */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Selling Price (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register("sellingPrice", { valueAsNumber: true })}
                    placeholder="0.00"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3.5 text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                  />
                  {errors.sellingPrice && (
                    <p className="text-red-500 text-sm mt-2">
                      {errors.sellingPrice.message}
                    </p>
                  )}
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Image URL
                  </label>
                  <input
                    type="url"
                    {...register("imageUrl")}
                    placeholder="https://example.com/image.jpg"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3.5 text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                  />
                  {errors.imageUrl && (
                    <p className="text-red-500 text-sm mt-2">
                      {errors.imageUrl.message}
                    </p>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 border border-slate-300 text-slate-700 py-3.5 rounded-xl font-medium hover:bg-slate-100 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Updating...
                      </>
                    ) : (
                      "Update Product"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
