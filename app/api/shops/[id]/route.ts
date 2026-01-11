// app/api/shops/[id]/route.ts (PUT & DELETE)
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/db/db";
import { shops } from "@/db/schemas";
import { eq } from "drizzle-orm";
import { authOptions } from "@/lib/authOptions";
import { emitToRoom } from "@/lib/socket-server";

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

  // Get existing shop to find areaId and agencyId for socket rooms
  const existing = await db
    .select({ areaId: shops.areaId, agencyId: shops.agencyId })
    .from(shops)
    .where(eq(shops.id, id))
    .limit(1);

  if (existing.length === 0) {
    return NextResponse.json({ message: "Shop not found" }, { status: 404 });
  }

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
      areaId: shops.areaId, // Include areaId for filtering
    });

  // 📡 Emit Socket.io event for real-time update to both rooms
  const shopData = updated[0];
  emitToRoom(`area:${existing[0].areaId}`, "shop:updated", shopData);
  if (existing[0].agencyId) {
    emitToRoom(`agency:${existing[0].agencyId}`, "shop:updated", shopData);
  }

  return NextResponse.json({ shop: shopData });
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; // ✅ unwrap params
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  // Get existing shop to find areaId and agencyId for socket rooms
  const existing = await db
    .select({ areaId: shops.areaId, agencyId: shops.agencyId })
    .from(shops)
    .where(eq(shops.id, id))
    .limit(1);

  if (existing.length === 0) {
    return NextResponse.json({ message: "Shop not found" }, { status: 404 });
  }

  await db.delete(shops).where(eq(shops.id, id));

  // 📡 Emit Socket.io event for real-time update to both rooms
  emitToRoom(`area:${existing[0].areaId}`, "shop:deleted", id);
  if (existing[0].agencyId) {
    emitToRoom(`agency:${existing[0].agencyId}`, "shop:deleted", id);
  }

  return NextResponse.json({ success: true });
}
