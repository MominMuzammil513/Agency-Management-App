import BottomNav from "@/components/ui/ButtonNav";
import React from "react";
import SocketRoomManager from "@/components/SocketRoomManager";
import SocketEventHandler from "@/components/SocketEventHandler";

const layout = ({ children }: { children: React.ReactNode }) => {
  // 🔥 Navigation Items List
  const salesNavItems = [
    { href: "/sales", label: "Home", iconName: "home" },
    { href: "/sales/my-orders", label: "My Orders", iconName: "orders" }, // 👈 New Button Added
    // { href: "/sales/profile", label: "Profile", iconName: "more-horizontal" }, // Future use
    { href: "#", label: "Logout", iconName: "logout" },
  ];

  return (
    <div className="h-screen bg-slate-50 font-sans text-slate-900 md:max-w-md md:mx-auto shadow-2xl relative">
      
      {/* 🔥 SOCKET MANAGERS (Invisible Logic) */}
      <SocketRoomManager />
      <SocketEventHandler />

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
