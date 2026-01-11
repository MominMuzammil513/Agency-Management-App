// app/api/areas/route.ts (Full Corrected Version – Using searchParams for PUT/DELETE ID)
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/db/db";
import { areas } from "@/db/schemas";
import { eq } from "drizzle-orm";
import { authOptions } from "@/lib/authOptions";
import { emitToRoom, emitToAll } from "@/lib/socket-server";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // Super admin sees all, others only their agency
  const whereClause =
    session.user.role === "super_admin"
      ? undefined
      : eq(areas.agencyId, session.user.agencyId ?? "");

  const areaList = await db
    .select({ id: areas.id, name: areas.name })
    .from(areas)
    .where(whereClause);

  return NextResponse.json({ areas: areaList });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name } = body;

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    return NextResponse.json(
      { message: "Valid area name required" },
      { status: 400 }
    );
  }

  const agencyId = session.user.agencyId;
  if (!agencyId && session.user.role !== "super_admin") {
    return NextResponse.json(
      { message: "Agency access required" },
      { status: 403 }
    );
  }
  if (!agencyId) {
    return new NextResponse("Agency ID is required", { status: 400 });
  }

  const newArea = await db
    .insert(areas)
    .values({
      id: crypto.randomUUID(),
      name: name.trim(),
      agencyId: agencyId ?? null,
    })
    .returning({ id: areas.id, name: areas.name });

  // 📡 Emit Socket.io event for real-time update
  const areaData = newArea[0];
  if (agencyId) {
    emitToRoom(`agency:${agencyId}`, "area:created", areaData);
  } else {
    emitToAll("area:created", areaData);
  }

  return NextResponse.json({ area: areaData });
}

// PUT & DELETE using searchParams (?id=...)
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ message: "Area ID required" }, { status: 400 });
  }

  const { name } = await req.json();
  if (!name || typeof name !== "string" || name.trim().length < 2) {
    return NextResponse.json(
      { message: "Valid name required" },
      { status: 400 }
    );
  }

  // Ownership check
  const existing = await db
    .select({ agencyId: areas.agencyId })
    .from(areas)
    .where(eq(areas.id, id))
    .limit(1);

  if (existing.length === 0) {
    return NextResponse.json({ message: "Area not found" }, { status: 404 });
  }

  if (
    existing[0].agencyId !== session.user.agencyId &&
    session.user.role !== "super_admin"
  ) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const updated = await db
    .update(areas)
    .set({ name: name.trim() })
    .where(eq(areas.id, id))
    .returning({ id: areas.id, name: areas.name });

  // 📡 Emit Socket.io event for real-time update
  const areaData = updated[0];
  const agencyId = existing[0].agencyId;
  if (agencyId) {
    emitToRoom(`agency:${agencyId}`, "area:updated", areaData);
  } else {
    emitToAll("area:updated", areaData);
  }

  return NextResponse.json({ area: areaData });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ message: "Area ID required" }, { status: 400 });
  }

  // Ownership check
  const existing = await db
    .select({ agencyId: areas.agencyId })
    .from(areas)
    .where(eq(areas.id, id))
    .limit(1);

  if (existing.length === 0) {
    return NextResponse.json({ message: "Area not found" }, { status: 404 });
  }

  if (
    existing[0].agencyId !== session.user.agencyId &&
    session.user.role !== "super_admin"
  ) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  await db.delete(areas).where(eq(areas.id, id));

  // 📡 Emit Socket.io event for real-time update
  const agencyId = existing[0].agencyId;
  if (agencyId) {
    emitToRoom(`agency:${agencyId}`, "area:deleted", id);
  } else {
    emitToAll("area:deleted", id);
  }

  return NextResponse.json({ success: true });
}
