import React from "react";
import BottomNav from "@/components/ui/ButtonNav"; // Note: typo in path? "nevigation" → "navigation"?
import SocketRoomManager from "@/components/SocketRoomManager"; // 👈 Room Joiner
import SocketEventHandler from "@/components/SocketEventHandler"; // 👈 Event Listener

const layout = ({ children }: { children: React.ReactNode }) => {
  const adminNavItems = [
    { href: "/admin", label: "Home", iconName: "home" },
    { href: "/admin/stock", label: "Stock", iconName: "package" },
    { href: "/admin/statistics", label: "Stats", iconName: "bar-chart-3" },
    { href: "/admin/more", label: "More", iconName: "more-horizontal" },
  ];

  return (
    <div className="h-screen bg-slate-50 font-sans text-slate-900 md:max-w-md md:mx-auto shadow-2xl relative flex flex-col">
      
      {/* 🔥 SOCKET MANAGERS (Invisible Logic) */}
      <SocketRoomManager />
      <SocketEventHandler />

      <main className="flex-1 overflow-y-auto pb-24 scrollbar-hide">
        {children}
      </main>
      
      <BottomNav items={adminNavItems} exactMatchHref="/admin" />
    </div>
  );
};

export default layout;