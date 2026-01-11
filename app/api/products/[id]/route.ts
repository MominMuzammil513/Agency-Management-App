// // app/api/products/[id]/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { db } from "@/db/db";
// import { products } from "@/db/schemas";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/authOptions";
// import { eq, and } from "drizzle-orm";

// export async function PUT(
//   req: NextRequest,
//   context: { params: Promise<{ id: string }> }
// ) {
//   const { id } = await context.params; // ✅ unwrap params
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

//   const updated = await db
//     .update(products)
//     .set({ name, categoryId, purchasePrice, sellingPrice, imageUrl }) // ✅ update imageUrl
//     .where(
//       and(eq(products.id, id), eq(products.agencyId, session.user.agencyId))
//     )
//     .returning();

//   if (!updated.length) {
//     return NextResponse.json({ message: "Not found" }, { status: 404 });
//   }

//   return NextResponse.json({ product: updated[0] });
// }

// export async function DELETE(
//   _req: NextRequest,
//   context: { params: Promise<{ id: string }> }
// ) {
//   const { id } = await context.params; // ✅ unwrap params
//   const session = await getServerSession(authOptions);

//   if (
//     !session ||
//     session.user.role !== "owner_admin" ||
//     !session.user.agencyId
//   ) {
//     return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//   }

//   const deleted = await db
//     .delete(products)
//     .where(
//       and(eq(products.id, id), eq(products.agencyId, session.user.agencyId))
//     )
//     .returning();

//   if (!deleted.length) {
//     return NextResponse.json({ message: "Not found" }, { status: 404 });
//   }

//   return NextResponse.json({ success: true });
// }


import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/db";
import { products } from "@/db/schemas";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { eq, and } from "drizzle-orm";
import { emitToRoom } from "@/lib/socket-server"; // 👈 Import

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.agencyId || session.user.role !== "owner_admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, categoryId, purchasePrice, sellingPrice, imageUrl } = body;

  const updated = await db
    .update(products)
    .set({ name, categoryId, purchasePrice, sellingPrice, imageUrl })
    .where(and(eq(products.id, id), eq(products.agencyId, session.user.agencyId)))
    .returning();

  if (!updated.length) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  // 📡 Emit Socket Event
  emitToRoom(`agency:${session.user.agencyId}`, "product:updated", updated[0]);

  return NextResponse.json({ product: updated[0] });
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.agencyId || session.user.role !== "owner_admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const deleted = await db
    .delete(products)
    .where(and(eq(products.id, id), eq(products.agencyId, session.user.agencyId)))
    .returning();

  if (!deleted.length) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  // 📡 Emit Socket Event
  emitToRoom(`agency:${session.user.agencyId}`, "product:deleted", id);

  return NextResponse.json({ success: true });
}