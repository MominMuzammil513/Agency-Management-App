// import { NextRequest, NextResponse } from "next/server";
// import { db } from "@/db/db";
// import { orderItems, products } from "@/db/schemas";
// import { eq, inArray } from "drizzle-orm";

// export async function POST(req: NextRequest) {
//   try {
//     const { orderIds } = await req.json();

//     if (!orderIds || orderIds.length === 0) {
//       return NextResponse.json({ items: [] });
//     }

//     const items = await db
//       .select({
//         orderId: orderItems.orderId,
//         productName: products.name,
//         quantity: orderItems.quantity,
//         price: orderItems.price, // Total price for that line item
//       })
//       .from(orderItems)
//       .innerJoin(products, eq(orderItems.productId, products.id))
//       .where(inArray(orderItems.orderId, orderIds));

//     return NextResponse.json({ items });
//   } catch (error) {
//     return NextResponse.json(
//       { error: "Failed to fetch details" },
//       { status: 500 }
//     );
//   }
// }
// app/api/orders/details/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/db";
import { orderItems, products, categories } from "@/db/schemas";
import { eq, inArray } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { orderIds } = await req.json();

    if (!orderIds || orderIds.length === 0) {
      return NextResponse.json({ items: [] });
    }

    // Include categoryId and categoryName to properly group products by category
    const items = await db
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

    return NextResponse.json({ items });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch details" },
      { status: 500 }
    );
  }
}