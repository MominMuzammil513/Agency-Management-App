import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { db } from "@/db/db";
import { orders } from "@/db/schemas";
import { eq } from "drizzle-orm";
import { emitToRoom } from "@/lib/socket-server";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "delivery_boy") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { orderId, status } = await req.json();

  if (!orderId || status !== "delivered") {
    return NextResponse.json({ message: "Invalid Request" }, { status: 400 });
  }

  try {
    // Get order details before update for socket event
    const orderToUpdate = await db
      .select({ agencyId: orders.agencyId })
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (orderToUpdate.length === 0) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    await db
      .update(orders)
      .set({
        status: "delivered",
        // You can add paymentStatus: 'paid' here if delivery implies payment collection
        updatedAt: new Date().toISOString(), // Assuming string date for SQLite
      })
      .where(eq(orders.id, orderId));

    // 📡 Emit Socket.io event for real-time order status update
    emitToRoom(`agency:${orderToUpdate[0].agencyId}`, "order:status-updated", {
      orderId,
      status: "delivered",
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ message: "DB Error" }, { status: 500 });
  }
}
