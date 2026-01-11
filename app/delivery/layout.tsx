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
    { href: "/delivery", label: "Tasks", iconName: "home" },
    { href: "/delivery/history", label: "History", iconName: "orders" },
    { href: "/profile", label: "Profile", iconName: "more-horizontal" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans md:max-w-md md:mx-auto shadow-2xl relative pb-24">
      <main className="flex-1 overflow-y-auto pb-24 scrollbar-hide">
        {children}
      </main>
      
      <BottomNav items={deliveryNavItems} exactMatchHref="/delivery" />
    </div>
  );
}
