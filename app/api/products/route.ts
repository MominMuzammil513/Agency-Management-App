// // app/api/products/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { db } from "@/db/db";
// import { products } from "@/db/schemas";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/authOptions";

// export async function POST(req: NextRequest) {
//   const session = await getServerSession(authOptions);

//   if (
//     !session ||
//     session.user.role !== "owner_admin" ||
//     !session.user.agencyId
//   ) {
//     return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//   }

//   const body = await req.json();
//   const { name, categoryId, purchasePrice, sellingPrice, imageUrl } = body; // ✅ include imageUrl

//   if (!name || name.length < 2) {
//     return NextResponse.json(
//       { message: "Name must be at least 2 characters" },
//       { status: 400 }
//     );
//   }

//   const [newProduct] = await db
//     .insert(products)
//     .values({
//       id: crypto.randomUUID(),
//       name,
//       categoryId,
//       agencyId: session.user.agencyId,
//       purchasePrice,
//       sellingPrice,
//       imageUrl, // ✅ save imageUrl
//     })
//     .returning();

//   return NextResponse.json({ product: newProduct });
// }

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/db";
import { products } from "@/db/schemas";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { broadcastProductCreated } from "@/lib/realtime-broadcast";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.agencyId || session.user.role !== "owner_admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, categoryId, purchasePrice, sellingPrice, imageUrl } = body;

  if (!name || name.length < 2) {
    return NextResponse.json({ message: "Name required" }, { status: 400 });
  }

  const [newProduct] = await db
    .insert(products)
    .values({
      id: crypto.randomUUID(),
      name,
      categoryId,
      agencyId: session.user.agencyId,
      purchasePrice,
      sellingPrice,
      imageUrl,
    })
    .returning();

  // Broadcast real-time update
  await broadcastProductCreated(session.user.agencyId, newProduct);

  return NextResponse.json({ product: newProduct });
}