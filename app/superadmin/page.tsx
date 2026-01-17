import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { db } from "@/db/db";
import { users, agencies, orders, shops, orderItems } from "@/db/schemas";
import { eq, sql, and, ne, inArray, gte } from "drizzle-orm";
import { unstable_noStore as noStore } from "next/cache";
import SuperAdminDashboardClient from "./components/SuperAdminDashboardClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SuperAdminPage() {
  noStore();
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "super_admin") {
    redirect("/login");
  }

  // Get system-wide statistics
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  // Total Agencies
  const [agenciesCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(agencies);

  // Total Users (excluding super_admin)
  const [usersCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(ne(users.role, "super_admin"));

  // Active Users
  const [activeUsersCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(and(eq(users.isActive, true), ne(users.role, "super_admin")));

  // Today's Orders
  const [todayOrdersCount] = await db
    .select({ count: sql<number>`count(DISTINCT ${orders.id})` })
    .from(orders)
    .innerJoin(shops, eq(orders.shopId, shops.id))
    .where(
      and(
        gte(orders.createdAt, startOfToday.toISOString()),
        inArray(orders.status, ["confirmed", "delivered"])
      )
    );

  // Today's Sales
  const [todaySalesResult] = await db
    .select({ total: sql<number>`COALESCE(sum(${orderItems.price}), 0)` })
    .from(orders)
    .innerJoin(shops, eq(orders.shopId, shops.id))
    .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
    .where(
      and(
        gte(orders.createdAt, startOfToday.toISOString()),
        inArray(orders.status, ["confirmed", "delivered"])
      )
    );

  // Get all agencies with owner info
  const allAgencies = await db
    .select({
      id: agencies.id,
      name: agencies.name,
      ownerId: agencies.ownerId,
      ownerName: users.name,
      ownerEmail: users.email,
      ownerMobile: users.mobile,
      ownerAltMobile: users.altMobile,
      ownerIsActive: users.isActive,
      createdAt: agencies.createdAt,
      totalUsers: sql<number>`(
        SELECT COUNT(*) FROM ${users} WHERE ${users.agencyId} = ${agencies.id}
      )`,
      totalOrders: sql<number>`(
        SELECT COUNT(DISTINCT ${orders.id}) 
        FROM ${orders}
        INNER JOIN ${shops} ON ${orders.shopId} = ${shops.id}
        WHERE ${shops.agencyId} = ${agencies.id}
        AND ${orders.status} IN ('confirmed', 'delivered')
      )`,
      totalSales: sql<number>`(
        SELECT COALESCE(SUM(${orderItems.price}), 0)
        FROM ${orders}
        INNER JOIN ${shops} ON ${orders.shopId} = ${shops.id}
        INNER JOIN ${orderItems} ON ${orders.id} = ${orderItems.orderId}
        WHERE ${shops.agencyId} = ${agencies.id}
        AND ${orders.status} IN ('confirmed', 'delivered')
      )`,
    })
    .from(agencies)
    .leftJoin(users, eq(agencies.ownerId, users.id))
    .orderBy(agencies.createdAt);

  return (
    <SuperAdminDashboardClient
      stats={{
        totalAgencies: agenciesCount?.count || 0,
        totalUsers: usersCount?.count || 0,
        activeUsers: activeUsersCount?.count || 0,
        todayOrders: todayOrdersCount?.count || 0,
        todaySales: todaySalesResult?.total || 0,
      }}
      agencies={allAgencies}
    />
  );
}
