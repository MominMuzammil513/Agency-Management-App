import { authOptions } from "@/lib/authOptions";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { db } from "@/db/db";
import { eq } from "drizzle-orm";
import { areas } from "@/db/schemas";
import SalesDashboard from "./components/SalesDashboard";

export default async function SalesPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== "salesman") {
    return redirect("/login");
  }

  // Only show areas that match the user's agency
  const whereClause = eq(areas.agencyId, session.user.agencyId ?? "");

  const areaList = await db
    .select({ id: areas.id, name: areas.name })
    .from(areas)
    .where(whereClause);

  return (
    <SalesDashboard user={session.user} areaList={areaList} />
  );
}