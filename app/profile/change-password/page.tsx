// app/profile/change-password/page.tsx - Change Password Page
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import ChangePasswordClient from "./components/ChangePasswordClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ChangePasswordPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  return <ChangePasswordClient />;
}
