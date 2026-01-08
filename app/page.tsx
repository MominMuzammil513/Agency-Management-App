import { authOptions } from "@/lib/authOptions";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getServerSession(authOptions);

  // If no session, redirect immediately
  if (!session || !session.user) {
    redirect("/login");
  }

  const role = session.user.role;

  // Map roles to paths
  const roleRedirects: Record<string, string> = {
    owner_admin: "/admin",
    salesman: "/sales",
    delivery_boy: "/delivery",
    super_admin: "/superadmin",
  };

  // If role exists in map, redirect
  if (roleRedirects[role]) {
    redirect(roleRedirects[role]);
  }

  // If role is invalid, throw
  throw new Error("Invalid user role");
}
