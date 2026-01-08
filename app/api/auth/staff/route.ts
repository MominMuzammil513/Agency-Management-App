import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { db } from "@/db/db";
import { users } from "@/db/schemas";
import bcrypt from "bcryptjs";
import { generateId } from "@/lib/generateId";
import { createStaffSchema } from "@/lib/zod.schema/create-staff";
import { and, eq, inArray } from "drizzle-orm";

/* =========================================================
   GET  /api/auth/staff → Fetch staff list
========================================================= */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "owner_admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 🔍 owner agency
    const [owner] = await db
      .select({ agencyId: users.agencyId })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!owner?.agencyId) {
      return NextResponse.json(
        { message: "Owner agency not found" },
        { status: 400 }
      );
    }

    // 👥 fetch ONLY staff (exclude owner_admin & super_admin)
    const staff = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        mobile: users.mobile,
        altMobile: users.altMobile,
        role: users.role,
        isActive: users.isActive,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(
        and(
          eq(users.agencyId, owner.agencyId),
          inArray(users.role, ["salesman", "delivery_boy"])
        )
      );

    return NextResponse.json({
      success: true,
      data: staff,
    });
  } catch (error) {
    console.error("Fetch staff error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}


/* =========================================================
   POST  /api/auth/staff → Create staff
========================================================= */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "owner_admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = createStaffSchema.parse(body);

    // owner agency
    const [owner] = await db
      .select({ agencyId: users.agencyId })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!owner?.agencyId) {
      return NextResponse.json(
        { message: "Owner agency not found" },
        { status: 400 }
      );
    }

    // email exists check
    const [exists] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, data.email.toLowerCase()))
      .limit(1);

    if (exists) {
      return NextResponse.json(
        { message: "Email already registered" },
        { status: 409 }
      );
    }

    await db.insert(users).values({
      id: generateId(),
      name: data.name,
      email: data.email.toLowerCase(),
      passwordHash: await bcrypt.hash(data.password, 10),
      mobile: data.mobile,
      altMobile: data.altMobile ?? null,
      role: data.role,
      agencyId: owner.agencyId,
      isActive: true,
      mustResetPassword: false, // 🔥 since owner sets password
    });

    return NextResponse.json(
      {
        success: true,
        message: "Staff created successfully",
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error?.issues) {
      return NextResponse.json(
        { message: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error("Create staff error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
