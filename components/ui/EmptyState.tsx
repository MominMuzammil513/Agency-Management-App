// components/ui/EmptyState.tsx - Reusable empty state component
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "text-center py-12 px-4 opacity-60 bg-white/50 rounded-3xl border border-dashed border-emerald-200",
        className
      )}
    >
      <div className="bg-white p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center mb-4 shadow-sm">
        <Icon size={40} className="text-emerald-300" />
      </div>
      <p className="text-slate-500 font-bold text-base mb-1">{title}</p>
      {description && (
        <p className="text-slate-400 text-sm font-medium mb-4">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
