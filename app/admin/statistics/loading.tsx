// app/admin/statistics/loading.tsx
import { Skeleton } from "@/components/ui/Skeleton";

export default function StatisticsLoading() {
  return (
    <div className="min-h-screen bg-emerald-50/60 pb-24 font-sans">
      {/* Header Skeleton */}
      <div className="bg-white/80 backdrop-blur-md sticky top-0 z-30 px-6 py-5 border-b border-emerald-100 rounded-b-[2.5rem] shadow-sm mb-6">
        <Skeleton className="h-8 w-64 mb-4" />
        <div className="flex gap-2 mb-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-8 w-24 rounded-full" />
          ))}
        </div>
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>

      <div className="px-6 space-y-6">
        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 gap-4">
          <Skeleton className="h-40 rounded-[2.5rem]" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-32 rounded-4xl" />
            <Skeleton className="h-32 rounded-4xl" />
          </div>
        </div>

        {/* Graph Skeleton */}
        <Skeleton className="h-64 rounded-[2.5rem]" />

        {/* Breakdown List Skeleton */}
        <div className="bg-white rounded-4xl p-5 shadow-sm">
          <Skeleton className="h-5 w-48 mb-4" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
