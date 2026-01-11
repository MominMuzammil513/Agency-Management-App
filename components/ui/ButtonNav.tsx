"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ComponentType } from "react";
// 🔥 1. Import ClipboardList icon
import {
  Home,
  Package,
  BarChart3,
  MoreHorizontal,
  LogOut,
  ClipboardList,
  User,
} from "lucide-react";
import { signOut } from "next-auth/react";

const iconMap: Record<
  string,
  ComponentType<{ size?: number; strokeWidth?: number }>
> = {
  home: Home,
  package: Package,
  "bar-chart-3": BarChart3,
  "more-horizontal": User, // Use User icon for profile
  logout: LogOut,
  orders: ClipboardList,
};

type NavItem = {
  href: string;
  label: string;
  iconName: string;
};

type BottomNavProps = {
  items: NavItem[];
  exactMatchHref?: string;
  containerClassName?: string;
};

export default function BottomNav({
  items,
  exactMatchHref,
  containerClassName,
}: BottomNavProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (exactMatchHref && href === exactMatchHref) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  if (items.length === 0) return null;

  return (
    <nav
      className={
        containerClassName ??
        "fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-emerald-100 p-2 flex justify-around items-center z-40 md:max-w-md md:mx-auto shadow-[0_-4px_20px_-5px_rgba(16,185,129,0.1)]"
      }
    >
      {items.map((item) => {
        const active = isActive(item.href);
        const Icon = iconMap[item.iconName];

        if (!Icon) return null;

        const isLogout = item.iconName === "logout";

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => isLogout && signOut()}
            className={`flex flex-col items-center gap-1 p-2 transition-all duration-300 rounded-xl ${
              active
                ? "text-emerald-600 scale-105 bg-emerald-50 font-bold" // 🔥 Green Theme Active
                : "text-slate-400 hover:text-emerald-500 hover:bg-slate-50"
            }`}
          >
            <Icon size={22} strokeWidth={active ? 2.5 : 2} />
            <span className="text-[10px] uppercase tracking-wide">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
