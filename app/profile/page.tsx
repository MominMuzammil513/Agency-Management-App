// app/profile/page.tsx - User Profile Page
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { db } from "@/db/db";
import { users } from "@/db/schemas";
import { eq } from "drizzle-orm";
import ProfileClient from "./components/ProfileClient";
import { unstable_noStore as noStore } from "next/cache";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ProfilePage() {
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
      role: users.role,
      isActive: users.isActive,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!userData) {
    redirect("/login");
  }

  return <ProfileClient user={userData} />;
}
