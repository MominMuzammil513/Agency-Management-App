// app/admin/loading.tsx - Server component loading skeleton
import { StatsCardSkeleton, CardSkeleton, TableSkeleton } from "@/components/ui/Skeleton";

export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-emerald-50/60 pb-24 font-sans">
      {/* Header Skeleton */}
      <div className="bg-white/80 backdrop-blur-md sticky top-0 z-30 px-6 py-6 border-b border-emerald-100 rounded-b-[3rem] shadow-sm mb-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
            <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
          </div>
          <div className="h-12 w-12 bg-slate-200 rounded-full animate-pulse" />
        </div>
      </div>

      <div className="px-6 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
        </div>

        {/* Graph Skeleton */}
        <CardSkeleton />

        {/* Live Team Skeleton */}
        <CardSkeleton />

        {/* Recent Orders Skeleton */}
        <div>
          <div className="flex justify-between items-end mb-4 px-2">
            <div className="h-6 w-32 bg-slate-200 rounded animate-pulse" />
            <div className="flex gap-1">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-6 w-16 bg-slate-200 rounded-full animate-pulse" />
              ))}
            </div>
          </div>
          <TableSkeleton rows={5} />
        </div>
      </div>
    </div>
  );
}
