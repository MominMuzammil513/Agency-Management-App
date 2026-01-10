import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { db } from "@/db/db";
import { orders, shops, areas, orderItems } from "@/db/schemas";
import { eq, desc, sql } from "drizzle-orm";
import OrdersList from "./components/OrdersList";

export default async function MyOrdersPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== "salesman") {
    return redirect("/login");
  }

  // 🔥 Fetch Orders with ShopID (Crucial for Edit)
  const myOrders = await db
    .select({
      id: orders.id,
      shopId: orders.shopId, // 👈 Needed for redirecting to Order Page
      createdAt: orders.createdAt,
      status: orders.status,
      shopName: shops.name,
      areaName: areas.name,
      totalAmount: sql<number>`(
        SELECT SUM(${orderItems.price}) 
        FROM ${orderItems} 
        WHERE ${orderItems.orderId} = ${orders.id}
      )`.as("totalAmount"),
      itemCount: sql<number>`(
        SELECT COUNT(*) 
        FROM ${orderItems} 
        WHERE ${orderItems.orderId} = ${orders.id}
      )`.as("itemCount"),
    })
    .from(orders)
    .innerJoin(shops, eq(orders.shopId, shops.id))
    .innerJoin(areas, eq(shops.areaId, areas.id))
    .where(eq(orders.createdBy, session.user.id))
    .orderBy(desc(orders.createdAt));

  return (
    <div className="min-h-screen bg-emerald-50/60">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md p-6 sticky top-0 z-30 border-b border-emerald-100 shadow-sm rounded-b-4xl">
        <h1 className="text-2xl font-black text-slate-800">My Orders 📋</h1>
        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">
          History & Status
        </p>
      </div>

      {/* List Component */}
      <OrdersList orders={myOrders} />
    </div>
  );
}
