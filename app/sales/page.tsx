import { authOptions } from "@/lib/authOptions";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { db } from "@/db/db";
import { eq } from "drizzle-orm";
import { areas, users } from "@/db/schemas";
import SalesDashboard from "./components/SalesDashboard";

export default async function SalesPage() {
  const session = await getServerSession(authOptions);

  // Allow owner_admin to access sales page (role switching feature)
  if (!session || !session.user || (session.user.role !== "salesman" && session.user.role !== "owner_admin")) {
    return redirect("/login");
  }

  // For owner_admin, get agency from their user record
  // For salesman, use session agencyId
  let agencyId = session.user.agencyId;
  
  if (session.user.role === "owner_admin") {
    const [ownerData] = await db
      .select({ agencyId: users.agencyId })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);
    agencyId = ownerData?.agencyId || "";
  }

  const whereClause = eq(areas.agencyId, agencyId ?? "");

  const areaList = await db
    .select({ id: areas.id, name: areas.name })
    .from(areas)
    .where(whereClause);

  return (
    <SalesDashboard user={session.user} areaList={areaList} />
  );
}