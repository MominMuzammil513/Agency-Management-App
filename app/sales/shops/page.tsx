import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { db } from "@/db/db";
import { eq } from "drizzle-orm";
import { shops, areas } from "@/db/schemas";
import ShopsDashboard from "./components/ShopsDashboard";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function ShopsPage(props: { searchParams: SearchParams }) {
  const session = await getServerSession(authOptions);

  // Security Check
  if (!session || !session.user || session.user.role !== "salesman") {
    return redirect("/login");
  }

  const searchParams = await props.searchParams;
  let areaId = searchParams.areaId;

  if (Array.isArray(areaId)) areaId = areaId[0];

  if (!areaId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-50 text-emerald-800 font-bold">
        Invalid Area Selection 🚫
      </div>
    );
  }

  // 1. Fetch Area Name (Header ke liye)
  const areaData = await db
    .select({ name: areas.name })
    .from(areas)
    .where(eq(areas.id, areaId))
    .limit(1);

  const areaName = areaData[0]?.name || "Unknown Area";

  // 2. Fetch Initial Shops (Server Side Rendering ke liye)
  const shopList = await db
    .select({
      id: shops.id,
      name: shops.name,
      ownerName: shops.ownerName,
      mobile: shops.mobile,
    })
    .from(shops)
    .where(eq(shops.areaId, areaId));

  // 3. Render Dashboard
  return (
    <ShopsDashboard
      areaId={areaId}
      areaName={areaName}
      initialShops={shopList}
    />
  );
}
