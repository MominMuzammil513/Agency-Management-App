// // app/api/stock/[id]/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import { db } from "@/db/db";
// import { stock } from "@/db/schemas";
// import { eq, and } from "drizzle-orm";
// import { authOptions } from "@/lib/authOptions";

// export async function DELETE(
//   req: NextRequest,
//   context: { params: Promise<{ id: string }> } 
// ) {
//   const params = await context.params;  
//   const { id } = params;
//   const session = await getServerSession(authOptions);
//   if (!session?.user?.agencyId || session.user.role !== "owner_admin") {
//     return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//   }

//   try {
//     const stockEntry = await db
//       .select({ id: stock.id })
//       .from(stock)
//       .where(
//         and(
//           eq(stock.productId, id),
//           eq(stock.agencyId, session.user.agencyId)
//         )
//       )
//       .limit(1);

//     if (stockEntry.length === 0) {
//       return NextResponse.json(
//         { message: "Stock entry not found" },
//         { status: 404 }
//       );
//     }
//     await db.delete(stock).where(eq(stock.id, stockEntry[0].id));

//     return NextResponse.json({ success: true, message: "Stock deleted" });
//   } catch (error: any) {
//     console.error("Error deleting stock:", error);
//     return NextResponse.json(
//       { message: "Server error", error: error.message },
//       { status: 500 }
//     );
//   }
// }

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/db/db";
import { stock } from "@/db/schemas";
import { eq, and } from "drizzle-orm";
import { authOptions } from "@/lib/authOptions";

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; // 'id' here is productId based on your implementation
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.agencyId || session.user.role !== "owner_admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const stockEntry = await db
      .select({ id: stock.id })
      .from(stock)
      .where(and(eq(stock.productId, id), eq(stock.agencyId, session.user.agencyId)))
      .limit(1);

    if (stockEntry.length === 0) {
      return NextResponse.json({ message: "Stock entry not found" }, { status: 404 });
    }

    await db.delete(stock).where(eq(stock.id, stockEntry[0].id));

    return NextResponse.json({ success: true, message: "Stock deleted" });
  } catch (error: any) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}