// app/admin/more/managestaff/earnings/page.tsx - Staff Earnings Page
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { db } from "@/db/db";
import { orders, orderItems, users, shops, areas } from "@/db/schemas";
import { eq, and, sql, gte, lte, inArray } from "drizzle-orm";
import { redirect } from "next/navigation";
import StaffEarningsClient from "./components/StaffEarningsClient";
import AgencyError from "@/components/ui/AgencyError";
import { unstable_noStore as noStore } from "next/cache";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function StaffEarningsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: "daily" | "weekly" | "monthly"; staffId?: string }>;
}) {
  noStore();
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "owner_admin") {
    redirect("/login");
  }

  const params = await searchParams;
  const period = params.period || "daily";
  const selectedStaffId = params.staffId;

  // Get owner's agency
  const [ownerData] = await db
    .select({ agencyId: users.agencyId })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!ownerData?.agencyId) {
    return <AgencyError message="Error: Agency not found." />;
  }

  const agencyId = ownerData.agencyId;

  // Date range based on period
  const now = new Date();
  let startDate = new Date(now);
  startDate.setHours(0, 0, 0, 0);
  let endDate = new Date(now);
  endDate.setHours(23, 59, 59, 999);

  if (period === "weekly") {
    startDate.setDate(now.getDate() - 7);
  } else if (period === "monthly") {
    startDate.setMonth(now.getMonth() - 1);
  }

  // Fetch all staff (salesman + delivery_boy)
  const allStaff = await db
    .select({
      id: users.id,
      name: users.name,
      role: users.role,
      email: users.email,
      mobile: users.mobile,
      isActive: users.isActive,
    })
    .from(users)
    .where(
      and(
        eq(users.agencyId, agencyId),
        sql`${users.role} IN ('salesman', 'delivery_boy')`
      )
    );

  // Fetch earnings data
  const earningsData = await db
    .select({
      staffId: orders.createdBy,
      staffName: users.name,
      staffRole: users.role,
      totalOrders: sql<number>`count(DISTINCT ${orders.id})`,
      totalAmount: sql<number>`sum(${orderItems.price})`,
      areaName: areas.name,
    })
    .from(orders)
    .innerJoin(users, eq(orders.createdBy, users.id))
    .innerJoin(shops, eq(orders.shopId, shops.id))
    .leftJoin(areas, eq(shops.areaId, areas.id))
    .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
    .where(
      and(
        eq(shops.agencyId, agencyId),
        gte(orders.createdAt, startDate.toISOString()),
        lte(orders.createdAt, endDate.toISOString()),
        sql`${orders.status} IN ('delivered', 'confirmed')`,
        selectedStaffId ? eq(orders.createdBy, selectedStaffId) : sql`1=1`
      )
    )
    .groupBy(orders.createdBy, areas.id);

  // Format earnings data
  const earningsMap = new Map<string, {
    staffId: string;
    staffName: string;
    role: string;
    totalOrders: number;
    totalAmount: number;
    areas: { name: string; orders: number; amount: number }[];
  }>();

  earningsData.forEach((row) => {
    if (!earningsMap.has(row.staffId)) {
      earningsMap.set(row.staffId, {
        staffId: row.staffId,
        staffName: row.staffName,
        role: row.staffRole,
        totalOrders: 0,
        totalAmount: 0,
        areas: [],
      });
    }
    const staff = earningsMap.get(row.staffId)!;
    staff.totalOrders += row.totalOrders;
    staff.totalAmount += row.totalAmount;
    staff.areas.push({
      name: row.areaName || "Unknown",
      orders: row.totalOrders,
      amount: row.totalAmount,
    });
  });

  const earnings = Array.from(earningsMap.values()).sort(
    (a, b) => b.totalAmount - a.totalAmount
  );

  return (
    <StaffEarningsClient
      staff={allStaff}
      earnings={earnings}
      period={period}
      selectedStaffId={selectedStaffId}
      dateRange={{ start: startDate, end: endDate }}
    />
  );
}
