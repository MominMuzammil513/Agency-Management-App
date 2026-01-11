// components/ui/ListContainer.tsx - Reusable list container with proper spacing
import { cn } from "@/lib/utils";

interface ListContainerProps {
  children: React.ReactNode;
  className?: string;
  gap?: "sm" | "md" | "lg";
}

export function ListContainer({
  children,
  className,
  gap = "md",
}: ListContainerProps) {
  const gapClass = {
    sm: "gap-2",
    md: "gap-3",
    lg: "gap-4",
  }[gap];

  return (
    <div className={cn("space-y-0", gapClass, className)}>
      {children}
    </div>
  );
}
