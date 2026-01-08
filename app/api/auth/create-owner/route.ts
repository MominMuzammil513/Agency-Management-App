import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/db/db";
import { users, agencies } from "@/db/schemas";
import { generateId } from "@/lib/generateId";
import { createOwnerAdminSchema } from "@/lib/zod.schema/create-owner-admin";
import { ApiError, handleApiError } from "@/lib/api-error";
import { handleDbError } from "@/lib/db-error";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = createOwnerAdminSchema.parse(body);

    // 🔍 Email exists check
    const existingUser = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, data.email.toLowerCase()))
      .limit(1);

    if (existingUser.length > 0) {
      throw new ApiError("Email already registered", 409);
    }

    const ownerId = generateId();
    const agencyId = generateId();

    await db.transaction(async (tx) => {
      await tx.insert(agencies).values({
        id: agencyId,
        name: data.agencyName,
        ownerId,
      });

      await tx.insert(users).values({
        id: ownerId,
        email: data.email.toLowerCase(),
        passwordHash: await bcrypt.hash(data.password, 10),
        name: data.ownerName,
        mobile: data.mobile,
        role: "owner_admin",
        agencyId,
        isActive: true,
        mustResetPassword: false,
      });
    });

    return NextResponse.json(
      {
        success: true,
        message: "Owner admin created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    try {
      handleDbError(error);
    } catch (dbError) {
      return handleApiError(dbError);
    }

    return handleApiError(error);
  }
}
