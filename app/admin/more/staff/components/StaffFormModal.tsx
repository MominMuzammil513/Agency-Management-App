"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";

import {
  createStaffSchema,
  CreateStaffInput,
} from "@/lib/zod.schema/create-staff";
import { FormError } from "./FormError";

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
  const form = useForm<CreateStaffInput>({
    resolver: zodResolver(createStaffSchema),
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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-5">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">
            {isEdit ? "Update Staff" : "Add New Staff"}
          </h2>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium">Full Name *</label>
            <input
              {...register("name")}
              className="w-full border p-2 rounded-lg"
            />
            <FormError error={errors.name} />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium">
              Email (Username) *
            </label>
            <input
              {...register("email")}
              type="email"
              className="w-full border p-2 rounded-lg"
            />
            <FormError error={errors.email} />
          </div>
          <div>
            <label className="block text-sm font-medium">Password *</label>
            <input
              {...register("password")}
              type="password"
              className="w-full border p-2 rounded-lg"
            />
            <FormError error={errors.password} />
          </div>

          {/* Mobile */}
          <div>
            <label className="block text-sm font-medium">Mobile *</label>
            <input
              {...register("mobile")}
              type="tel"
              maxLength={10}
              className="w-full border p-2 rounded-lg"
            />
            <FormError error={errors.mobile} />
          </div>

          {/* Alt Mobile */}
          <div>
            <label className="block text-sm font-medium">
              Alt Mobile (optional)
            </label>
            <input
              {...register("altMobile")}
              type="tel"
              maxLength={10}
              className="w-full border p-2 rounded-lg"
            />
            <FormError error={errors.altMobile} />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium">Role *</label>
            <select
              {...register("role")}
              className="w-full border p-2 rounded-lg"
            >
              <option value="salesman">Sales Person</option>
              <option value="delivery_boy">Delivery Boy</option>
            </select>
            <FormError error={errors.role} />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border p-2 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-orange-600 text-white p-2 rounded-lg hover:bg-orange-700"
            >
              {isEdit ? "Update" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
