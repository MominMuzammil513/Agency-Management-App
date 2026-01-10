"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="h-10 w-10 bg-white rounded-full flex items-center justify-center text-slate-400 border border-emerald-100 shadow-sm hover:text-emerald-600 hover:border-emerald-200 hover:shadow-md hover:-translate-x-1 transition-all active:scale-95"
      title="Go Back"
    >
      <ArrowLeft size={20} />
    </button>
  );
}
