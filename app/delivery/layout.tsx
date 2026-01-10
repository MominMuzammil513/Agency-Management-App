import BottomNav from "@/components/ui/ButtonNav"; // Reuse existing component
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";

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
      {children}
      <BottomNav items={deliveryNavItems} exactMatchHref="/delivery" />
    </div>
  );
}
