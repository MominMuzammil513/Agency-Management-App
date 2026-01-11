// app/unauthorized/page.tsx - Unauthorized access page
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import Link from "next/link";

export default async function UnauthorizedPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const role = session.user.role;
  const roleRoutes: Record<string, string> = {
    owner_admin: "/admin",
    salesman: "/sales",
    delivery_boy: "/delivery",
    super_admin: "/admin",
  };

  const homeRoute = roleRoutes[role] || "/login";

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl p-8 shadow-lg border border-slate-100 max-w-md w-full text-center">
        <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">🚫</span>
        </div>
        <h1 className="text-2xl font-black text-slate-800 mb-2">
          Access Denied
        </h1>
        <p className="text-slate-500 mb-6">
          You don't have permission to access this page.
        </p>
        <Link
          href={homeRoute}
          className="inline-block bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
