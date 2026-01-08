"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ComponentType } from "react";
import { Home, Package, BarChart3, MoreHorizontal, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

const iconMap: Record<
  string,
  ComponentType<{ size?: number; strokeWidth?: number }>
> = {
  home: Home,
  package: Package,
  "bar-chart-3": BarChart3,
  "more-horizontal": MoreHorizontal,
  logout: LogOut, // Replace with actual logout icon
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
        "fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-2 flex justify-around items-center z-40 md:max-w-md md:mx-auto"
      }
    >
      {items.map((item) => {
        const active = isActive(item.href);
        const Icon = iconMap[item.iconName];

        if (!Icon) return null; // Safety: skip if icon not found
        if (item.iconName === "logout") {
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => signOut()}
              className={`flex flex-col items-center gap-1 p-2 transition-all ${
                active
                  ? "text-orange-600 scale-105"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <Icon size={24} strokeWidth={active ? 2.5 : 2} />
              <span className="text-[10px] font-bold uppercase tracking-wide">
                {item.label}
              </span>
            </Link>
          );
        } else {
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 p-2 transition-all ${
                active
                  ? "text-orange-600 scale-105"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <Icon size={24} strokeWidth={active ? 2.5 : 2} />
              <span className="text-[10px] font-bold uppercase tracking-wide">
                {item.label}
              </span>
            </Link>
          );
        }
      })}
    </nav>
  );
}
