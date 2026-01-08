"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Edit } from "lucide-react";
import {
  updateStockFormSchema,
  UpdateStockFormData,
} from "@/lib/zod.schema/stock.schema";

interface UpdateStockProps {
  productId: string;
  currentQuantity: number;
}

export default function UpdateStock({
  productId,
  currentQuantity,
}: UpdateStockProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<UpdateStockFormData>({
    // 🔥 FIX: 'as any' zaroori hai TypeScript error hatane ke liye
    resolver: zodResolver(updateStockFormSchema) as any,
    defaultValues: {
      quantity: 1,
      type: "increase",
      reason: "",
    },
  });

  const watchType = watch("type");

  const onSubmit = async (data: UpdateStockFormData) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        productId,
      };

      const res = await fetch("/api/stock", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to update stock");

      toast.success("Stock updated successfully");
      setIsOpen(false);
      window.location.reload();
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
        className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors"
      >
        <Edit size={20} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="bg-white px-6 py-5 border-b border-slate-200">
              <h2 className="text-2xl font-bold text-center text-slate-800">
                Update Stock
              </h2>
              <p className="text-center text-slate-500 text-sm mt-1">
                Current: {currentQuantity} units
              </p>
            </div>

            <div className="px-6 py-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Action
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="cursor-pointer">
                      <input
                        type="radio"
                        value="increase"
                        {...register("type")}
                        className="peer sr-only"
                      />
                      <div className="text-center py-3 rounded-xl border-2 border-slate-200 peer-checked:border-blue-500 peer-checked:bg-blue-50 peer-checked:text-blue-700 font-medium transition-all">
                        Increase (+)
                      </div>
                    </label>
                    <label className="cursor-pointer">
                      <input
                        type="radio"
                        value="decrease"
                        {...register("type")}
                        className="peer sr-only"
                      />
                      <div className="text-center py-3 rounded-xl border-2 border-slate-200 peer-checked:border-red-500 peer-checked:bg-red-50 peer-checked:text-red-700 font-medium transition-all">
                        Decrease (-)
                      </div>
                    </label>
                  </div>
                  {errors.type && (
                    <p className="text-red-500 text-sm mt-2">
                      {errors.type.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    {...register("quantity")}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  {errors.quantity && (
                    <p className="text-red-500 text-sm mt-2">
                      {errors.quantity.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Reason
                  </label>
                  <input
                    {...register("reason")}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. Manual Adjustment"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 border border-slate-300 text-slate-700 py-3.5 rounded-xl font-medium hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`flex-1 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 ${
                      watchType === "increase"
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-red-600 hover:bg-red-700"
                    } disabled:opacity-70`}
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
        </div>
      )}
    </>
  );
}
