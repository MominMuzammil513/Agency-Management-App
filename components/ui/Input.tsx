// src/components/ui/Input.tsx
import { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export default function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white",
        "placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500",
        "disabled:opacity-60",
        className
      )}
      {...props}
    />
  );
}
