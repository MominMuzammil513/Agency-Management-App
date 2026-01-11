// app/api/profile/change-password/route.ts - Change Password API
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { db } from "@/db/db";
import { users } from "@/db/schemas";
import { eq } from "drizzle-orm";
import { z } from "zod";
import bcrypt from "bcryptjs";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = changePasswordSchema.parse(body);

    // Fetch user with password hash
    const [user] = await db
      .select({
        id: users.id,
        passwordHash: users.passwordHash,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      validatedData.currentPassword,
      user.passwordHash
    );

    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { message: "Current password is incorrect" },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(validatedData.newPassword, 10);

    // Update password
    await db
      .update(users)
      .set({
        passwordHash: hashedPassword,
        mustResetPassword: false,
      })
      .where(eq(users.id, session.user.id));

    return NextResponse.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.issues[0]?.message || "Validation error" },
        { status: 400 }
      );
    }
    console.error("Change password error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to change password" },
      { status: 500 }
    );
  }
}
