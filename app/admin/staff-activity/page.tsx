import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { db } from "@/db/db";
import { users } from "@/db/schemas";
import { eq, and, inArray } from "drizzle-orm";
import { unstable_noStore as noStore } from "next/cache";
import StaffActivityClient from "./components/StaffActivityClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function StaffActivityPage() {
  noStore();
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "owner_admin") {
    redirect("/login");
  }

  // Get owner's agency
  const [ownerData] = await db
    .select({ agencyId: users.agencyId })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!ownerData?.agencyId) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 font-bold">
        Error: Agency not found for this user.
      </div>
    );
  }

  // Fetch all active staff (salesman and delivery_boy)
  const allStaff = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      mobile: users.mobile,
      role: users.role,
      isActive: users.isActive,
    })
    .from(users)
    .where(
      and(
        eq(users.agencyId, ownerData.agencyId),
        inArray(users.role, ["salesman", "delivery_boy"]),
        eq(users.isActive, true)
      )
    );

  const salesmen = allStaff.filter((s) => s.role === "salesman");
  const deliveryBoys = allStaff.filter((s) => s.role === "delivery_boy");

  return (
    <StaffActivityClient
      salesmen={salesmen}
      deliveryBoys={deliveryBoys}
      agencyId={ownerData.agencyId}
    />
  );
}
