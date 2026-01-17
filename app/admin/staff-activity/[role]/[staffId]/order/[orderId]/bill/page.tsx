import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { db } from "@/db/db";
import { users, orders, shops, areas, orderItems, products } from "@/db/schemas";
import { eq, and } from "drizzle-orm";
import { unstable_noStore as noStore } from "next/cache";
import BillClient from "./components/BillClient";
import AgencyError from "@/components/ui/AgencyError";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: Promise<{ role: string; staffId: string; orderId: string }>;
}

export default async function BillPage({ params }: PageProps) {
  noStore();
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "owner_admin") {
    redirect("/login");
  }

  const { role, staffId, orderId } = await params;

  // Get owner's agency
  const [ownerData] = await db
    .select({ agencyId: users.agencyId })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!ownerData?.agencyId) {
    return <AgencyError message="Error: Agency not found." />;
  }

  // Fetch order details
  const [order] = await db
    .select({
      id: orders.id,
      createdAt: orders.createdAt,
      status: orders.status,
      shopName: shops.name,
      shopMobile: shops.mobile,
      areaName: areas.name,
    })
    .from(orders)
    .innerJoin(shops, eq(orders.shopId, shops.id))
    .leftJoin(areas, eq(shops.areaId, areas.id))
    .where(
      and(
        eq(orders.id, orderId),
        eq(shops.agencyId, ownerData.agencyId)
      )
    )
    .limit(1);

  if (!order) {
    redirect("/admin/staff-activity");
  }

  // Fetch order items
  const items = await db
    .select({
      productName: products.name,
      quantity: orderItems.quantity,
      price: orderItems.price,
    })
    .from(orderItems)
    .innerJoin(products, eq(orderItems.productId, products.id))
    .where(eq(orderItems.orderId, orderId));

  const totalAmount = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <BillClient
      order={{ ...order, totalAmount }}
      items={items}
      staffId={staffId}
      role={role as "salesman" | "delivery_boy"}
    />
  );
}
