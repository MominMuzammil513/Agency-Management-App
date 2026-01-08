"use client"
// --- BUTTON ---
interface ButtonProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: "primary" | "secondary" | "danger" | "success" | "dark" | "ghost";
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  size?: "xs" | "sm" | "md" | "lg";
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = "primary",
  className = "",
  disabled = false,
  type = "button",
  size = "md",
}) => {
  const sizes = {
    xs: "px-3 py-1.5 text-xs",
    sm: "px-4 py-2 text-sm",
    md: "px-5 py-3 text-base",
    lg: "px-6 py-4 text-lg",
  };

  const variants = {
    primary:
      "bg-orange-600 text-white shadow-lg shadow-orange-200 hover:bg-orange-700",
    secondary:
      "bg-white text-slate-800 border border-slate-200 shadow-sm hover:bg-slate-50",
    danger: "bg-red-50 text-red-600 border border-red-100",
    success: "bg-emerald-600 text-white shadow-lg shadow-emerald-200",
    dark: "bg-slate-900 text-white",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};
