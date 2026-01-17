import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { db } from "@/db/db";
import { users } from "@/db/schemas";
import { eq, and, inArray } from "drizzle-orm";
import { unstable_noStore as noStore } from "next/cache";
import StaffActivityClient from "./components/StaffActivityClient";
import AgencyError from "@/components/ui/AgencyError";

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
    return <AgencyError />;
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

  // Also include owner_admin's own activities (when they act as salesman/delivery_boy)
  // We'll add owner_admin as a virtual staff member for their own activities
  // Fetch owner admin details from database
  const [ownerAdminData] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      mobile: users.mobile,
      role: users.role,
      isActive: users.isActive,
    })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  const ownerAdminStaff: {
    id: string;
    name: string;
    email: string;
    mobile: string;
    role: "super_admin" | "owner_admin" | "salesman" | "delivery_boy";
    isActive: boolean;
  } = {
    id: ownerAdminData?.id || session.user.id,
    name: ownerAdminData?.name || session.user.name || "You",
    email: ownerAdminData?.email || session.user.email || "",
    mobile: ownerAdminData?.mobile || "",
    role: "owner_admin", // Special role to identify owner admin
    isActive: ownerAdminData?.isActive ?? true,
  };

  const salesmen = allStaff.filter((s) => s.role === "salesman");
  const deliveryBoys = allStaff.filter((s) => s.role === "delivery_boy");
  
  // Add owner_admin to both lists for their activities
  salesmen.push(ownerAdminStaff);
  deliveryBoys.push(ownerAdminStaff);

  return (
    <StaffActivityClient
      salesmen={salesmen}
      deliveryBoys={deliveryBoys}
      agencyId={ownerData.agencyId}
      ownerAdminId={session.user.id}
    />
  );
}
