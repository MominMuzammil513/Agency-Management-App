// components/ui/Skeleton.tsx - Loading skeleton components
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-slate-200 dark:bg-slate-800",
        className
      )}
      {...props}
    />
  );
}

// Card Skeleton
export function CardSkeleton() {
  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
      <Skeleton className="h-6 w-3/4 mb-3" />
      <Skeleton className="h-4 w-1/2 mb-4" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

// List Item Skeleton
export function ListItemSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-50 flex items-center gap-4">
      <Skeleton className="h-12 w-12 rounded-xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-8 w-20 rounded-full" />
    </div>
  );
}

// Product Grid Skeleton
export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl shadow-sm border-2 border-transparent overflow-hidden"
        >
          <Skeleton className="h-48 w-full" />
          <div className="p-3 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-6 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Stats Card Skeleton
export function StatsCardSkeleton() {
  return (
    <div className="bg-white rounded-4xl p-5 border border-slate-100 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-8 w-32 mb-2" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

// Table Skeleton
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <ListItemSkeleton key={i} />
      ))}
    </div>
  );
}
