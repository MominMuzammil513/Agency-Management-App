// app/api/shops/route.ts (GET & POST)
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/db/db";
import { shops } from "@/db/schemas";
import { eq } from "drizzle-orm";
import { authOptions } from "@/lib/authOptions";
import { emitToRoom } from "@/lib/socket-server";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const areaId = url.searchParams.get("areaId");
  if (!areaId) {
    return NextResponse.json({ message: "Area ID required" }, { status: 400 });
  }

  const shopList = await db
    .select({
      id: shops.id,
      name: shops.name,
      ownerName: shops.ownerName,
      mobile: shops.mobile,
    })
    .from(shops)
    .where(eq(shops.areaId, areaId));

  return NextResponse.json({ shops: shopList });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, ownerName, mobile, areaId } = body;

  if (!name || !areaId) {
    return NextResponse.json(
      { message: "Name and area required" },
      { status: 400 }
    );
  }
  if (!session.user.agencyId) {
    return new NextResponse("Agency ID is required", { status: 400 });
  }

  const newShop = await db
    .insert(shops)
    .values({
      id: crypto.randomUUID(),
      name,
      ownerName: ownerName || null,
      mobile: mobile || null,
      areaId,
      agencyId: session.user.agencyId ?? null,
    })
    .returning({
      id: shops.id,
      name: shops.name,
      ownerName: shops.ownerName,
      mobile: shops.mobile,
      areaId: shops.areaId, // Include areaId for filtering
    });

  // 📡 Emit Socket.io event for real-time update to both area and agency
  const shopData = newShop[0];
  const agencyId = session.user.agencyId;
  
  console.log("📦 Shop created, emitting Socket.io events:", {
    shopData,
    areaId,
    agencyId,
    room1: `area:${areaId}`,
    room2: agencyId ? `agency:${agencyId}` : null,
  });
  
  // Emit to area room for users viewing that area
  emitToRoom(`area:${areaId}`, "shop:created", shopData);
  
  // Also emit to agency room so all agency users see the update
  if (agencyId) {
    emitToRoom(`agency:${agencyId}`, "shop:created", shopData);
  }

  return NextResponse.json({ shop: shopData });
}
