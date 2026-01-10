import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { db } from "@/db/db";
import { orders, users, shops, areas, orderItems } from "@/db/schemas";
import { eq, and, desc, sql } from "drizzle-orm";
import { CheckCircle2, Calendar, PackageX } from "lucide-react";
import { redirect } from "next/navigation";

export default async function DeliveryHistoryPage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");

  // 1. Fetch Delivery Boy's Agency
  const [me] = await db
    .select({ agencyId: users.agencyId })
    .from(users)
    .where(eq(users.id, session.user.id));

  // 🔥 FIX: Safety Check added
  if (!me || !me.agencyId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center text-slate-400">
        <PackageX size={48} className="mb-4 text-slate-300" />
        <p>No Agency Assigned.</p>
      </div>
    );
  }

  const agencyId = me.agencyId; // Ab yeh confirmed String hai

  // 2. Fetch Completed Orders
  const historyOrders = await db
    .select({
      id: orders.id,
      createdAt: orders.createdAt,
      shopName: shops.name,
      areaName: areas.name,
      totalAmount: sql<number>`(SELECT SUM(${orderItems.price}) FROM ${orderItems} WHERE ${orderItems.orderId} = ${orders.id})`,
    })
    .from(orders)
    .innerJoin(shops, eq(orders.shopId, shops.id))
    .leftJoin(areas, eq(shops.areaId, areas.id))
    .where(
      and(
        eq(shops.agencyId, agencyId), // ✅ No Error Here
        eq(orders.status, "delivered")
      )
    )
    .orderBy(desc(orders.createdAt))
    .limit(50);

  return (
    <div className="min-h-screen bg-slate-50 pt-6 px-5 pb-24">
      <h1 className="text-2xl font-black text-slate-800 mb-6 pl-1">
        History 📜
      </h1>

      <div className="space-y-3">
        {historyOrders.length === 0 ? (
          <div className="text-center py-20 opacity-50">
            <div className="bg-white h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Calendar size={32} className="text-slate-300" />
            </div>
            <p className="text-slate-400 font-bold">No history yet.</p>
          </div>
        ) : (
          historyOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white p-5 rounded-[1.5rem] flex justify-between items-center shadow-sm opacity-80 hover:opacity-100 transition-all border border-slate-100"
            >
              <div>
                <h4 className="font-bold text-slate-800 text-lg leading-tight">
                  {order.shopName}
                </h4>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mt-1 uppercase tracking-wide">
                  <span>{order.areaName}</span>
                  <span>•</span>
                  <span>
                    {new Date(order.createdAt).toLocaleDateString(undefined, {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="block font-black text-xl text-emerald-600">
                  ₹{order.totalAmount}
                </span>
                <div className="flex items-center gap-1 justify-end text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                  <CheckCircle2 size={10} className="text-emerald-500" /> Paid
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
