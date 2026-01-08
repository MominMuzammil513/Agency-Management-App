// app/api/categories/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/db";
import { categories } from "@/db/schemas";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { eq } from "drizzle-orm";
import { generateId } from "@/lib/generateId";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (
    !session ||
    session.user.role !== "owner_admin" ||
    !session.user.agencyId
  ) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const result = await db
    .select({
      id: categories.id,
      name: categories.name,
      createdAt: categories.createdAt,
    })
    .from(categories)
    .where(eq(categories.agencyId, session.user.agencyId));

  return NextResponse.json({ categories: result });
}

export async function POST(req: NextRequest) {
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

  const id = generateId();

  await db.insert(categories).values({
    id,
    name,
    agencyId: session.user.agencyId,
  });

  return NextResponse.json({
    category: { id, name },
  });
}
