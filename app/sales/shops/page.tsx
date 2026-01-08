// app/salesman/shops/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { db } from "@/db/db";
import { eq } from "drizzle-orm";
import { shops } from "@/db/schemas";
import ShopsPage from "./components/Shops";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function Page(props: { searchParams: SearchParams }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== "salesman") {
    return redirect("/login");
  }

  const searchParams = await props.searchParams;
  let areaId = searchParams.areaId;

  // Normalize to string
  if (Array.isArray(areaId)) {
    areaId = areaId[0]; // take the first value
  }

  if (!areaId) {
    return <p className="text-center py-10 text-red-500">Invalid area</p>;
  }

  const shopList = await db
    .select({
      id: shops.id,
      name: shops.name,
      ownerName: shops.ownerName,
      mobile: shops.mobile,
    })
    .from(shops)
    .where(eq(shops.areaId, areaId)); // now areaId is guaranteed string

  return <ShopsPage areaId={areaId} initialShops={shopList} />;
}
