// app/api/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/db/db";
import {
  orders,
  orderItems,
  products,
  stock,
  stockMovements,
} from "@/db/schemas";
import { eq, inArray, sql } from "drizzle-orm";
import { authOptions } from "@/lib/authOptions";
import { z } from "zod";
import { broadcastOrderCreated, broadcastStockUpdated, broadcastOrderDeleted } from "@/lib/realtime-broadcast";

// Validation Schema
const orderSchema = z.object({
  shopId: z.string().min(1),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().min(1),
      })
    )
    .min(1),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  // 1. Auth Check
  if (!session?.user?.agencyId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { shopId, items } = orderSchema.parse(body);

    // 2. Fetch Product Prices & Current Stock for verification
    const productIds = items.map((i) => i.productId);

    // Fetch products with stock details
    const dbProducts = await db
      .select({
        id: products.id,
        price: products.sellingPrice,
        stockId: stock.id,
        currentStock: stock.quantity,
      })
      .from(products)
      .leftJoin(stock, eq(stock.productId, products.id))
      .where(inArray(products.id, productIds));

    // 3. Verify Stock Availability (Server Side Check) 🛑
    for (const item of items) {
      const product = dbProducts.find((p) => p.id === item.productId);

      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }

      // Agar stock table mein entry nahi hai ya stock kam hai
      if (!product.stockId || (product.currentStock || 0) < item.quantity) {
        throw new Error(`Insufficient stock for product ID: ${item.productId}`);
      }
    }

    // 4. Create Order Transaction Logic
    // Drizzle SQLite doesn't strictly support `db.transaction` perfectly via HTTP drivers always, but we sequence it safely.

    const orderId = crypto.randomUUID();

    // A. Insert Order
    await db.insert(orders).values({
      id: orderId,
      shopId,
      agencyId: session.user.agencyId,
      createdBy: session.user.id,
      status: "pending", // Default status
    });

    // B. Process Items & Deduct Stock
    for (const item of items) {
      const product = dbProducts.find((p) => p.id === item.productId)!;

      // Add Order Item
      await db.insert(orderItems).values({
        id: crypto.randomUUID(),
        orderId: orderId,
        productId: item.productId,
        quantity: item.quantity,
        price: product.price * item.quantity, // Snapshot of price at time of order
      });

      // Update Stock (Deduct) 📉
      await db
        .update(stock)
        .set({ quantity: sql`${stock.quantity} - ${item.quantity}` })
        .where(eq(stock.id, product.stockId!));

      // Record Movement (Log) 📝
      await db.insert(stockMovements).values({
        id: crypto.randomUUID(),
        stockId: product.stockId!,
        type: "deduct", // Stock kam hua
        quantity: item.quantity,
        reason: `Order Sale`, // Reference to Order
        performedBy: session.user.id,
      });
    }

    // Broadcast real-time updates
    await broadcastOrderCreated(session.user.agencyId, {
      orderId,
      shopId,
      status: "pending",
      agencyId: session.user.agencyId,
    });

    // Broadcast stock updates
    await broadcastStockUpdated(session.user.agencyId, {
      products: items.map(item => ({ productId: item.productId, quantity: item.quantity })),
    });

    return NextResponse.json({ success: true, orderId });
  } catch (error: any) {
    console.error("Order Error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to place order" },
      { status: 400 }
    );
  }
}
// 🔥 DELETE ORDER (Restore Stock)
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.agencyId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("id");

    if (!orderId) {
      return NextResponse.json({ message: "Order ID required" }, { status: 400 });
    }

    // 1. Fetch Order Items to restore stock
    const itemsToRestore = await db
      .select({
        productId: orderItems.productId,
        quantity: orderItems.quantity,
        stockId: stock.id,
      })
      .from(orderItems)
      .leftJoin(stock, eq(stock.productId, orderItems.productId)) // Join to find stock ID
      .where(eq(orderItems.orderId, orderId));

    if (itemsToRestore.length === 0) {
      return NextResponse.json({ message: "Order not found or empty" }, { status: 404 });
    }

    // 2. Restore Stock & Log Movement
    for (const item of itemsToRestore) {
      if (item.stockId) {
        // A. Stock wapas badhao (+)
        await db.update(stock)
          .set({ quantity: sql`${stock.quantity} + ${item.quantity}` })
          .where(eq(stock.id, item.stockId));

        // B. Log Movement
        await db.insert(stockMovements).values({
          id: crypto.randomUUID(),
          stockId: item.stockId,
          type: "add", // Wapas aaya
          quantity: item.quantity,
          reason: `Order Cancelled #${orderId.slice(0, 6)}`,
          performedBy: session.user.id,
        });
      }
    }

    // Get order details before deletion
    const orderToDelete = await db
      .select({ agencyId: orders.agencyId, shopId: orders.shopId })
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    // 3. Delete Order Items & Order
    await db.delete(orderItems).where(eq(orderItems.orderId, orderId));
    await db.delete(orders).where(eq(orders.id, orderId));

    // Broadcast real-time updates
    if (orderToDelete.length > 0) {
      const order = orderToDelete[0];
      await broadcastOrderDeleted(order.agencyId, orderId);
      await broadcastStockUpdated(order.agencyId, {
        orderId,
        action: "restored",
      });
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Delete Error:", error);
    return NextResponse.json({ message: "Failed to delete order" }, { status: 500 });
  }
}
