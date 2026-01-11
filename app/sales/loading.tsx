// app/sales/loading.tsx
import { StatsCardSkeleton, CardSkeleton } from "@/components/ui/Skeleton";

export default function SalesLoading() {
  return (
    <div className="min-h-screen bg-emerald-50/60 font-sans pb-24">
      {/* Header Skeleton */}
      <div className="bg-linear-to-br from-emerald-600 to-teal-500 rounded-b-[2.5rem] shadow-lg p-6">
        <div className="flex items-center gap-5">
          <div className="h-16 w-16 bg-white/20 rounded-full animate-pulse" />
          <div className="space-y-2">
            <div className="h-3 w-32 bg-white/20 rounded animate-pulse" />
            <div className="h-6 w-48 bg-white/20 rounded animate-pulse" />
            <div className="h-4 w-24 bg-white/20 rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      <div className="px-5 mt-2 space-y-6">
        {/* Search Skeleton */}
        <div className="h-12 bg-white rounded-2xl animate-pulse" />

        {/* Title Skeleton */}
        <div className="flex justify-between items-center">
          <div className="h-5 w-32 bg-slate-200 rounded animate-pulse" />
          <div className="h-6 w-20 bg-slate-200 rounded-full animate-pulse" />
        </div>

        {/* List Skeleton */}
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white p-4 rounded-2xl shadow-sm border border-emerald-50/50 flex items-center gap-4"
            >
              <div className="h-12 w-12 bg-slate-200 rounded-full animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-5 w-3/4 bg-slate-200 rounded animate-pulse" />
                <div className="h-3 w-1/2 bg-slate-200 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
