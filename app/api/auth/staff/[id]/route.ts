import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { db } from "@/db/db";
import { users } from "@/db/schemas";
import { eq, and } from "drizzle-orm";
import { updateStaffSchema } from "@/lib/zod.schema/update-staff";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; // ✅ unwrap params
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "owner_admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = updateStaffSchema.parse({
      ...body,
      staffId: id,
    });

    await db
      .update(users)
      .set({
        ...(data.name && { name: data.name }),
        ...(data.mobile && { mobile: data.mobile }),
        ...(data.altMobile !== undefined && {
          altMobile: data.altMobile ?? null,
        }),
        ...(typeof data.isActive === "boolean" && {
          isActive: data.isActive,
        }),
      })
      .where(and(eq(users.id, id), eq(users.agencyId, session.user.id)));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.issues?.[0]?.message || "Error" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; // ✅ unwrap params
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "owner_admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  console.log(id, "papapapapapap");
  await db
    .delete(users)
    .where(and(eq(users.id, id), eq(users.agencyId, session.user.id)));

  return NextResponse.json({ success: true });
}
