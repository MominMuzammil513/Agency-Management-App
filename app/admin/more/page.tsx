"use client";

import React from "react";
import Link from "next/link";
import {
  Settings,
  Users,
  Calendar,
  Shield,
  Bell,
  LogOut,
  Layers, // Better icon for Category
  Package, // Better icon for Product
  BarChart3,
  UserCircle,
  ChevronRight,
} from "lucide-react";
import { signOut } from "next-auth/react";

export default function MorePage() {
  // 🟢 Active Options
  const mainOptions = [
    {
      href: "/admin/more/managestaff",
      label: "My Team",
      sub: "Manage Staff",
      icon: Users,
      color: "bg-blue-100 text-blue-600",
      active: true,
    },
    {
      href: "/admin/more/category",
      label: "Categories",
      sub: "Organize Items",
      icon: Layers,
      color: "bg-purple-100 text-purple-600",
      active: true,
    },
    {
      href: "/admin/more/products",
      label: "Manage Products",
      sub: "Inventory",
      icon: Package,
      color: "bg-emerald-100 text-emerald-600",
      active: true,
    },
  ];

  // ⚪ Future/Inactive Options (With Suggestions)
  const secondaryOptions = [
    { label: "Analytics", icon: BarChart3, active: false }, // ✨ Suggestion
    { label: "Profile", icon: UserCircle, active: false }, // ✨ Suggestion
    { label: "Settings", icon: Settings, active: false },
    { label: "Schedule", icon: Calendar, active: false },
    { label: "Security", icon: Shield, active: false },
    { label: "Notifs", icon: Bell, active: false },
  ];

  return (
    <div className="min-h-screen bg-emerald-50/60 pb-32 font-sans">
      {/* 🌿 Cute Header */}
      <div className="bg-white/80 backdrop-blur-md sticky top-0 z-30 px-6 py-6 border-b border-emerald-100 rounded-b-[3rem] shadow-sm mb-8">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 bg-emerald-100 rounded-full flex items-center justify-center text-2xl shadow-inner">
            👑
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              Dashboard
            </h1>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
              Owner Panel
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-8">
        {/* 🚀 Main Actions (Big Cards) */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider ml-2">
            Quick Actions
          </h2>

          {mainOptions.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className="group flex items-center justify-between bg-white p-4 rounded-4xl shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-emerald-100/50 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`h-14 w-14 rounded-2xl flex items-center justify-center ${item.color} shadow-sm`}
                  >
                    <Icon size={24} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">
                      {item.label}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">
                      {item.sub}
                    </p>
                  </div>
                </div>

                <div className="h-10 w-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                  <ChevronRight size={20} />
                </div>
              </Link>
            );
          })}
        </div>

        {/* 🚧 Secondary Actions (Grid - Inactive) */}
        <div>
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider ml-2 mb-4">
            More Options
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {secondaryOptions.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="flex flex-col items-center justify-center bg-white/60 p-4 rounded-4xl border border-transparent grayscale opacity-70 cursor-not-allowed"
                >
                  <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-2">
                    <Icon size={18} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">
                    {item.label}
                  </span>
                  <span className="text-[8px] bg-slate-200 px-1.5 py-0.5 rounded-full text-slate-500 mt-1">
                    Soon
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 🚪 Logout Button */}
        <button
        type="submit"
          onClick={() => signOut()}
          className="w-full bg-red-50 text-red-500 p-4 rounded-4xl font-bold flex items-center justify-center gap-3 hover:bg-red-500 hover:text-white transition-all duration-300 active:scale-95 shadow-sm mt-4"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </div>
  );
}
