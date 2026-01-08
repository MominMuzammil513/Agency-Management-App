// app/api/stock/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/db/db";
import { stock } from "@/db/schemas";
import { eq, and } from "drizzle-orm";
import { authOptions } from "@/lib/authOptions";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.agencyId || session.user.role !== "owner_admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // Await params if using Next.js 15+ (safe for 13/14 too in some cases, but direct access is standard for older)
  // Assuming standard Next.js 14 behavior:
  const productId = params.id;

  try {
    // Check if stock exists for this agency and product
    const stockEntry = await db
      .select({ id: stock.id })
      .from(stock)
      .where(
        and(
          eq(stock.productId, productId),
          eq(stock.agencyId, session.user.agencyId)
        )
      )
      .limit(1);

    if (stockEntry.length === 0) {
      return NextResponse.json(
        { message: "Stock entry not found" },
        { status: 404 }
      );
    }

    // Delete stock
    await db.delete(stock).where(eq(stock.id, stockEntry[0].id));

    // Optional: You might want to delete stockMovements too, or keep them for history.
    // Keeping history is safer, but if foreign key constraints exist without cascade, this might fail.
    // Assuming no strict FK constraint preventing delete or relying on CASCADE:

    return NextResponse.json({ success: true, message: "Stock deleted" });
  } catch (error: any) {
    console.error("Error deleting stock:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
