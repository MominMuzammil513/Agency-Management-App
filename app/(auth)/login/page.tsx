// app/login/page.tsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import LoginForm from "@/components/auth/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const params = await searchParams;
  const callbackUrl = params?.callbackUrl;
  
  // Check if user is already logged in
  const session = await getServerSession(authOptions);
  
  // Only redirect if there's NO callbackUrl (user directly accessed login page)
  // If there's a callbackUrl, let the login form handle redirect after login
  // This prevents redirect loops
  if (session?.user && !callbackUrl) {
    // Redirect based on role
    const role = session.user.role;
    const roleRedirects: Record<string, string> = {
      owner_admin: "/admin",
      salesman: "/sales",
      delivery_boy: "/delivery",
      super_admin: "/superadmin",
    };
    
    const redirectPath = roleRedirects[role];
    if (redirectPath) {
      redirect(redirectPath);
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black text-white">
          EURO<span className="text-orange-500">APP</span>
        </h1>
        <p className="text-slate-400 mt-2">Distribution Management System</p>
      </div>

      <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 w-full max-w-sm">
        <h2 className="text-white text-xl font-bold mb-6 text-center">Login</h2>
        <LoginForm />
      </div>
    </div>
  );
}
