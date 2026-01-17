import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { db } from "@/db/db";
import {
  orders,
  orderItems,
  products,
  stock,
  users,
  shops,
  areas,
} from "@/db/schemas";
// 🔥 FIX: Added 'desc' to imports
import { eq, and, sql, desc, gte, lte, or, ne, inArray } from "drizzle-orm";
import { redirect } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import AdminDashboardClient from "./components/AdminDashboardClient";
import AgencyError from "@/components/ui/AgencyError";

// Disable caching for real-time updates
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminHomePage() {
  noStore(); // Ensure fresh data
  // 1. Auth Check
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "owner_admin") {
    redirect("/login");
  }

  // 2. Get Owner Agency
  const [ownerData] = await db
    .select({ agencyId: users.agencyId })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!ownerData?.agencyId) {
    return <AgencyError />;
  }
  const agencyId = ownerData.agencyId;

  // --- 📅 DATE LOGIC (Real Time) ---
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  // --- 🔍 QUERY 1: Active Staff Count ---
  const [staffResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(and(eq(users.agencyId, agencyId), eq(users.isActive, true)));

  // --- 🔍 2. SALES GRAPH & TODAY'S STATS (Include all delivered orders) ---
  const rawSalesData = await db
    .select({
      orderId: orders.id,
      createdAt: orders.createdAt,
      price: orderItems.price,
      status: orders.status,
    })
    .from(orders)
    .innerJoin(shops, eq(orders.shopId, shops.id))
    .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
    .where(
      and(
        eq(shops.agencyId, agencyId),
        gte(orders.createdAt, sevenDaysAgo.toISOString()),
        // Include delivered and confirmed orders for sales tracking
        sql`${orders.status} IN ('delivered', 'confirmed')`
      )
    );

  // Calculations
  let todaySales = 0;
  const todayUniqueOrders = new Set();
  const daysMap = new Map<string, number>();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    daysMap.set(d.toLocaleDateString("en-US", { weekday: "short" }), 0);
  }

  rawSalesData.forEach((row) => {
    const orderDate = new Date(row.createdAt);
    const price = row.price || 0;
    const dayName = orderDate.toLocaleDateString("en-US", { weekday: "short" });

    if (daysMap.has(dayName)) {
      daysMap.set(dayName, (daysMap.get(dayName) || 0) + price);
    }

    if (orderDate >= startOfToday) {
      todaySales += price;
      todayUniqueOrders.add(row.orderId);
    }
  });

  const graphData = Array.from(daysMap).map(([name, sales]) => ({
    name,
    sales,
  }));

  // --- 🔍 3. SALES STAFF PERF (Today) - Group by staff only (one entry per staff) ---
  // First get staff stats without area
  const salesStaffRaw = await db
    .select({
      staffName: users.name,
      staffId: users.id,
      totalOrders: sql<number>`count(DISTINCT ${orders.id})`,
      totalAmount: sql<number>`sum(${orderItems.price})`,
    })
    .from(orders)
    .innerJoin(users, eq(orders.createdBy, users.id))
    .innerJoin(shops, eq(orders.shopId, shops.id))
    .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
    .where(
      and(
        eq(shops.agencyId, agencyId),
        gte(orders.createdAt, startOfToday.toISOString()),
        eq(users.role, "salesman"),
        sql`${orders.status} IN ('confirmed', 'delivered')`
      )
    )
    .groupBy(users.id);

  // Then get primary area for each staff (area with most orders today)
  const salesStaffPerf = await Promise.all(
    salesStaffRaw.map(async (staff) => {
      const [primaryArea] = await db
        .select({
          areaName: areas.name,
        })
        .from(orders)
        .innerJoin(shops, eq(orders.shopId, shops.id))
        .leftJoin(areas, eq(shops.areaId, areas.id))
        .where(
          and(
            eq(orders.createdBy, staff.staffId),
            eq(shops.agencyId, agencyId),
            gte(orders.createdAt, startOfToday.toISOString()),
            sql`${orders.status} IN ('confirmed', 'delivered')`,
            sql`${areas.name} IS NOT NULL`
          )
        )
        .groupBy(areas.id)
        .orderBy(desc(sql`count(DISTINCT ${orders.id})`))
        .limit(1);

      return {
        ...staff,
        areaName: primaryArea?.areaName || "Multiple Areas",
      };
    })
  );

  // --- 🚚 4. DELIVERY STAFF PERF ---
  const deliveryStaffRaw = await db
    .select({
      staffName: users.name,
      staffId: users.id,
      mobile: users.mobile,
    })
    .from(users)
    .where(
      and(
        eq(users.agencyId, agencyId),
        eq(users.role, "delivery_boy"),
        eq(users.isActive, true)
      )
    );

  const deliveryStaffPerf = deliveryStaffRaw.map((boy) => ({
    staffName: boy.staffName,
    staffId: boy.staffId,
    status: "On Duty",
    mobile: boy.mobile,
  }));

  // Fetch recent orders with total amount and staff names
  const recentOrdersRaw = await db
    .select({
      id: orders.id,
      createdAt: orders.createdAt,
      status: orders.status,
      shopName: shops.name,
      areaName: areas.name,
      createdBy: orders.createdBy,
      deliveredBy: orders.deliveredBy,
      totalAmount: sql<number>`COALESCE(SUM(${orderItems.price}), 0)`,
    })
    .from(orders)
    .innerJoin(shops, eq(orders.shopId, shops.id))
    .leftJoin(areas, eq(shops.areaId, areas.id))
    .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
    .where(eq(orders.agencyId, agencyId))
    .groupBy(orders.id, shops.name, areas.name, orders.createdBy, orders.deliveredBy)
    .orderBy(desc(orders.createdAt))
    .limit(50);

  // Get unique user IDs to fetch names
  const userIds = new Set<string>();
  recentOrdersRaw.forEach(order => {
    if (order.createdBy) userIds.add(order.createdBy);
    if (order.deliveredBy) userIds.add(order.deliveredBy);
  });

  // Fetch staff names
  const staffNamesMap = new Map<string, string>();
  if (userIds.size > 0) {
    const staffList = await db
      .select({
        id: users.id,
        name: users.name,
      })
      .from(users)
      .where(inArray(users.id, Array.from(userIds)));

    staffList.forEach(staff => {
      staffNamesMap.set(staff.id, staff.name);
    });
  }

  // Add staff names to orders, check if owner admin
  const ownerAdminId = session.user.id;
  const recentOrders = recentOrdersRaw.map(order => ({
    ...order,
    createdByName: order.createdBy === ownerAdminId ? "You" : (staffNamesMap.get(order.createdBy) || "Unknown"),
    deliveredByName: order.deliveredBy ? (order.deliveredBy === ownerAdminId ? "You" : (staffNamesMap.get(order.deliveredBy) || "Unknown")) : null,
  }));

  return (
    <AdminDashboardClient
      stats={{
        todaySales,
        todayOrders: todayUniqueOrders.size,
        activeStaff: staffResult?.count || 0,
      }}
      graphData={graphData}
      recentOrders={recentOrders}
      staffData={{
        sales: salesStaffPerf,
        delivery: deliveryStaffPerf,
      }}
    />
  );
}
