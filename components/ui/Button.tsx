// src/components/ui/Button.tsx
import { cn } from "@/lib/utils"; // cn helper for classNames (optional, ya direct use karo)
import { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
  fullWidth?: boolean;
};

export default function Button({
  children,
  variant = "primary",
  fullWidth = true,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const base =
    "font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900";

  const variants = {
    primary:
      "bg-orange-600 text-white focus:ring-orange-500 disabled:opacity-60",
    secondary:
      "bg-slate-700 text-white focus:ring-slate-500 disabled:opacity-60",
  };

  return (
    <button
      className={cn(base, variants[variant], fullWidth && "w-full", className)}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
