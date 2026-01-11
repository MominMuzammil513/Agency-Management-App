// app/profile/edit/page.tsx - Edit Profile Page
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { db } from "@/db/db";
import { users } from "@/db/schemas";
import { eq } from "drizzle-orm";
import EditProfileClient from "./components/EditProfileClient";
import { unstable_noStore as noStore } from "next/cache";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function EditProfilePage() {
  noStore();
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  // Fetch user data
  const [userData] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      mobile: users.mobile,
      altMobile: users.altMobile,
    })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!userData) {
    redirect("/login");
  }

  return <EditProfileClient user={userData} />;
}
