// app/profile/components/ProfileClient.tsx
"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  Shield,
  Calendar,
  LogOut,
  Edit2,
  Lock,
  CheckCircle2,
  Settings,
} from "lucide-react";
import { toastManager } from "@/lib/toast-manager";
import BackButton from "@/components/ui/BackButton";

interface ProfileClientProps {
  user: {
    id: string;
    name: string;
    email: string;
    mobile: string;
    altMobile: string | null;
    role: string;
    isActive: boolean;
    createdAt: string;
  };
}

export default function ProfileClient({ user }: ProfileClientProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    if (!confirm("Are you sure you want to logout?")) return;
    setLoading(true);
    try {
      await signOut({ redirect: false, callbackUrl: "/login" });
      router.push("/login");
      router.refresh();
    } catch (error) {
      toastManager.error("Failed to logout");
    } finally {
      setLoading(false);
    }
  };

  const roleLabels: Record<string, string> = {
    owner_admin: "Owner/Admin",
    salesman: "Sales Representative",
    delivery_boy: "Delivery Boy",
    super_admin: "Super Admin",
  };

  const roleColors: Record<string, string> = {
    owner_admin: "bg-emerald-100 text-emerald-700",
    salesman: "bg-blue-100 text-blue-700",
    delivery_boy: "bg-orange-100 text-orange-700",
    super_admin: "bg-purple-100 text-purple-700",
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-30">
        <div className="px-5 py-4 flex items-center gap-3">
          <BackButton />
          <h1 className="text-xl font-black text-slate-800">My Profile</h1>
        </div>
      </div>

      <div className="px-5 py-6 space-y-6">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-20 w-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-3xl font-black text-white shadow-lg">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-black text-slate-800 mb-1">
                {user.name}
              </h2>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full ${
                    roleColors[user.role] || "bg-slate-100 text-slate-700"
                  }`}
                >
                  {roleLabels[user.role] || user.role}
                </span>
                {user.isActive && (
                  <span className="flex items-center gap-1 text-xs text-emerald-600 font-bold">
                    <CheckCircle2 size={12} />
                    Active
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Info Grid */}
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl">
              <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center">
                <Mail size={18} className="text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-400 font-bold uppercase mb-0.5">
                  Email
                </p>
                <p className="text-sm font-bold text-slate-700">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl">
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Phone size={18} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-400 font-bold uppercase mb-0.5">
                  Mobile
                </p>
                <p className="text-sm font-bold text-slate-700">
                  {user.mobile}
                </p>
              </div>
            </div>

            {user.altMobile && (
              <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl">
                <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <Phone size={18} className="text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-400 font-bold uppercase mb-0.5">
                    Alternate Mobile
                  </p>
                  <p className="text-sm font-bold text-slate-700">
                    {user.altMobile}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl">
              <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Calendar size={18} className="text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-400 font-bold uppercase mb-0.5">
                  Member Since
                </p>
                <p className="text-sm font-bold text-slate-700">
                  {new Date(user.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => router.push("/profile/edit")}
            className="w-full bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-slate-100 hover:border-emerald-200 transition-colors group"
          >
            <div className="h-10 w-10 bg-emerald-50 rounded-full flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
              <Edit2 size={18} className="text-emerald-600" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-bold text-slate-800 text-sm">Edit Profile</p>
              <p className="text-xs text-slate-400">Update your information</p>
            </div>
          </button>

          <button
            onClick={() => router.push("/profile/change-password")}
            className="w-full bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-slate-100 hover:border-blue-200 transition-colors group"
          >
            <div className="h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors">
              <Lock size={18} className="text-blue-600" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-bold text-slate-800 text-sm">
                Change Password
              </p>
              <p className="text-xs text-slate-400">Update your password</p>
            </div>
          </button>

          {user.role === "owner_admin" && (
            <button
              onClick={() => router.push("/admin/more")}
              className="w-full bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-slate-100 hover:border-emerald-200 transition-colors group"
            >
              <div className="h-10 w-10 bg-emerald-50 rounded-full flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                <Settings size={18} className="text-emerald-600" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-bold text-slate-800 text-sm">Admin Panel</p>
                <p className="text-xs text-slate-400">Manage staff & settings</p>
              </div>
            </button>
          )}

          <button
            onClick={handleLogout}
            disabled={loading}
            className="w-full bg-red-50 rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-red-100 hover:bg-red-100 transition-colors group disabled:opacity-50"
          >
            <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center group-hover:bg-red-200 transition-colors">
              <LogOut size={18} className="text-red-600" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-bold text-red-700 text-sm">Logout</p>
              <p className="text-xs text-red-400">Sign out of your account</p>
            </div>
            {loading && (
              <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
