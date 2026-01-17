import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { db } from "@/db/db";
import { orders, shops, areas, orderItems, products, categories, users } from "@/db/schemas";
import { eq, and, lte, sql, inArray } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "owner_admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const dateStr = searchParams.get("date");
  const statusFilter = searchParams.get("status") || "pending,confirmed";

  if (!dateStr) {
    return NextResponse.json({ message: "Date required" }, { status: 400 });
  }

  try {
    // Get owner's agency from users table
    const [ownerData] = await db
      .select({ agencyId: users.agencyId })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!ownerData?.agencyId) {
      return NextResponse.json({ message: "Agency not found" }, { status: 404 });
    }

    // Parse date - get all pending orders up to this date (not delivered)
    const targetDate = new Date(dateStr);
    targetDate.setHours(23, 59, 59, 999);
    const endDateISO = targetDate.toISOString();

    // Fetch pending/confirmed orders up to selected date (not delivered, not cancelled)
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
      .where(
        and(
          eq(shops.agencyId, ownerData.agencyId),
          lte(orders.createdAt, endDateISO),
          sql`${orders.status} IN ('pending', 'confirmed')`,
          sql`${orders.status} != 'delivered'`,
          sql`${orders.status} != 'cancelled'`
        )
      )
      .orderBy(orders.createdAt);

    const orderIds = allOrders.map(o => o.id);
    let allItems: any[] = [];

    if (orderIds.length > 0) {
      allItems = await db
        .select({
          orderId: orderItems.orderId,
          productId: products.id,
          productName: products.name,
          categoryId: products.categoryId,
          categoryName: categories.name,
          quantity: orderItems.quantity,
          price: orderItems.price,
        })
        .from(orderItems)
        .innerJoin(products, eq(orderItems.productId, products.id))
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .where(inArray(orderItems.orderId, orderIds));
    }

    // Group by categoryId:productName
    const summary: Record<string, number> = {};
    allItems.forEach((item) => {
      const key = `${item.categoryId || 'uncategorized'}:${item.productName}`;
      if (!summary[key]) summary[key] = 0;
      summary[key] += item.quantity;
    });

    return NextResponse.json({
      orders: allOrders,
      items: allItems,
      summary,
      date: dateStr,
    });
  } catch (error: any) {
    console.error("Loadsheet Error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to fetch loadsheet" },
      { status: 500 }
    );
  }
}