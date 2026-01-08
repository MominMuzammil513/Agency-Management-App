import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/db/db";
import { users } from "@/db/schemas";
import { generateId } from "@/lib/generateId";
import { createStaffSchema } from "@/lib/zod.schema/create-staff";
import { eq } from "drizzle-orm";
import { handleApiError } from "@/lib/api-error";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = createStaffSchema.parse(body);

    // Check if email already exists
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

    // Generate staff id
    const id = generateId();

    // Insert staff
    await db.insert(users).values({
      id,
      name: data.name,
      email: data.email.toLowerCase(),
      passwordHash: await bcrypt.hash(data.password, 10),
      mobile: data.mobile,
      altMobile: data.altMobile ?? null,
      role: data.role, // salesman / delivery_boy
      agencyId: data.agencyId, // Owner's agency
      isActive: true,
      mustResetPassword: false,
    });

    return NextResponse.json({
      success: true,
      message: "Staff created successfully",
    },{status:201});
  } catch (error) {
    return handleApiError(error);
  }
}
