import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { db } from "@/db/db";
import { users } from "@/db/schemas";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const statusSchema = z.object({
  isActive: z.boolean(),
});

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

    const body = await req.json();
    const result = statusSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 });
    }

    const { isActive } = result.data;

    const [owner] = await db
      .select({ agencyId: users.agencyId })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!owner || !owner.agencyId) {
      return NextResponse.json({ message: "Agency not found" }, { status: 403 });
    }

    // Update Status
    // Schema mein integer hai but mode: "boolean" hai, toh direct boolean pass kar sakte hain
    await db
      .update(users)
      .set({ isActive: isActive }) 
      .where(
        and(
          eq(users.id, id),
          eq(users.agencyId, owner.agencyId)
        )
      );

    return NextResponse.json({
      success: true,
      message: isActive ? "Staff Activated" : "Staff Deactivated",
    });

  } catch (error: any) {
    return NextResponse.json(
      { message: "Failed to update status" },
      { status: 500 }
    );
  }
}