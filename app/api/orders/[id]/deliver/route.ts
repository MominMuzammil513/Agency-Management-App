import { db } from "@/db/db";
import { orderItems, orders, stock, stockMovements } from "@/db/schemas";
import { authOptions } from "@/lib/authOptions";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

// app/api/orders/[id]/deliver/route.ts
export async function POST(
  req: NextRequest,
 context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; // ✅ unwrap params
  const session = await getServerSession(authOptions);
 if (
   !session ||
   session.user.role !== "delivery_boy" ||
   !session.user.agencyId
 ) {
   return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
 }
  // Update order status to delivered
  await db
    .update(orders)
    .set({ status: "delivered" })
    .where(eq(orders.id, id));

  // Get order items
  const items = await db
    .select({
      productId: orderItems.productId,
      quantity: orderItems.quantity,
    })
    .from(orderItems)
    .where(eq(orderItems.orderId, id));

  for (const item of items) {
    const stockEntry = await db
      .select({ id: stock.id, quantity: stock.quantity })
      .from(stock)
      .where(eq(stock.productId, item.productId))
      .where(eq(stock.agencyId, session.user.agencyId))
      .limit(1);

    if (stockEntry.length === 0 || stockEntry[0].quantity < item.quantity) {
      // Rollback or error
      throw new Error("Insufficient stock");
    }

    const stockId = stockEntry[0].id;
    const newQuantity = stockEntry[0].quantity - item.quantity;

    await db
      .update(stock)
      .set({ quantity: newQuantity })
      .where(eq(stock.id, stockId));

    await db.insert(stockMovements).values({
      id: crypto.randomUUID(),
      stockId,
      type: "deduct",
      quantity: item.quantity,
      reason: `Order #${id} delivered`,
      performedBy: session.user.id,
    });
  }

  return NextResponse.json({ success: true });
}
