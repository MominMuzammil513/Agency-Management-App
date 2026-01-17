import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { db } from "@/db/db";
import { users, orders, shops, areas, orderItems } from "@/db/schemas";
import { eq, and, sql, desc, or, isNull } from "drizzle-orm";
import { unstable_noStore as noStore } from "next/cache";
import AreaDetailClient from "./components/AreaDetailClient";
import AgencyError from "@/components/ui/AgencyError";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: Promise<{ role: string; staffId: string; areaId: string }>;
}

export default async function AreaDetailPage({ params }: PageProps) {
  noStore();
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "owner_admin") {
    redirect("/login");
  }

  const { role, staffId, areaId } = await params;

  // Get owner's agency
  const [ownerData] = await db
    .select({ agencyId: users.agencyId })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!ownerData?.agencyId) {
    return <AgencyError message="Error: Agency not found." />;
  }

  // Fetch staff details
  const [staff] = await db
    .select({
      id: users.id,
      name: users.name,
    })
    .from(users)
    .where(eq(users.id, staffId))
    .limit(1);

  // Fetch area details
  const [area] = await db
    .select({
      id: areas.id,
      name: areas.name,
    })
    .from(areas)
    .where(eq(areas.id, areaId))
    .limit(1);

  if (!staff || !area) {
    redirect("/admin/staff-activity");
  }

  // Build where conditions
  const baseConditions = [
    eq(shops.agencyId, ownerData.agencyId),
    eq(shops.areaId, areaId),
  ];

  if (role === "salesman") {
    baseConditions.push(eq(orders.createdBy, staffId));
    // For salesman, show all non-cancelled orders (pending, confirmed, delivered)
    baseConditions.push(sql`${orders.status} != 'cancelled'`);
  } else {
    // For delivery boy, show delivered orders
    baseConditions.push(eq(orders.status, "delivered"));
    // Handle both deliveredBy set and null (for backward compatibility)
    baseConditions.push(
      or(
        eq(orders.deliveredBy, staffId),
        isNull(orders.deliveredBy)
      )!
    );
  }

  // Fetch shops with order counts
  const shopsData = await db
    .select({
      shopId: shops.id,
      shopName: shops.name,
      shopMobile: shops.mobile,
      totalOrders: sql<number>`count(DISTINCT ${orders.id})`,
      totalAmount: sql<number>`sum(${orderItems.price})`,
    })
    .from(orders)
    .innerJoin(shops, eq(orders.shopId, shops.id))
    .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
    .where(and(...baseConditions))
    .groupBy(shops.id)
    .orderBy(desc(sql`count(DISTINCT ${orders.id})`));

  // Fetch all orders for this area
  const allOrders = await db
    .select({
      id: orders.id,
      createdAt: orders.createdAt,
      status: orders.status,
      shopName: shops.name,
      shopId: shops.id,
      totalAmount: sql<number>`sum(${orderItems.price})`,
      itemCount: sql<number>`count(${orderItems.id})`,
    })
    .from(orders)
    .innerJoin(shops, eq(orders.shopId, shops.id))
    .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
    .where(and(...baseConditions))
    .groupBy(orders.id, shops.id)
    .orderBy(desc(orders.createdAt));

  return (
    <AreaDetailClient
      staff={staff}
      area={area}
      shops={shopsData}
      orders={allOrders}
      role={role as "salesman" | "delivery_boy"}
    />
  );
}
