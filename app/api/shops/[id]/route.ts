// app/api/shops/[id]/route.ts (PUT & DELETE)
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/db/db";
import { shops } from "@/db/schemas";
import { eq } from "drizzle-orm";
import { authOptions } from "@/lib/authOptions";

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; // ✅ unwrap params
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { name, ownerName, mobile } = await req.json();

  if (!name)
    return NextResponse.json({ message: "Name required" }, { status: 400 });

  const updated = await db
    .update(shops)
    .set({
      name,
      ownerName: ownerName || null,
      mobile: mobile || null,
    })
    .where(eq(shops.id, id))
    .returning({
      id: shops.id,
      name: shops.name,
      ownerName: shops.ownerName,
      mobile: shops.mobile,
    });

  return NextResponse.json({ shop: updated[0] });
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; // ✅ unwrap params
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  await db.delete(shops).where(eq(shops.id,id));

  return NextResponse.json({ success: true });
}
