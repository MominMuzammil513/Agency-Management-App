// app/login/page.tsx
import LoginForm from "@/components/auth/login-form";

export default function LoginPage() {
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
