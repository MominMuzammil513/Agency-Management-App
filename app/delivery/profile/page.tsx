"use client";
import { signOut, useSession } from "next-auth/react";
import { LogOut, UserCircle } from "lucide-react";

export default function DeliveryProfile() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 pb-24">
      <div className="bg-white p-8 rounded-[2.5rem] w-full shadow-xl text-center">
        <div className="bg-orange-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl shadow-inner">
          🚚
        </div>
        <h2 className="text-2xl font-black text-slate-800">
          {session?.user?.name}
        </h2>
        <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mb-8">
          Delivery Partner
        </p>

        <button
          onClick={() => signOut()}
          className="w-full bg-red-50 text-red-500 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white transition-all active:scale-95"
        >
          <LogOut size={20} /> Logout
        </button>
      </div>
    </div>
  );
}
