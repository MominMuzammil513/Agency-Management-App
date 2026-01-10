import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { db } from "@/db/db";
import {
  orders,
  users,
  shops,
  areas,
  orderItems,
  products,
} from "@/db/schemas";
import { eq, and, desc, sql, ne, inArray } from "drizzle-orm";
import { PackageX } from "lucide-react";
import DeliveryDashboard from "./components/DeliveryDashboard";

export default async function DeliveryHomePage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  // 1. Fetch Delivery Boy's Agency
  const [me] = await db
    .select({ agencyId: users.agencyId })
    .from(users)
    .where(eq(users.id, session.user.id));

  if (!me || !me.agencyId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-400">
        <PackageX size={48} className="mb-2" />
        <p>No Agency Assigned.</p>
      </div>
    );
  }

  // 2. Fetch Pending Orders
  const pendingOrdersRaw = await db
    .select({
      id: orders.id,
      createdAt: orders.createdAt,
      status: orders.status,
      shopName: shops.name,
      shopMobile: shops.mobile,
      areaName: areas.name,
      areaId: areas.id,
      totalAmount: sql<number>`(SELECT SUM(${orderItems.price}) FROM ${orderItems} WHERE ${orderItems.orderId} = ${orders.id})`,
    })
    .from(orders)
    .innerJoin(shops, eq(orders.shopId, shops.id))
    .leftJoin(areas, eq(shops.areaId, areas.id))
    .where(
      and(
        eq(shops.agencyId, me.agencyId),
        ne(orders.status, "delivered"),
        ne(orders.status, "cancelled")
      )
    )
    .orderBy(desc(orders.createdAt));

  // 3. Fetch Items
  const orderIds = pendingOrdersRaw.map((o) => o.id);
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

  // 4. Combine Data & FIX TYPES
  const fullOrders = pendingOrdersRaw.map((order) => ({
    ...order,
    // 🔥 FIX: Agar mobile null hai to empty string bhejo
    shopMobile: order.shopMobile || "",
    // 🔥 FIX: Agar areaName null hai to "Unknown" bhejo (Safe side)
    areaName: order.areaName || "Unknown",
    items: allItems.filter((item) => item.orderId === order.id),
  }));

  // Note: Naye DeliveryDashboard mein 'areas' prop ki zaroorat nahi hai,
  // wo orders se khud unique areas nikal leta hai.
  return <DeliveryDashboard orders={fullOrders} />;
}
