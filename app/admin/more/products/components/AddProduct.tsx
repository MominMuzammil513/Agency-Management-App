"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import { productSchema, ProductFormData } from "@/lib/zod.schema/products";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      categoryId: "",
      purchasePrice: 0,
      sellingPrice: 0,
      imageUrl: "https://via.placeholder.com/150", // ✅ default so validation never blocks
    },
  });

  const onSubmit = async (data: ProductFormData) => {
    console.log("Submitting product:", data); // ✅ debug log
    setLoading(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          purchasePrice: Number(data.purchasePrice),
          sellingPrice: Number(data.sellingPrice),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to add product");
      }

      toast.success("Product added successfully!");
      reset();
      setIsOpen(false);
      router.refresh(); // ✅ Next.js way to refresh
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
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
        <Plus size={20} /> Add New Product
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-6">
        <h2 className="text-2xl font-bold text-center">Add New Product</h2>

        {/* ✅ Only ONE form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Product Name
            </label>
            <input
              {...register("name")}
              placeholder="e.g. Lays Classic"
              className="w-full border rounded-xl px-4 py-3.5"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-2">{errors.name.message}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Category
            </label>
            <select
              {...register("categoryId")}
              className="w-full border rounded-xl px-4 py-3.5"
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
              className="w-full border rounded-xl px-4 py-3.5"
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
              className="w-full border rounded-xl px-4 py-3.5"
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
              className="w-full border rounded-xl px-4 py-3.5"
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
              className="flex-1 border py-3.5 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-orange-600 text-white py-3.5 rounded-xl"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Adding...
                </>
              ) : (
                "Add Product"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
