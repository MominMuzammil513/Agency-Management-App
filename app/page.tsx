import { authOptions } from "@/lib/authOptions";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import HomeRedirectClient from "./components/HomeRedirectClient";

export default async function Home() {
  const session = await getServerSession(authOptions);

  // If no session, redirect immediately
  if (!session || !session.user) {
    redirect("/login");
  }

  const role = session.user.role;
  const userName = session.user.name || "User";

  // Map roles to paths
  const roleRedirects: Record<string, string> = {
    owner_admin: "/admin",
    salesman: "/sales",
    delivery_boy: "/delivery",
    super_admin: "/superadmin",
  };

  // Get redirect path
  const redirectPath = roleRedirects[role];

  // If role is invalid, show error
  if (!redirectPath) {
    throw new Error(`Invalid user role: ${role}`);
  }

  // Show professional loading/redirecting UI
  return <HomeRedirectClient redirectPath={redirectPath} userName={userName} role={role} />;
}
