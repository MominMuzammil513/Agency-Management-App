"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  Lock,
  Mail,
  Phone,
  Smartphone,
  User,
  Shield,
} from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import {
  CreateOwnerAdminInput,
  createOwnerAdminSchema,
} from "@/lib/zod.schema/create-owner-admin";

const OwnerAdminForm = () => {
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateOwnerAdminInput>({
    resolver: zodResolver(createOwnerAdminSchema),
  });

  const onSubmit = async (data: CreateOwnerAdminInput) => {
    try {
      setLoading(true);
      setServerError(null);

      const res = await fetch("/api/auth/create-owner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        setServerError(result.message || "Something went wrong");
        return;
      }

      alert("Owner admin created successfully");
    } catch {
      setServerError("Server not reachable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="w-full max-w-md bg-slate-800 rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Create Agency Owner</h1>
          <p className="text-slate-400 mt-1">Owner admin setup</p>
        </div>

        {serverError && (
          <div className="bg-red-900/40 border border-red-500 text-red-300 p-3 rounded-lg text-sm text-center">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <InputField label="Owner Name" icon={<User size={18} />}>
            <input {...register("ownerName")} className="input" />
            {errors.ownerName && (
              <ErrorText>{errors.ownerName.message}</ErrorText>
            )}
          </InputField>

          <InputField label="Agency Name" icon={<Shield size={18} />}>
            <input {...register("agencyName")} className="input" />
            {errors.agencyName && (
              <ErrorText>{errors.agencyName.message}</ErrorText>
            )}
          </InputField>

          <InputField label="Email" icon={<Mail size={18} />}>
            <input type="email" {...register("email")} className="input" />
            {errors.email && <ErrorText>{errors.email.message}</ErrorText>}
          </InputField>

          <InputField label="Password" icon={<Lock size={18} />}>
            <input
              type="password"
              {...register("password")}
              className="input"
            />
            {errors.password && (
              <ErrorText>{errors.password.message}</ErrorText>
            )}
          </InputField>

          <InputField label="Mobile" icon={<Phone size={18} />}>
            <input {...register("mobile")} className="input" />
            {errors.mobile && <ErrorText>{errors.mobile.message}</ErrorText>}
          </InputField>

          <InputField
            label="Alt Mobile (optional)"
            icon={<Smartphone size={18} />}
          >
            <input {...register("altMobile")} className="input" />
            {errors.altMobile && (
              <ErrorText>{errors.altMobile.message}</ErrorText>
            )}
          </InputField>

          <button
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading && <Loader2 className="animate-spin" size={18} />}
            {loading ? "Creating..." : "Create Owner"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OwnerAdminForm;

/* ───────────────────────── HELPERS ───────────────────────── */

function InputField({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
        {icon}
        {label}
      </label>
      {children}
    </div>
  );
}

function ErrorText({ children }: { children?: string }) {
  return <p className="text-red-400 text-sm">{children}</p>;
}
