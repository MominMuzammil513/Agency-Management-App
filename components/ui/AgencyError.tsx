"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";

interface AgencyErrorProps {
  message?: string;
}

export default function AgencyError({ message = "Error: Agency not found for this user." }: AgencyErrorProps) {
  const router = useRouter();

  const handleLoginAgain = async () => {
    await signOut({ redirect: false });
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl p-8 shadow-lg border border-red-100 max-w-md w-full text-center">
        <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">⚠️</span>
        </div>
        <h1 className="text-xl font-black text-red-600 mb-2">
          {message}
        </h1>
        <p className="text-slate-500 mb-6 text-sm">
          Please log in again to refresh your session.
        </p>
        <button
          onClick={handleLoginAgain}
          className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl font-bold transition-colors active:scale-95"
        >
          <LogIn size={18} />
          Login Again
        </button>
      </div>
    </div>
  );
}
