// app/owner-admin/stock/components/AddStock.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toastManager } from "@/lib/toast-manager";
import { Loader2, Plus } from "lucide-react";
import {
  addStockFormSchema,
  AddStockFormData,
} from "@/lib/zod.schema/stock.schema";

interface AddStockProps {
  productId: string;
  categoryId: string;
}

export default function AddStock({ productId, categoryId }: AddStockProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddStockFormData>({
    // 🔥 CRITICAL FIX: 'as any' is required here to bypass the strict type mismatch
    // between Zod's coercion (accepts strings) and HookForm's type (expects numbers).
    resolver: zodResolver(addStockFormSchema) as any,
    defaultValues: {
      quantity: 1,
      reason: "",
    },
  });

  const onSubmit = async (data: AddStockFormData) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        productId,
        categoryId,
      };

      const res = await fetch("/api/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Failed to add stock");
      }

      toastManager.success(`Added ${data.quantity} units successfully!`);
      reset();
      setIsOpen(false);
      router.refresh();
    } catch (err: any) {
      console.error(err);
      toastManager.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const onError = (e: any) => {
    console.log("Form Validation Errors:", e);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-medium shadow transition-all flex items-center gap-2"
      >
        <Plus size={18} />
        Add
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md h-auto shadow-2xl overflow-hidden">
            <div className="bg-white px-6 py-5 border-b border-slate-200">
              <h2 className="text-2xl font-bold text-center text-slate-800">
                Add New Stock
              </h2>
            </div>

            <div className="px-6 py-6">
              <form
                onSubmit={handleSubmit(onSubmit, onError)}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Quantity to Add
                  </label>
                  <input
                    type="number"
                    {...register("quantity")}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Enter quantity"
                  />
                  {errors.quantity && (
                    <p className="text-red-500 text-sm mt-2">
                      {errors.quantity.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Reason (optional)
                  </label>
                  <input
                    {...register("reason")}
                    placeholder="e.g. New purchase"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

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
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      "Confirm Add"
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
