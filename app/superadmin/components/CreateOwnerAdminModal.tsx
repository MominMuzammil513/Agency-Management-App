"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { X, User, Building2, Mail, Lock, Phone, Smartphone, Loader2 } from "lucide-react";
import {
  CreateOwnerAdminInput,
  createOwnerAdminSchema,
} from "@/lib/zod.schema/create-owner-admin";
import { toastManager } from "@/lib/toast-manager";

interface CreateOwnerAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateOwnerAdminModal({
  isOpen,
  onClose,
}: CreateOwnerAdminModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateOwnerAdminInput>({
    resolver: zodResolver(createOwnerAdminSchema),
  });

  const onSubmit = async (data: CreateOwnerAdminInput) => {
    try {
      setLoading(true);
      const res = await fetch("/api/auth/create-owner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        // Handle different error types
        let errorMessage = "Failed to create owner admin";
        
        if (result.type === "VALIDATION_ERROR" && result.errors) {
          // Handle Zod validation errors
          const errorFields = Object.keys(result.errors);
          errorMessage = `Validation error: ${errorFields.map(field => {
            const fieldErrors = result.errors[field];
            return `${field}: ${Array.isArray(fieldErrors) ? fieldErrors[0] : fieldErrors}`;
          }).join(", ")}`;
        } else if (result.message) {
          errorMessage = result.message;
        }
        
        toastManager.error(errorMessage);
        return;
      }

      toastManager.success(result.message || "Owner admin created successfully!");
      reset();
      onClose();
      router.refresh();
    } catch (error: any) {
      // Handle network errors or other unexpected errors
      const errorMessage = error?.message || "Network error. Please check your connection and try again.";
      toastManager.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-800">Create Owner Admin</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl transition-colors"
          >
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
              <User size={16} />
              Owner Name
            </label>
            <input
              {...register("ownerName")}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-purple-500 focus:outline-none transition-colors"
              placeholder="Enter owner name"
            />
            {errors.ownerName && (
              <p className="text-red-500 text-xs mt-1">{errors.ownerName.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
              <Building2 size={16} />
              Agency Name
            </label>
            <input
              {...register("agencyName")}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-purple-500 focus:outline-none transition-colors"
              placeholder="Enter agency name"
            />
            {errors.agencyName && (
              <p className="text-red-500 text-xs mt-1">{errors.agencyName.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
              <Mail size={16} />
              Email
            </label>
            <input
              type="email"
              {...register("email")}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-purple-500 focus:outline-none transition-colors"
              placeholder="Enter email"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
              <Lock size={16} />
              Password
            </label>
            <input
              type="password"
              {...register("password")}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-purple-500 focus:outline-none transition-colors"
              placeholder="Enter password (min 8 characters)"
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
              <Phone size={16} />
              Mobile
            </label>
            <input
              {...register("mobile")}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-purple-500 focus:outline-none transition-colors"
              placeholder="Enter 10-digit mobile"
            />
            {errors.mobile && (
              <p className="text-red-500 text-xs mt-1">{errors.mobile.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
              <Smartphone size={16} />
              Alt Mobile (Optional)
            </label>
            <input
              {...register("altMobile")}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-purple-500 focus:outline-none transition-colors"
              placeholder="Enter alternate mobile"
            />
            {errors.altMobile && (
              <p className="text-red-500 text-xs mt-1">{errors.altMobile.message}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
