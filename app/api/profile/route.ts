// app/api/profile/route.ts - Profile API
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { db } from "@/db/db";
import { users } from "@/db/schemas";
import { eq } from "drizzle-orm";
import { z } from "zod";

const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  mobile: z.string().min(10, "Mobile must be at least 10 digits"),
  altMobile: z.string().optional().nullable(),
});

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = updateProfileSchema.parse(body);

    // Update user profile
    await db
      .update(users)
      .set({
        name: validatedData.name,
        mobile: validatedData.mobile,
        altMobile: validatedData.altMobile || null,
      })
      .where(eq(users.id, session.user.id));

    // Fetch updated user
    const [updatedUser] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        mobile: users.mobile,
        altMobile: users.altMobile,
      })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.issues[0]?.message || "Validation error" },
        { status: 400 }
      );
    }
    console.error("Profile update error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}
