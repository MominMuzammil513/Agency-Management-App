// src/app/api/orders/route.ts
import { NextRequest } from "next/server";
import { CreateOrderSchema } from "@/lib/zod.schema/orders";
import { db } from "@/db/db";
import { orders, orderItems, shops, products } from "@/db/schemas";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = CreateOrderSchema.parse(body);

    // Validate shop and products exist
    const [shop] = await db
      .select()
      .from(shops)
      .where(eq(shops.id, input.shopId));
    if (!shop) return Response.json({ error: "Invalid shop" }, { status: 400 });

    // Validate products and compute totals
    const productIds = input.items.map((i) => i.productId);
    const dbProducts = await db
      .select()
      .from(products)
      .where(eq(products.agencyId, input.agencyId));
    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    for (const item of input.items) {
      if (!productMap.has(item.productId)) {
        return Response.json(
          { error: `Invalid product: ${item.productId}` },
          { status: 400 }
        );
      }
    }

    const orderId = randomUUID();
    await db.insert(orders).values({
      id: orderId,
      shopId: input.shopId,
      agencyId: input.agencyId,
      createdBy: input.createdBy,
      status: "pending",
    });

    await db.insert(orderItems).values(
      input.items.map((i) => ({
        id: randomUUID(),
        orderId,
        productId: i.productId,
        quantity: i.quantity,
        price: i.price, // snapshot
      }))
    );

    return Response.json({ orderId }, { status: 201 });
  } catch (err: any) {
    return Response.json(
      { error: err.message ?? "Invalid request" },
      { status: 400 }
    );
  }
}
