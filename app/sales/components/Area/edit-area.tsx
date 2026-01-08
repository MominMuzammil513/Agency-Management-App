// components/area/EditArea.tsx (Similar to AddArea)
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Edit } from "lucide-react";

const editAreaSchema = z.object({
  name: z.string().min(2, "Area name must be at least 2 characters"),
});

type EditAreaForm = z.infer<typeof editAreaSchema>;

interface EditAreaProps {
  area: { id: string; name: string };
  onSuccess: (updatedArea: { id: string; name: string }) => void;
}

export default function EditArea({ area, onSuccess }: EditAreaProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditAreaForm>({
    resolver: zodResolver(editAreaSchema),
    defaultValues: { name: area.name },
  });

  const onSubmit = async (data: EditAreaForm) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/areas?id=${area.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Update failed");

      const updated = await res.json();
      onSuccess(updated.area);
      setIsOpen(false);
    } catch (err) {
      toast.error("Failed to update area");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-blue-600 hover:text-blue-800"
      >
        <Edit size={18} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-6">
            <h2 className="text-2xl font-bold text-center">Edit Area</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Area Name
                </label>
                <input
                  {...register("name")}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-2">
                    {errors.name.message}
                  </p>
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
                    "Update"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
