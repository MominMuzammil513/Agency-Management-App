"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { X, User, Building2, Mail, Lock, Phone, Smartphone, Loader2, Trash2 } from "lucide-react";
import {
  UpdateOwnerAdminInput,
  updateOwnerAdminSchema,
} from "@/lib/zod.schema/update-owner-admin";
import { toastManager } from "@/lib/toast-manager";
import { z } from "zod";

interface OwnerAdmin {
  id: string;
  name: string;
  email: string;
  mobile: string;
  altMobile: string | null;
  isActive: boolean;
  agencyName: string;
}

interface EditOwnerAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  ownerAdmin: OwnerAdmin | null;
}

export default function EditOwnerAdminModal({
  isOpen,
  onClose,
  ownerAdmin,
}: EditOwnerAdminModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<UpdateOwnerAdminInput & { agencyName?: string }>({
    resolver: zodResolver(updateOwnerAdminSchema.extend({ agencyName: z.string().optional() })),
  });

  const isActive = watch("isActive");

  useEffect(() => {
    if (ownerAdmin) {
      reset({
        ownerName: ownerAdmin.name,
        agencyName: ownerAdmin.agencyName,
        email: ownerAdmin.email,
        mobile: ownerAdmin.mobile,
        altMobile: ownerAdmin.altMobile || "",
        isActive: ownerAdmin.isActive,
        password: "",
      });
    }
  }, [ownerAdmin, reset]);

  const onSubmit = async (data: UpdateOwnerAdminInput & { agencyName?: string }) => {
    if (!ownerAdmin) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/superadmin/owner/${ownerAdmin.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        // Handle different error types
        let errorMessage = "Failed to update owner admin";
        
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

      toastManager.success(result.message || "Owner admin updated successfully!");
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

  const handleDelete = async () => {
    if (!ownerAdmin) return;
    if (!confirm("Are you sure you want to deactivate this owner admin?")) return;

    try {
      setDeleteLoading(true);
      const res = await fetch(`/api/superadmin/owner/${ownerAdmin.id}`, {
        method: "DELETE",
      });

      const result = await res.json();

      if (!res.ok) {
        const errorMessage = result.message || "Failed to deactivate owner admin";
        toastManager.error(errorMessage);
        return;
      }

      toastManager.success(result.message || "Owner admin deactivated successfully!");
      onClose();
      router.refresh();
    } catch (error: any) {
      // Handle network errors or other unexpected errors
      const errorMessage = error?.message || "Network error. Please check your connection and try again.";
      toastManager.error(errorMessage);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (!isOpen || !ownerAdmin) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-800">Edit Owner Admin</h2>
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
              New Password (Leave empty to keep current)
            </label>
            <input
              type="password"
              {...register("password")}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-purple-500 focus:outline-none transition-colors"
              placeholder="Enter new password (min 8 characters)"
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

          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                {...register("isActive")}
                className="w-5 h-5 rounded border-2 border-slate-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm font-bold text-slate-700">Active Status</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteLoading}
              className="px-4 py-3 bg-red-50 text-red-600 rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {deleteLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Trash2 size={18} />
              )}
              Deactivate
            </button>
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
              {loading ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
