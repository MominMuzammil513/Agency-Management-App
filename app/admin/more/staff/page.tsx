// app/admin/more/managestaff/page.tsx
import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { db } from "@/db/db";
import { users } from "@/db/schemas";
import { and, eq, inArray } from "drizzle-orm";

import StaffList from "./components/StaffList";

export default async function ManageStaffPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "owner_admin") {
    throw new Error("Unauthorized");
  }

  // 🔍 owner agency
  const [owner] = await db
    .select({ agencyId: users.agencyId })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!owner?.agencyId) {
    throw new Error("Owner agency not found");
  }

  // 👥 fetch staff (same agency)
  const staff = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      mobile: users.mobile,
      altMobile: users.altMobile,
      role: users.role,
      isActive: users.isActive,
      createdAt: users.createdAt,
    })
    .from(users)
          .where(
            and(
              eq(users.agencyId, owner.agencyId),
              inArray(users.role, ["salesman", "delivery_boy"])
            )
          );

  return (
    <div className="p-6 space-y-6">
      <Suspense fallback={<div>Loading staff...</div>}>
        <StaffList initialStaff={staff} />
      </Suspense>
    </div>
  );
}
