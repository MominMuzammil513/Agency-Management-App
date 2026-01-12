import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { db } from "@/db/db";
import { users, orders, shops, areas, orderItems, products } from "@/db/schemas";
import { eq, and, sql, inArray } from "drizzle-orm";
import { unstable_noStore as noStore } from "next/cache";
import CombinedMaalLoadClient from "./components/CombinedMaalLoadClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: Promise<{ role: string }>;
  searchParams: Promise<{ staffIds?: string }>;
}

export default async function CombinedMaalLoadPage({ params, searchParams }: PageProps) {
  noStore();
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "owner_admin") {
    redirect("/login");
  }

  const { role } = await params;
  const { staffIds } = await searchParams;

  if (!staffIds) {
    redirect("/admin/staff-activity");
  }

  const staffIdArray = staffIds.split(",").filter(Boolean);

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

  // Build where conditions
  const baseConditions = [
    eq(shops.agencyId, ownerData.agencyId),
    inArray(orders.createdBy, staffIdArray),
  ];

  if (role === "salesman") {
    baseConditions.push(sql`${orders.status} IN ('confirmed', 'delivered')`);
  } else {
    baseConditions.push(eq(orders.status, "delivered"));
  }

  // Fetch all orders from selected staff
  const allOrders = await db
    .select({
      id: orders.id,
      createdAt: orders.createdAt,
      status: orders.status,
      shopName: shops.name,
      shopMobile: shops.mobile,
      areaName: areas.name,
      createdBy: orders.createdBy,
    })
    .from(orders)
    .innerJoin(shops, eq(orders.shopId, shops.id))
    .leftJoin(areas, eq(shops.areaId, areas.id))
    .where(and(...baseConditions))
    .orderBy(orders.createdAt);

  // Fetch all order items
  const orderIds = allOrders.map((o) => o.id);
  let allItems: any[] = [];

  if (orderIds.length > 0) {
    allItems = await db
      .select({
        orderId: orderItems.orderId,
        productName: products.name,
        quantity: orderItems.quantity,
        price: orderItems.price,
      })
      .from(orderItems)
      .innerJoin(products, eq(orderItems.productId, products.id))
      .where(inArray(orderItems.orderId, orderIds));
  }

  // Calculate combined summary
  const summary: Record<string, number> = {};
  allItems.forEach((item) => {
    if (!summary[item.productName]) summary[item.productName] = 0;
    summary[item.productName] += item.quantity;
  });

  // Fetch staff names
  const staffList = await db
    .select({
      id: users.id,
      name: users.name,
    })
    .from(users)
    .where(inArray(users.id, staffIdArray));

  return (
    <CombinedMaalLoadClient
      orders={allOrders}
      items={allItems}
      summary={summary}
      staffList={staffList}
      role={role as "salesman" | "delivery_boy"}
    />
  );
}
