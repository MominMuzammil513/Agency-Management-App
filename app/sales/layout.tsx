import BottomNav from "@/components/ui/ButtonNav";
import React from "react";

const layout = ({ children }: { children: React.ReactNode }) => {
  // 🔥 Navigation Items List
  const salesNavItems = [
    { href: "/sales", label: "Home", iconName: "home" },
    { href: "/sales/my-orders", label: "My Orders", iconName: "orders" },
    { href: "/profile", label: "Profile", iconName: "more-horizontal" },
    { href: "#", label: "Logout", iconName: "logout" },
  ];

  return (
    <div className="h-screen bg-slate-50 font-sans text-slate-900 md:max-w-md md:mx-auto shadow-2xl relative">
      <main className="flex-1 overflow-y-auto pb-24 scrollbar-hide">
        {/* Page Content yahan aayega */}
        {children}
      </main>

      {/* 🔥 Updated Navigation */}
      <BottomNav items={salesNavItems} exactMatchHref="/sales" />
    </div>
  );
};

export default layout;
