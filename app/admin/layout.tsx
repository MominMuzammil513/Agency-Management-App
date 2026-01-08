import BottomNav from "@/components/ui/ButtonNav"; // Note: typo in path? "nevigation" → "navigation"?
import React from "react";

const layout = ({ children }: { children: React.ReactNode }) => {
  const adminNavItems = [
    { href: "/admin", label: "Home", iconName: "home" },
    { href: "/admin/stock", label: "Stock", iconName: "package" },
    { href: "/admin/statistics", label: "Stats", iconName: "bar-chart-3" }, // Fixed typo
    { href: "/admin/more", label: "More", iconName: "more-horizontal" },
  ];

  return (
    <div className="h-screen bg-slate-50 font-sans text-slate-900 md:max-w-md md:mx-auto shadow-2xl relative">
      <main className="pb-24">
        {" "}
        {/* Added padding to avoid overlap with fixed bottom nav */}
        {children}
      </main>
      <BottomNav items={adminNavItems} exactMatchHref="/admin" />
    </div>
  );
};

export default layout;
