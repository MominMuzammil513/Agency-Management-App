"use client";

import { useRouter } from "next/navigation";
import { useState, FormEvent, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Shield, Lock, AlertCircle, Loader2 } from "lucide-react";
import { toastManager } from "@/lib/toast-manager";

export default function SuperAdminPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // 🔑 Hardcoded password constant
  const CORRECT_PASSWORD = "alhamdullilah";

  // Check authentication
  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/login");
      return;
    }

    // Check if user is super_admin
    if (session.user?.role !== "super_admin") {
      router.push("/unauthorized");
      return;
    }
  }, [session, status, router]);

  // Show loading while checking session
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated or not super_admin
  if (!session || session.user?.role !== "super_admin") {
    return null;
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (password === CORRECT_PASSWORD) {
        // ✅ Redirect if password matches
        toastManager.success("Access granted!");
        setTimeout(() => {
          router.push("/superadmin/alhamdullilah");
        }, 500);
      } else {
        // ❌ Show error if password is wrong
        setError("Incorrect password. Please try again.");
        setPassword("");
        toastManager.error("Incorrect password");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      toastManager.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 flex items-center justify-center p-6">
      <div className="bg-white/90 backdrop-blur-xl rounded-4xl p-8 md:p-12 shadow-2xl border border-purple-100/50 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Shield size={32} className="text-white" strokeWidth={2.5} />
            </div>
          </div>
          <h1 className="text-3xl font-black text-slate-800 mb-2">
            Super Admin Access
          </h1>
          <p className="text-slate-600 text-sm font-medium">
            Enter your password to continue
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2"
            >
              <Lock size={16} className="text-purple-600" />
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              className={`w-full px-4 py-3 rounded-2xl border-2 transition-all focus:outline-none focus:ring-4 focus:ring-purple-100 ${
                error
                  ? "border-red-300 bg-red-50"
                  : "border-slate-200 bg-slate-50 focus:border-purple-400"
              }`}
              placeholder="Enter password"
              required
              disabled={loading}
              autoFocus
            />
            {error && (
              <div className="mt-2 flex items-center gap-2 text-red-600 text-sm font-medium">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3.5 px-6 rounded-2xl font-bold text-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <Shield size={20} />
                <span>Access Dashboard</span>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-400">
            Protected area • Super Admin only
          </p>
        </div>
      </div>
    </div>
  );
}
