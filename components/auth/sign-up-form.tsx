"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, SignupInput } from "@/lib/zod.schema/signup.schema";
import { useState } from "react";
import {
  Mail,
  User,
  Lock,
  Phone,
  Smartphone,
  Shield,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

export default function SignupForm() {
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupInput) => {
    setLoading(true);
    setServerError(null);

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    setLoading(false);

    if (!res.ok) {
      const err = await res.json();
      setServerError(err.message || "Signup failed");
      return;
    }

    toast.success("Account created successfully! Redirecting to login...");
    setTimeout(() => {
      window.location.href = "/login";
    }, 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md bg-slate-900 rounded-2xl shadow-2xl p-8 space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Create Account</h1>
          <p className="text-slate-400 mt-2">Sign up to manage your agency</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Server Error */}
          {serverError && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-xl text-sm text-center">
              {serverError}
            </div>
          )}

          {/* Email */}
          <InputField
            label="Email"
            icon={<Mail size={18} className="text-slate-400" />}
            error={errors.email?.message}
          >
            <input
              {...register("email")}
              type="email"
              placeholder="super@admin.com"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
            />
          </InputField>

          {/* Username */}
          <InputField
            label="Username"
            icon={<User size={18} className="text-slate-400" />}
            error={errors.username?.message}
          >
            <input
              {...register("username")}
              placeholder="superadmin"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
            />
          </InputField>

          {/* Password */}
          <InputField
            label="Password"
            icon={<Lock size={18} className="text-slate-400" />}
            error={errors.password?.message}
          >
            <input
              {...register("password")}
              type="password"
              placeholder="••••••••"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
            />
          </InputField>

          {/* Full Name */}
          <InputField
            label="Full Name"
            icon={<User size={18} className="text-slate-400" />}
            error={errors.name?.message}
          >
            <input
              {...register("name")}
              placeholder="Super Admin"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
            />
          </InputField>

          {/* Mobile */}
          <InputField
            label="Mobile Number"
            icon={<Phone size={18} className="text-slate-400" />}
            error={errors.mobile?.message}
          >
            <input
              {...register("mobile")}
              type="tel"
              placeholder="9999999999"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
            />
          </InputField>

          {/* Alt Mobile */}
          <InputField
            label="Alternative Mobile (optional)"
            icon={<Smartphone size={18} className="text-slate-400" />}
            error={errors.altMobile?.message}
          >
            <input
              {...register("altMobile")}
              type="tel"
              placeholder="8888888888"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
            />
          </InputField>

          {/* Role */}
          <InputField
            label="Role"
            icon={<Shield size={18} className="text-slate-400" />}
            error={errors.role?.message}
          >
            <select
              {...register("role")}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
            >
              <option value="super_admin">Super Admin</option>
              <option value="owner_admin">Owner Admin</option>
              <option value="salesman">Sales Person</option>
              <option value="delivery_boy">Delivery Boy</option>
            </select>
          </InputField>

          {/* Submit Button */}
          <button
            disabled={loading}
            type="submit"
            className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-3 text-lg"
          >
            {loading ? (
              <>
                <Loader2 size={22} className="animate-spin" />
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center text-slate-400 text-sm">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-orange-500 hover:underline font-medium"
          >
            Login here
          </a>
        </p>
      </div>
    </div>
  );
}

// Reusable Input Field with Icon & Error
function InputField({
  label,
  icon,
  error,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
        {icon}
        {label}
      </label>
      {children}
      {error && <p className="text-red-400 text-sm">{error}</p>}
    </div>
  );
}
