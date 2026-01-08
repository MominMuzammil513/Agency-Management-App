import { authOptions } from "@/lib/authOptions"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import MainSales from "./components/main-sales"
import { db } from "@/db/db"
import { eq } from "drizzle-orm"
import { areas } from "@/db/schemas"


const page = async() => {
  const session = await getServerSession(authOptions)
  if (!session || !session.user || session.user.role !== "salesman") {
      return redirect("/login");
    }
     const whereClause =
        session.user.role === "super_admin"
          ? undefined
          : eq(areas.agencyId, session.user.agencyId ?? "");
    
      const areaList = await db
        .select({ id: areas.id, name: areas.name })
        .from(areas)
        .where(whereClause);
console.log(session.user,"saleman",areaList);

  return (
    <>
      <MainSales user={session.user} areaList={areaList}/>
    </>
  );
}

export default page