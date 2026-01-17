import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { db } from "@/db/db";
import { users, agencies } from "@/db/schemas";
import { eq } from "drizzle-orm";
import { updateOwnerAdminSchema } from "@/lib/zod.schema/update-owner-admin";
import bcrypt from "bcryptjs";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Only super_admin can update owner admins
    if (!session || session.user.role !== "super_admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await req.json();

    // Validate input
    const data = updateOwnerAdminSchema.parse(body);

    // Check if owner admin exists
    const [owner] = await db
      .select({
        id: users.id,
        agencyId: users.agencyId,
        email: users.email,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!owner || owner.agencyId === null) {
      return NextResponse.json({ message: "Owner admin not found" }, { status: 404 });
    }

    // If email is being updated, check for duplicates
    if (data.email && data.email.toLowerCase() !== owner.email) {
      const [existingUser] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, data.email.toLowerCase()))
        .limit(1);

      if (existingUser) {
        return NextResponse.json(
          { message: "Email already registered" },
          { status: 409 }
        );
      }
    }

    // Update user data
    const userUpdateData: any = {};
    if (data.ownerName) userUpdateData.name = data.ownerName;
    if (data.email) userUpdateData.email = data.email.toLowerCase();
    if (data.mobile) userUpdateData.mobile = data.mobile;
    if (data.altMobile !== undefined) userUpdateData.altMobile = data.altMobile || null;
    if (data.isActive !== undefined) userUpdateData.isActive = data.isActive;
    if (data.password) {
      userUpdateData.passwordHash = await bcrypt.hash(data.password, 10);
    }

    // Update agency name if provided
    if (data.agencyName && owner.agencyId) {
      await db
        .update(agencies)
        .set({ name: data.agencyName })
        .where(eq(agencies.id, owner.agencyId));
    }

    // Update user
    if (Object.keys(userUpdateData).length > 0) {
      await db
        .update(users)
        .set(userUpdateData)
        .where(eq(users.id, id));
    }

    // Fetch updated data
    const [updatedOwner] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        mobile: users.mobile,
        altMobile: users.altMobile,
        isActive: users.isActive,
        agencyId: users.agencyId,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    const [agency] = owner.agencyId
      ? await db
          .select({ id: agencies.id, name: agencies.name })
          .from(agencies)
          .where(eq(agencies.id, owner.agencyId))
          .limit(1)
      : [null];

    return NextResponse.json({
      success: true,
      message: "Owner admin updated successfully",
      data: {
        ...updatedOwner,
        agencyName: agency?.name,
      },
    });
  } catch (error: any) {
    if (error?.issues) {
      return NextResponse.json(
        { message: error.issues[0]?.message || "Validation error" },
        { status: 400 }
      );
    }
    console.error("Update owner admin error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to update owner admin" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "super_admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    // Check if owner admin exists
    const [owner] = await db
      .select({
        id: users.id,
        agencyId: users.agencyId,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!owner) {
      return NextResponse.json({ message: "Owner admin not found" }, { status: 404 });
    }

    // Deactivate instead of delete (soft delete approach)
    await db
      .update(users)
      .set({ isActive: false })
      .where(eq(users.id, id));

    return NextResponse.json({
      success: true,
      message: "Owner admin deactivated successfully",
    });
  } catch (error: any) {
    console.error("Delete owner admin error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to deactivate owner admin" },
      { status: 500 }
    );
  }
}
