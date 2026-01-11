import BottomNav from "@/components/ui/ButtonNav"; // Reuse existing component
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import SocketRoomManager from "@/components/SocketRoomManager";
import SocketEventHandler from "@/components/SocketEventHandler";

export default async function DeliveryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "delivery_boy") {
    redirect("/login");
  }

  // Delivery specific nav items
  const deliveryNavItems = [
    { href: "/delivery", label: "Tasks", iconName: "home" }, // Home icon reused for Tasks
    { href: "/delivery/history", label: "History", iconName: "orders" }, // Clipboard icon for History
    { href: "/delivery/profile", label: "Profile", iconName: "logout" }, // Logout logic inside profile
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans md:max-w-md md:mx-auto shadow-2xl relative pb-24">
      
      {/* 🔥 SOCKET MANAGERS (Invisible Logic) */}
      <SocketRoomManager />
      <SocketEventHandler />

      <main className="flex-1 overflow-y-auto pb-24 scrollbar-hide">
        {children}
      </main>
      
      <BottomNav items={deliveryNavItems} exactMatchHref="/delivery" />
    </div>
  );
}
