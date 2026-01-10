"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Loader2, Eye, EyeOff } from "lucide-react"; // ✅ Imported Eye Icons
import { createPortal } from "react-dom";
import { useEffect, useState, useMemo } from "react";
import { createStaffSchema } from "@/lib/zod.schema/create-staff";
import { FormError } from "./FormError";
import * as z from "zod";
import { StaffFormData } from "./types";

interface StaffFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: StaffFormData) => Promise<void>;
  initialData?: Partial<StaffFormData>;
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
  const [showPassword, setShowPassword] = useState(false); // ✅ Toggle State

  useEffect(() => setMounted(true), []);

  // 🔹 Dynamic Schema: Handles "Optional Password" logic for Edit Mode
  const dynamicSchema = useMemo(() => {
    if (isEdit) {
      // Create a relaxed schema for Edit
      // We assume createStaffSchema is an object schema
      if (createStaffSchema instanceof z.ZodObject) {
        return createStaffSchema
          .extend({
            password: z.string().optional(), // Allow empty/undefined initially
          })
          .refine(
            (data) => {
              // If user typed a password, it must be >= 6 chars
              if (data.password && data.password.length > 0 && data.password.length < 6) {
                return false;
              }
              return true;
            },
            { message: "Password must be at least 6 characters", path: ["password"] }
          );
      }
    }
    // Create Mode: Strict (Password required)
    return createStaffSchema;
  }, [isEdit]);

  const form = useForm<StaffFormData>({
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

  const handleSubmitWrapper = async (data: StaffFormData) => {
    setLoading(true);
    // If editing and password is empty string, make it undefined so backend ignores it
    if (isEdit && data.password === "") {
      delete data.password;
    }
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
          {isEdit ? "Update Profile ✏️" : "New Member ✨"}
        </h2>

        <form onSubmit={handleSubmit(handleSubmitWrapper)} className="space-y-4">
          
          {/* Name Field */}
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

          {/* Email Field (Now Editable) */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase ml-2">
              Email (Login ID)
            </label>
            <input
              {...register("email")}
              type="email"
              // ✅ Removed disabled={isEdit} so admin can update email
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-emerald-400 outline-none transition-all"
              placeholder="rahul@agency.com"
            />
            <FormError error={errors.email} />
          </div>

          {/* Password Field (With Show/Hide) */}
          <div className="relative">
            <label className="text-xs font-bold text-slate-400 uppercase ml-2">
              {isEdit ? "New Password (Optional)" : "Password"}
            </label>
            <div className="relative">
              <input
                {...register("password")}
                // ✅ Toggle Type based on state
                type={showPassword ? "text" : "password"} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-emerald-400 outline-none transition-all pr-12"
                placeholder={isEdit ? "Leave blank to keep current" : "••••••••"}
              />
              {/* ✅ Eye Button */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors p-2 rounded-full hover:bg-slate-100"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <FormError error={errors.password} />
          </div>

          {/* Mobile Fields */}
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

          {/* Role Selection */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase ml-2">
              Role
            </label>
            <select
              {...register("role")}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-emerald-400 outline-none transition-all appearance-none cursor-pointer"
            >
              <option value="salesman">Sales Person</option>
              <option value="delivery_boy">Delivery Boy</option>
            </select>
            <FormError error={errors.role} />
          </div>

          {/* Buttons */}
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