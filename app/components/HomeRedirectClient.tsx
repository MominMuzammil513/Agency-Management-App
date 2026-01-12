"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, Shield, Package, Truck, Settings } from "lucide-react";

interface HomeRedirectClientProps {
  redirectPath: string;
  userName: string;
  role: string;
}

const roleIcons: Record<string, typeof Shield> = {
  owner_admin: Shield,
  salesman: Package,
  delivery_boy: Truck,
  super_admin: Settings,
};

const roleLabels: Record<string, string> = {
  owner_admin: "Owner/Admin",
  salesman: "Sales Representative",
  delivery_boy: "Delivery Boy",
  super_admin: "Super Admin",
};

export default function HomeRedirectClient({
  redirectPath,
  userName,
  role,
}: HomeRedirectClientProps) {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "redirecting" | "success">("loading");
  const Icon = roleIcons[role] || Shield;

  useEffect(() => {
    // Show loading state briefly for better UX
    const timer1 = setTimeout(() => {
      setStatus("redirecting");
    }, 500);

    // Then redirect
    const timer2 = setTimeout(() => {
      router.push(redirectPath);
    }, 1000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [redirectPath, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-6">
      <div className="bg-white/90 backdrop-blur-xl rounded-4xl p-8 md:p-12 shadow-2xl border border-emerald-100/50 max-w-md w-full text-center">
        {/* Logo/Icon */}
        <div className="flex justify-center mb-6">
          <div className="h-20 w-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center shadow-lg">
            <Icon size={40} className="text-white" strokeWidth={2.5} />
          </div>
        </div>

        {/* Welcome Message */}
        <h1 className="text-3xl font-black text-slate-800 mb-2">
          Welcome back!
        </h1>
        <p className="text-slate-600 mb-6 font-medium">
          {userName}
        </p>

        {/* Role Badge */}
        <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-bold mb-8">
          <Shield size={14} />
          {roleLabels[role] || role}
        </div>

        {/* Status Indicator */}
        <div className="space-y-4">
          {status === "loading" && (
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={32} className="text-emerald-600 animate-spin" />
              <p className="text-sm text-slate-500 font-medium">
                Initializing...
              </p>
            </div>
          )}

          {status === "redirecting" && (
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <Loader2 size={32} className="text-emerald-600 animate-spin" />
                <CheckCircle2
                  size={20}
                  className="text-emerald-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                />
              </div>
              <p className="text-sm text-slate-500 font-medium">
                Redirecting to dashboard...
              </p>
            </div>
          )}

          {/* Progress Bar */}
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full transition-all duration-1000 ${
                status === "redirecting" ? "w-full" : "w-1/3"
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
