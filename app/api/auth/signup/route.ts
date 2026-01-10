import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth"; // 🔐 Session Import
import { authOptions } from "@/lib/authOptions";
import bcrypt from "bcryptjs";
import { db } from "@/db/db";
import { users } from "@/db/schemas";
import { generateId } from "@/lib/generateId";
import { createStaffSchema } from "@/lib/zod.schema/create-staff";
import { eq } from "drizzle-orm";
import { handleApiError } from "@/lib/api-error";

export async function POST(req: NextRequest) {
  try {
    // 1. Auth Check
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const data = createStaffSchema.parse(body);

    // 2. Fetch Owner's Agency ID (Secure Way) 🛡️
    const [owner] = await db
      .select({ agencyId: users.agencyId })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!owner || !owner.agencyId) {
      return NextResponse.json(
        { success: false, message: "Owner agency not found" },
        { status: 403 }
      );
    }

    // 3. Check Duplicate Email
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email.toLowerCase()))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, message: "Email already registered" },
        { status: 409 }
      );
    }

    // 4. Insert Staff
    const id = generateId();
    await db.insert(users).values({
      id,
      name: data.name,
      email: data.email.toLowerCase(),
      passwordHash: await bcrypt.hash(data.password, 10),
      mobile: data.mobile,
      altMobile: data.altMobile ?? null,
      role: data.role,
      agencyId: owner.agencyId, // ✅ Auto-assigned from Owner
      isActive: true,
      mustResetPassword: false,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Staff member welcome aboard! 🎉",
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
