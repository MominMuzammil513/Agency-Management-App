// app/api/categories/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/db";
import { categories } from "@/db/schemas";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { eq, and } from "drizzle-orm";

// PUT /api/categories/[id]
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; // ✅ unwrap params

  const session = await getServerSession(authOptions);
  if (
    !session ||
    session.user.role !== "owner_admin" ||
    !session.user.agencyId
  ) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const name: string = (body?.name || "").trim();
  if (!name || name.length < 2) {
    return NextResponse.json(
      { message: "Name must be at least 2 characters" },
      { status: 400 }
    );
  }

  const updated = await db
    .update(categories)
    .set({ name }) // ✅ updatedAt handled by DB default
    .where(
      and(eq(categories.id, id), eq(categories.agencyId, session.user.agencyId))
    )
    .returning({
      id: categories.id,
      name: categories.name,
      createdAt: categories.createdAt,
    });

  if (!updated.length) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ category: updated[0] });
}

// DELETE /api/categories/[id]
export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; // ✅ unwrap params

  const session = await getServerSession(authOptions);
  if (
    !session ||
    session.user.role !== "owner_admin" ||
    !session.user.agencyId
  ) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const result = await db
    .delete(categories)
    .where(
      and(eq(categories.id, id), eq(categories.agencyId, session.user.agencyId))
    )
    .returning({ id: categories.id });

  if (!result.length) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
