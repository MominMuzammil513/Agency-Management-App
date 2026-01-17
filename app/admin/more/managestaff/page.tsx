import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { db } from "@/db/db";
import { users } from "@/db/schemas";
import { and, eq, inArray, desc } from "drizzle-orm";
import StaffList from "./components/StaffList";
import { Users } from "lucide-react";
import { redirect } from "next/navigation";
import { Staff, StaffRole } from "./components/types";
import AgencyError from "@/components/ui/AgencyError";

export default async function ManageStaffPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "owner_admin") {
    redirect("/login");
  }

  const [owner] = await db
    .select({ agencyId: users.agencyId })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!owner?.agencyId) {
    return <AgencyError message="Error: Agency not found." />;
  }

  // Fetch ALL staff (Active + Inactive)
  const rawStaff = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      mobile: users.mobile,
      altMobile: users.altMobile,
      role: users.role,
      isActive: users.isActive, // Ye zaroori hai
      createdAt: users.createdAt,
    })
    .from(users)
    .where(
      and(
        eq(users.agencyId, owner.agencyId),
        inArray(users.role, ["salesman", "delivery_boy"]) 
        // ❌ Yahan 'isActive: true' mat lagana, warna inactive log gayab ho jayenge
      )
    )
    .orderBy(desc(users.createdAt));

  const formattedStaff: Staff[] = rawStaff.map((s) => ({
    ...s,
    createdAt: new Date(s.createdAt).toISOString(),
    role: s.role as StaffRole,
  }));

  return (
    <div className="min-h-screen bg-emerald-50/60 font-sans pb-24">
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center h-[60vh] text-emerald-600">
            <Users className="animate-bounce mb-2" size={40} />
            <p className="font-bold">Loading your team...</p>
          </div>
        }
      >
        <StaffList initialStaff={formattedStaff} />
      </Suspense>
    </div>
  );
}