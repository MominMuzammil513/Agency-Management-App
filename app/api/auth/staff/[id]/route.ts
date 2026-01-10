import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { db } from "@/db/db";
import { users } from "@/db/schemas";
import { eq, and } from "drizzle-orm";
import { updateStaffSchema } from "@/lib/zod.schema/update-staff";
import bcrypt from "bcryptjs";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "owner_admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Owner ki Agency ID verify karo
    const [owner] = await db
      .select({ agencyId: users.agencyId })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!owner || !owner.agencyId) {
      return NextResponse.json({ message: "Agency not found" }, { status: 403 });
    }

    const body = await req.json();

    // Empty password ko undefined kar do taaki validation pass ho jaye
    if (body.password === "") delete body.password;

    const data = updateStaffSchema.parse({ ...body, staffId: id });

    // Update Object banao (Schema ke keys ke hisab se)
    const updateData: Partial<typeof users.$inferInsert> = {};

    if (data.name) updateData.name = data.name;
    if (data.email) updateData.email = data.email.toLowerCase();
    if (data.mobile) updateData.mobile = data.mobile;
    if (data.role) updateData.role = data.role as any; // Type assertion since schema matches enum
    
    if (data.altMobile !== undefined) {
      updateData.altMobile = data.altMobile || null;
    }

    // 🔐 Password Hash Logic
    if (body.password && body.password.length >= 6) {
      updateData.passwordHash = await bcrypt.hash(body.password, 10);
    }

    // Database Update
    await db
      .update(users)
      .set(updateData)
      .where(
        and(
          eq(users.id, id),
          eq(users.agencyId, owner.agencyId) // ✅ Security: Sirf apni agency ke staff ko update karo
        )
      );

    return NextResponse.json({ success: true, message: "Staff updated" });

  } catch (error: any) {
    return NextResponse.json(
      { message: error?.issues?.[0]?.message || error.message || "Error" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "owner_admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const [owner] = await db
      .select({ agencyId: users.agencyId })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

  if (!owner || !owner.agencyId) {
      return NextResponse.json({ message: "Agency not found" }, { status: 403 });
  }

  // Delete Staff
  await db
    .delete(users)
    .where(
      and(
        eq(users.id, id),
        eq(users.agencyId, owner.agencyId) // ✅ Security
      )
    );

  return NextResponse.json({ success: true, message: "Staff deleted" });
}