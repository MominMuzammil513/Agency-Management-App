import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { db } from "@/db/db";
import { users, orders, shops, areas, orderItems } from "@/db/schemas";
import { eq, and, sql, desc, gte, lte, inArray, or, isNull } from "drizzle-orm";
import { unstable_noStore as noStore } from "next/cache";
import StaffDetailClient from "./components/StaffDetailClient";
import AgencyError from "@/components/ui/AgencyError";

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
    return <AgencyError message="Error: Agency not found." />;
  }

  // Check if viewing owner_admin's own activities
  const isOwnerAdmin = staffId === session.user.id;
  
  let staff;
  if (isOwnerAdmin) {
    // For owner_admin viewing their own activities, fetch from database
    const [ownerStaffData] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        mobile: users.mobile,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!ownerStaffData) {
      redirect("/admin/staff-activity");
    }
    staff = ownerStaffData;
  } else {
    // Fetch staff details for regular staff
    const [staffData] = await db
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

    if (!staffData) {
      redirect("/admin/staff-activity");
    }
    staff = staffData;
  }

  // Calculate date range based on period
  // Use local timezone to avoid date shifting issues
  const now = new Date();
  let startDate: Date;
  let endDate: Date;

  if (period === "daily") {
    // Today's start and end in local timezone
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  } else if (period === "weekly") {
    // Last 7 days including today
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6, 0, 0, 0, 0);
    endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  } else if (period === "monthly") {
    // Current month
    startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  } else if (period === "custom" && from && to) {
    // Custom date range - parse as local dates
    const fromDate = new Date(from);
    const toDate = new Date(to);
    startDate = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate(), 0, 0, 0, 0);
    endDate = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate(), 23, 59, 59, 999);
  } else {
    // Default to today
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  }

  // Build where conditions
  // Convert to ISO string for database comparison (database stores in UTC)
  // But we calculate dates in local timezone first to avoid date shifting
  const startDateISO = startDate.toISOString();
  const endDateISO = endDate.toISOString();
  
  const baseConditions = [
    eq(shops.agencyId, ownerData.agencyId),
    gte(orders.createdAt, startDateISO),
    lte(orders.createdAt, endDateISO),
  ];

  if (role === "salesman") {
    baseConditions.push(eq(orders.createdBy, staffId));
    // For salesman, show all orders (pending, confirmed, delivered) - don't exclude pending
    // Only exclude cancelled orders
    baseConditions.push(sql`${orders.status} != 'cancelled'`);
  } else {
    // For delivery boy, show delivered orders by this specific delivery boy
    // Handle both deliveredBy set and null (for old orders without deliveredBy)
    baseConditions.push(eq(orders.status, "delivered"));
    // Use OR condition: either deliveredBy matches OR it's null (for backward compatibility)
    baseConditions.push(
      or(
        eq(orders.deliveredBy, staffId),
        isNull(orders.deliveredBy)
      )!
    );
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
      isOwnerAdmin={isOwnerAdmin}
    />
  );
}
