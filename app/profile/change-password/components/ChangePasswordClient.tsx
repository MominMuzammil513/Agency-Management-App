// app/profile/change-password/components/ChangePasswordClient.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { toastManager } from "@/lib/toast-manager";
import { useSession, signOut } from "next-auth/react";

export default function ChangePasswordClient() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      toastManager.error("New passwords do not match");
      return;
    }

    if (formData.newPassword.length < 6) {
      toastManager.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/profile/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Failed to change password");
      }

      toastManager.success("Password changed successfully! 🔒");
      
      // Sign out and redirect to login
      await signOut({ redirect: false, callbackUrl: "/login" });
      router.push("/login?message=Password changed successfully. Please login again.");
      router.refresh();
    } catch (error: any) {
      toastManager.error(error.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-30">
        <div className="px-5 py-4 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="h-10 w-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-black text-slate-800">Change Password</h1>
        </div>
      </div>

      <div className="px-5 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Password */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.current ? "text" : "password"}
                value={formData.currentPassword}
                onChange={(e) =>
                  setFormData({ ...formData, currentPassword: e.target.value })
                }
                required
                className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3.5 pr-12 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() =>
                  setShowPasswords({ ...showPasswords, current: !showPasswords.current })
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600"
              >
                {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? "text" : "password"}
                value={formData.newPassword}
                onChange={(e) =>
                  setFormData({ ...formData, newPassword: e.target.value })
                }
                required
                minLength={6}
                className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3.5 pr-12 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                placeholder="Enter new password (min 6 characters)"
              />
              <button
                type="button"
                onClick={() =>
                  setShowPasswords({ ...showPasswords, new: !showPasswords.new })
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600"
              >
                {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                required
                minLength={6}
                className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3.5 pr-12 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() =>
                  setShowPasswords({
                    ...showPasswords,
                    confirm: !showPasswords.confirm,
                  })
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600"
              >
                {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Changing Password...
              </>
            ) : (
              "Change Password"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
