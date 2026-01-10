"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Loader2, Eye, EyeOff } from "lucide-react";
import { createPortal } from "react-dom";
import { useEffect, useState, useMemo } from "react";
import {
  createStaffSchema,
  CreateStaffInput,
} from "@/lib/zod.schema/create-staff";
import { FormError } from "./FormError";
import * as z from "zod";

interface StaffFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateStaffInput) => void;
  initialData?: Partial<CreateStaffInput>;
  isEdit?: boolean;
}

export default function StaffFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = {},
  isEdit = false,
}: StaffFormModalProps) {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // 👁️ Show Password State

  useEffect(() => setMounted(true), []);

  // 🔥 Fix: Edit mode mein Password required nahi hona chahiye
  // Hum dynamically schema change kar rahe hain
  const dynamicSchema = useMemo(() => {
    if (isEdit) {
      // Agar Edit hai to password field ko schema se hata do
      // Note: createStaffSchema must be a z.object() for .omit to work
      // Agar .omit error de, to check karo ki schema z.object hai ya nahi
      return (createStaffSchema as any).omit({ password: true });
    }
    return createStaffSchema;
  }, [isEdit]);

  const form = useForm<CreateStaffInput>({
    resolver: zodResolver(dynamicSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      mobile: "",
      altMobile: "",
      role: "salesman",
      ...initialData,
    },
  });

  const handleSubmitWrapper = async (data: CreateStaffInput) => {
    setLoading(true);
    await onSubmit(data);
    setLoading(false);
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-in fade-in">
      <div className="bg-white rounded-[2.5rem] max-w-md w-full p-8 shadow-2xl relative animate-in zoom-in-95 ring-8 ring-white/20 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 bg-slate-50 text-slate-400 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-black text-center text-slate-800 mb-6">
          {isEdit ? "Update Member ✏️" : "New Member ✨"}
        </h2>

        <form
          onSubmit={handleSubmit(handleSubmitWrapper)}
          className="space-y-4"
        >
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase ml-2">
              Full Name
            </label>
            <input
              {...register("name")}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-emerald-400 outline-none transition-all"
              placeholder="e.g. Rahul Sharma"
            />
            <FormError error={errors.name} />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase ml-2">
              Email (Login ID)
            </label>
            <input
              {...register("email")}
              type="email"
              disabled={isEdit} // 🔒 Email edit mat karne do (consistency ke liye)
              className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-emerald-400 outline-none transition-all ${
                isEdit ? "opacity-60 cursor-not-allowed" : ""
              }`}
              placeholder="rahul@agency.com"
            />
            <FormError error={errors.email} />
          </div>

          {/* 👁️ Password Field with Show/Hide Toggle */}
          {!isEdit && (
            <div className="relative">
              <label className="text-xs font-bold text-slate-400 uppercase ml-2">
                Password
              </label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-emerald-400 outline-none transition-all pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <FormError error={errors.password} />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase ml-2">
                Mobile
              </label>
              <input
                {...register("mobile")}
                type="tel"
                maxLength={10}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-emerald-400 outline-none transition-all"
                placeholder="9876..."
              />
              <FormError error={errors.mobile} />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase ml-2">
                Alt (Opt)
              </label>
              <input
                {...register("altMobile")}
                type="tel"
                maxLength={10}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-emerald-400 outline-none transition-all"
                placeholder="Optional"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase ml-2">
              Role
            </label>
            <select
              {...register("role")}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-emerald-400 outline-none transition-all appearance-none"
            >
              <option value="salesman">Sales Person</option>
              <option value="delivery_boy">Delivery Boy</option>
            </select>
            <FormError error={errors.role} />
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-emerald-600 text-white py-3.5 rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : isEdit ? (
                "Update"
              ) : (
                "Create"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
