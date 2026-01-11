// app/profile/edit/components/EditProfileClient.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import { toastManager } from "@/lib/toast-manager";
import { useSession } from "next-auth/react";

interface EditProfileClientProps {
  user: {
    id: string;
    name: string;
    email: string;
    mobile: string;
    altMobile: string | null;
  };
}

export default function EditProfileClient({ user }: EditProfileClientProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    mobile: user.mobile,
    altMobile: user.altMobile || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Failed to update profile");
      }

      toastManager.success("Profile updated successfully! ✨");
      router.push("/profile");
      router.refresh();
    } catch (error: any) {
      toastManager.error(error.message || "Failed to update profile");
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
          <h1 className="text-xl font-black text-slate-800">Edit Profile</h1>
        </div>
      </div>

      <div className="px-5 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">
              Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
              placeholder="Enter your name"
            />
          </div>

          {/* Email (Read-only) */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">
              Email
            </label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-500 font-bold cursor-not-allowed"
            />
            <p className="text-xs text-slate-400 mt-1">
              Email cannot be changed
            </p>
          </div>

          {/* Mobile */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">
              Mobile Number
            </label>
            <input
              type="tel"
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              required
              className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
              placeholder="Enter mobile number"
            />
          </div>

          {/* Alternate Mobile */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">
              Alternate Mobile (Optional)
            </label>
            <input
              type="tel"
              value={formData.altMobile}
              onChange={(e) => setFormData({ ...formData, altMobile: e.target.value })}
              className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
              placeholder="Enter alternate mobile"
            />
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
                Updating...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
