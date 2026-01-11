import { db } from "@/db/db";
import { categories, products, stock, stockMovements } from "@/db/schemas";
import { authOptions } from "@/lib/authOptions";
import { eq, sql } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

// app/api/inventory/add/route.ts (POST – Add Stock)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { productId, quantity } = await req.json();
  if (!productId || quantity <= 0) return NextResponse.json({ message: "Invalid data" }, { status: 400 });

  // Upsert stock
  if (!session.user.agencyId) {
    return new NextResponse("Agency ID is required", { status: 400 });
  }
  await db.insert(stock).values({
    id: crypto.randomUUID(),
    productId,
    agencyId: session.user.agencyId,
    quantity,
  }).onConflictDoUpdate({
    target: [stock.productId, stock.agencyId],
    set: { quantity: sql`${stock.quantity} + ${quantity}` },
  });

  // Add movement history
  await db.insert(stockMovements).values({
    id: crypto.randomUUID(),
    stockId: "...", // get from above
    type: "add",
    quantity,
    reason: "New stock added",
    performedBy: session.user.id,
  });

  return NextResponse.json({ success: true });
}

// app/api/inventory/route.ts (GET)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.agencyId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const productsWithStock = await db
    .select()
    .from(products)
    .leftJoin(stock, eq(stock.productId, products.id))
    .leftJoin(categories, eq(categories.id, products.categoryId))
    .where(eq(products.agencyId, session.user.agencyId));

  return NextResponse.json({ products: productsWithStock });
}