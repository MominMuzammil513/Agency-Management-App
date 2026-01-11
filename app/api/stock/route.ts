// // app/api/stock/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import { db } from "@/db/db";
// import { stock, stockMovements, products, categories } from "@/db/schemas";
// import { eq, sql, and } from "drizzle-orm";
// import { authOptions } from "@/lib/authOptions";
// import { addStockApiSchema, updateStockApiSchema } from "@/lib/zod.schema/stock.schema";

// export async function GET() {
//   const session = await getServerSession(authOptions);
//   if (!session?.user?.agencyId || session.user.role !== "owner_admin") {
//     return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//   }

//   try {
//     // 1. Fetch categories with total stock
//     const categoriesWithStock = await db
//       .select({
//         categoryId: categories.id,
//         categoryName: categories.name,
//         totalStock: sql<number>`COALESCE(SUM(${stock.quantity}), 0)`.as(
//           "totalStock"
//         ),
//       })
//       .from(categories)
//       .leftJoin(products, eq(products.categoryId, categories.id))
//       .leftJoin(stock, eq(stock.productId, products.id))
//       .where(eq(categories.agencyId, session.user.agencyId))
//       .groupBy(categories.id, categories.name);

//     // 2. Fetch products with stock (FIXED: Added aliases to avoid "ambiguous column" error)
//     const productsWithStock = await db
//       .select({
//         productId: products.id,
//         productName: products.name,
//         categoryId: products.categoryId,
//         categoryName: sql<string>`${categories.name}`.as("category_name"), // Alias fix
//         quantity: sql<number>`COALESCE(${stock.quantity}, 0)`.as("quantity"), // NULL handling fix
//       })
//       .from(products)
//       .leftJoin(categories, eq(products.categoryId, categories.id))
//       .leftJoin(stock, eq(stock.productId, products.id))
//       .where(eq(products.agencyId, session.user.agencyId));

//     return NextResponse.json({
//       categories: categoriesWithStock,
//       products: productsWithStock,
//     });
//   } catch (error: any) {
//     console.error("Error fetching stock:", error);
//     return NextResponse.json(
//       { message: "Failed to fetch stock data", error: error.message },
//       { status: 500 }
//     );
//   }
// }

// export async function POST(req: NextRequest) {
//   const session = await getServerSession(authOptions);
//   if (!session?.user?.agencyId || session.user.role !== "owner_admin") {
//     return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//   }

//   try {
//     const body = await req.json();
//     const parsed = addStockApiSchema.safeParse(body);

//     if (!parsed.success) {
//       return NextResponse.json(
//         { message: "Validation failed", errors: parsed.error.issues },
//         { status: 400 }
//       );
//     }

//     const { categoryId, productId, quantity, reason } = parsed.data;

//     // Verify product belongs to agency
//     const productCheck = await db
//       .select({ id: products.id })
//       .from(products)
//       .where(
//         and(
//           eq(products.id, productId),
//           eq(products.agencyId, session.user.agencyId)
//         )
//       )
//       .limit(1);

//     if (productCheck.length === 0) {
//       return NextResponse.json(
//         { message: "Invalid product or unauthorized" },
//         { status: 400 }
//       );
//     }

//     // Check if stock entry exists
//     const existingStock = await db
//       .select({ id: stock.id, quantity: stock.quantity })
//       .from(stock)
//       .where(
//         and(
//           eq(stock.productId, productId),
//           eq(stock.agencyId, session.user.agencyId)
//         )
//       )
//       .limit(1);

//     let stockId;

//     if (existingStock.length === 0) {
//       // Create new stock entry
//       const newStock = await db
//         .insert(stock)
//         .values({
//           id: crypto.randomUUID(),
//           productId,
//           agencyId: session.user.agencyId,
//           quantity,
//         })
//         .returning({ id: stock.id });

//       stockId = newStock[0].id;
//     } else {
//       // Update existing stock
//       stockId = existingStock[0].id;
//       await db
//         .update(stock)
//         .set({
//           quantity: sql`${stock.quantity} + ${quantity}`,
//         })
//         .where(eq(stock.id, stockId));
//     }

//     // Record Movement
//     await db.insert(stockMovements).values({
//       id: crypto.randomUUID(),
//       stockId,
//       type: "add",
//       quantity,
//       reason: reason || "Stock added manually",
//       performedBy: session.user.id,
//     });

//     return NextResponse.json({ success: true, message: "Stock added" });
//   } catch (error: any) {
//     console.error("Error adding stock:", error);
//     return NextResponse.json(
//       { message: "Server error", error: error.message },
//       { status: 500 }
//     );
//   }
// }

// export async function PUT(req: NextRequest) {
//   const session = await getServerSession(authOptions);
//   if (!session?.user?.agencyId || session.user.role !== "owner_admin") {
//     return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//   }

//   try {
//     const body = await req.json();
//     const parsed = updateStockApiSchema.safeParse(body);

//     if (!parsed.success) {
//       return NextResponse.json(
//         { message: "Validation failed", errors: parsed.error.issues },
//         { status: 400 }
//       );
//     }

//     const { productId, quantity, type, reason } = parsed.data;

//     // Get current stock
//     const stockEntry = await db
//       .select({ id: stock.id, quantity: stock.quantity })
//       .from(stock)
//       .where(
//         and(
//           eq(stock.productId, productId),
//           eq(stock.agencyId, session.user.agencyId)
//         )
//       )
//       .limit(1);

//     if (stockEntry.length === 0) {
//       return NextResponse.json(
//         { message: "No stock found for this product" },
//         { status: 404 }
//       );
//     }

//     const stockId = stockEntry[0].id;
//     const currentQuantity = stockEntry[0].quantity;

//     let newQuantity = currentQuantity;
//     if (type === "increase") {
//       newQuantity = currentQuantity + quantity;
//     } else {
//       newQuantity = currentQuantity - quantity;
//     }

//     if (newQuantity < 0) {
//       return NextResponse.json(
//         { message: "Insufficient stock to decrease" },
//         { status: 400 }
//       );
//     }

//     // Update Stock
//     await db
//       .update(stock)
//       .set({ quantity: newQuantity })
//       .where(eq(stock.id, stockId));

//     // Record Movement
//     await db.insert(stockMovements).values({
//       id: crypto.randomUUID(),
//       stockId,
//       type: type === "increase" ? "add" : "deduct", // Map frontend type to db enum
//       quantity,
//       reason: reason || `Manual ${type}`,
//       performedBy: session.user.id,
//     });

//     return NextResponse.json({ success: true, message: "Stock updated" });
//   } catch (error: any) {
//     console.error("Error updating stock:", error);
//     return NextResponse.json(
//       { message: "Server error", error: error.message },
//       { status: 500 }
//     );
//   }
// }


import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/db/db";
import { stock, stockMovements, products, categories } from "@/db/schemas";
import { eq, sql, and } from "drizzle-orm";
import { authOptions } from "@/lib/authOptions";
import { addStockApiSchema, updateStockApiSchema } from "@/lib/zod.schema/stock.schema";
import { broadcastStockUpdated } from "@/lib/realtime-broadcast";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.agencyId || session.user.role !== "owner_admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const categoriesWithStock = await db
      .select({
        categoryId: categories.id,
        categoryName: categories.name,
        totalStock: sql<number>`COALESCE(SUM(${stock.quantity}), 0)`.as("totalStock"),
      })
      .from(categories)
      .leftJoin(products, eq(products.categoryId, categories.id))
      .leftJoin(stock, eq(stock.productId, products.id))
      .where(eq(categories.agencyId, session.user.agencyId))
      .groupBy(categories.id, categories.name);

    const productsWithStock = await db
      .select({
        productId: products.id,
        productName: products.name,
        categoryId: products.categoryId,
        categoryName: sql<string>`${categories.name}`.as("category_name"),
        quantity: sql<number>`COALESCE(${stock.quantity}, 0)`.as("quantity"),
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(stock, eq(stock.productId, products.id))
      .where(eq(products.agencyId, session.user.agencyId));

    return NextResponse.json({
      categories: categoriesWithStock,
      products: productsWithStock,
    });
  } catch (error: any) {
    return NextResponse.json({ message: "Error", error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.agencyId || session.user.role !== "owner_admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = addStockApiSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ message: "Validation failed" }, { status: 400 });

    const { productId, quantity, reason } = parsed.data;

    // Check existing
    const existingStock = await db
      .select({ id: stock.id })
      .from(stock)
      .where(and(eq(stock.productId, productId), eq(stock.agencyId, session.user.agencyId)))
      .limit(1);

    let finalQuantity = quantity;

    if (existingStock.length === 0) {
      await db.insert(stock).values({
        id: crypto.randomUUID(),
        productId,
        agencyId: session.user.agencyId,
        quantity,
      });
    } else {
      await db
        .update(stock)
        .set({ quantity: sql`${stock.quantity} + ${quantity}` })
        .where(eq(stock.id, existingStock[0].id));
      
      const updated = await db.select({quantity: stock.quantity}).from(stock).where(eq(stock.id, existingStock[0].id));
      finalQuantity = updated[0]?.quantity || 0;
    }

    // Broadcast real-time update
    await broadcastStockUpdated(session.user.agencyId, {
      productId,
      quantity: finalQuantity,
      action: "added",
    });

    return NextResponse.json({ success: true, message: "Stock added" });
  } catch (error: any) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.agencyId || session.user.role !== "owner_admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = updateStockApiSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ message: "Validation failed" }, { status: 400 });

    const { productId, quantity, type } = parsed.data;

    const stockEntry = await db
      .select({ id: stock.id, quantity: stock.quantity })
      .from(stock)
      .where(and(eq(stock.productId, productId), eq(stock.agencyId, session.user.agencyId)))
      .limit(1);

    if (stockEntry.length === 0) return NextResponse.json({ message: "No stock found" }, { status: 404 });

    let newQuantity = stockEntry[0].quantity;
    if (type === "increase") newQuantity += quantity;
    else newQuantity -= quantity;

    if (newQuantity < 0) return NextResponse.json({ message: "Insufficient stock" }, { status: 400 });

    await db.update(stock).set({ quantity: newQuantity }).where(eq(stock.id, stockEntry[0].id));

    // Broadcast real-time update
    await broadcastStockUpdated(session.user.agencyId, {
      productId,
      quantity: newQuantity,
      action: type,
    });

    return NextResponse.json({ success: true, message: "Stock updated" });
  } catch (error: any) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}