"use client";

import React from "react";
import {
  Settings,
  Users,
  Calendar,
  Shield,
  Bell,
  LogOut,
  GalleryHorizontalEnd,
  Box,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

export default function MorePage() {
  const pathname = usePathname();

  const navItems = [
    { href: "/admin/more/settings", label: "Settings", icon: Settings },
    { href: "/admin/more/staff", label: "Manage Staff", icon: Users },
    { href: "/admin/more/staffschedule", label: "Schedule", icon: Calendar },
    { href: "/admin/more/security", label: "Security", icon: Shield },
    { href: "/admin/more/notifications", label: "Notifications", icon: Bell },
    {
      href: "/admin/more/category",
      label: "Product Category",
      icon: GalleryHorizontalEnd,
    },
    {
      href: "/admin/more/products",
      label: "Mange Product",
      icon: Box,
    },
  ];

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <div className="min-h-screen bg-slate-50 pb-24 relative">
      {/* Page Content */}
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">More Options</h1>

        {/* Grid style */}
        <div className="grid grid-cols-2 gap-5 mb-10">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center"
              >
                <Icon size={40} className="text-orange-600 mb-3" />
                <span className="font-medium text-slate-800">{item.label}</span>
              </Link>
            );
          })}

          {/* Logout in grid */}
          <button
            onClick={() => signOut()}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center"
          >
            <LogOut size={40} className="text-orange-600 mb-3" />
            <span className="font-medium text-slate-800">Logout</span>
          </button>
        </div>
      </div>
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-2 flex justify-around items-center z-40 md:max-w-md md:mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col items-center gap-1 p-2 transition-all duration-200
                ${
                  active
                    ? "text-orange-600 scale-105"
                    : "text-slate-400 hover:text-slate-600"
                }
              `}
            >
              <Icon size={24} strokeWidth={active ? 2.5 : 2} />
              <span className="text-[10px] font-bold uppercase tracking-wide">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
