import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { db } from "@/db/db";
import { users, orders, shops, areas, orderItems } from "@/db/schemas";
import { eq, and, sql, desc, gte, lte, inArray } from "drizzle-orm";
import { unstable_noStore as noStore } from "next/cache";
import StaffDetailClient from "./components/StaffDetailClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: Promise<{ role: string; staffId: string }>;
  searchParams: Promise<{ 
    period?: "daily" | "weekly" | "monthly" | "custom";
    from?: string;
    to?: string;
  }>;
}

export default async function StaffDetailPage({ params, searchParams }: PageProps) {
  noStore();
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "owner_admin") {
    redirect("/login");
  }

  const { role, staffId } = await params;
  const { period = "daily", from, to } = await searchParams;

  // Validate role
  if (role !== "salesman" && role !== "delivery_boy") {
    redirect("/admin/staff-activity");
  }

  // Get owner's agency
  const [ownerData] = await db
    .select({ agencyId: users.agencyId })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!ownerData?.agencyId) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 font-bold">
        Error: Agency not found.
      </div>
    );
  }

  // Fetch staff details
  const [staff] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      mobile: users.mobile,
      role: users.role,
    })
    .from(users)
    .where(
      and(
        eq(users.id, staffId),
        eq(users.agencyId, ownerData.agencyId),
        eq(users.role, role)
      )
    )
    .limit(1);

  if (!staff) {
    redirect("/admin/staff-activity");
  }

  // Calculate date range based on period
  const now = new Date();
  let startDate: Date;
  let endDate: Date = new Date(now);

  if (period === "daily") {
    startDate = new Date(now);
    startDate.setHours(0, 0, 0, 0);
  } else if (period === "weekly") {
    startDate = new Date(now);
    startDate.setDate(now.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);
  } else if (period === "monthly") {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    startDate.setHours(0, 0, 0, 0);
  } else if (period === "custom" && from && to) {
    startDate = new Date(from);
    endDate = new Date(to);
    endDate.setHours(23, 59, 59, 999);
  } else {
    startDate = new Date(now);
    startDate.setHours(0, 0, 0, 0);
  }

  // Build where conditions
  const baseConditions = [
    eq(shops.agencyId, ownerData.agencyId),
    gte(orders.createdAt, startDate.toISOString()),
    lte(orders.createdAt, endDate.toISOString()),
  ];

  if (role === "salesman") {
    baseConditions.push(eq(orders.createdBy, staffId));
    // For salesman, show confirmed and delivered orders
    baseConditions.push(inArray(orders.status, ["confirmed", "delivered"]));
  } else {
    // For delivery boy, show delivered orders
    baseConditions.push(eq(orders.status, "delivered"));
  }

  // Fetch areas with order counts
  const areasData = await db
    .select({
      areaId: areas.id,
      areaName: areas.name,
      totalOrders: sql<number>`count(DISTINCT ${orders.id})`,
      totalAmount: sql<number>`sum(${orderItems.price})`,
    })
    .from(orders)
    .innerJoin(shops, eq(orders.shopId, shops.id))
    .leftJoin(areas, eq(shops.areaId, areas.id))
    .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
    .where(and(...baseConditions))
    .groupBy(areas.id)
    .orderBy(desc(sql`count(DISTINCT ${orders.id})`));

  // Fetch all orders for this staff in the date range
  const allOrders = await db
    .select({
      id: orders.id,
      createdAt: orders.createdAt,
      status: orders.status,
      shopName: shops.name,
      shopId: shops.id,
      areaName: areas.name,
      areaId: areas.id,
      totalAmount: sql<number>`sum(${orderItems.price})`,
      itemCount: sql<number>`count(${orderItems.id})`,
    })
    .from(orders)
    .innerJoin(shops, eq(orders.shopId, shops.id))
    .leftJoin(areas, eq(shops.areaId, areas.id))
    .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
    .where(and(...baseConditions))
    .groupBy(orders.id, shops.id, areas.id)
    .orderBy(desc(orders.createdAt));

  return (
    <StaffDetailClient
      staff={staff}
      areas={areasData}
      orders={allOrders}
      period={period}
      dateRange={{ from: startDate.toISOString(), to: endDate.toISOString() }}
      role={role as "salesman" | "delivery_boy"}
    />
  );
}
