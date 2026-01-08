// components/area/AddArea.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const addAreaSchema = z.object({
  name: z.string().min(2, "Area name must be at least 2 characters"),
});

type AddAreaForm = z.infer<typeof addAreaSchema>;

interface AddAreaProps {
  onSuccess: (newArea: { id: string; name: string }) => void;
}

export default function AddArea({ onSuccess }: AddAreaProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddAreaForm>({
    resolver: zodResolver(addAreaSchema),
  });

  const onSubmit = async (data: AddAreaForm) => {
    setLoading(true);
    try {
      const res = await fetch("/api/areas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to add area");
      }

      const newArea = await res.json();
      onSuccess(newArea.area);
      reset();
      setIsOpen(false);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full bg-orange-600 text-white py-3 rounded-2xl font-bold shadow-lg hover:bg-orange-700 transition-all mb-4"
      >
        + Add New Area
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-6">
        <h2 className="text-2xl font-bold text-center">Add New Area</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Area Name
            </label>
            <input
              {...register("name")}
              placeholder="e.g. Andheri West"
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
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Adding...
                </>
              ) : (
                "Add Area"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
