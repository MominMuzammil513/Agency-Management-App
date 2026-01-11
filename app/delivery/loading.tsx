// app/delivery/loading.tsx
import { ProductGridSkeleton, TableSkeleton } from "@/components/ui/Skeleton";

export default function DeliveryLoading() {
  return (
    <div className="min-h-screen bg-orange-50/60 pb-32 font-sans relative">
      {/* Header Skeleton */}
      <div className="bg-white/90 backdrop-blur-md pt-5 pb-3 sticky top-0 z-30 border-b border-orange-100/50 rounded-b-4xl shadow-sm mb-6">
        <div className="px-5 space-y-3">
          <div className="h-6 w-48 bg-slate-200 rounded animate-pulse" />
          <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
        </div>
      </div>

      <div className="px-5 space-y-6">
        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-3xl p-5 shadow-sm border border-orange-50"
            >
              <div className="h-4 w-24 bg-slate-200 rounded mb-3 animate-pulse" />
              <div className="h-8 w-32 bg-slate-200 rounded mb-2 animate-pulse" />
              <div className="h-3 w-20 bg-slate-200 rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Orders List Skeleton */}
        <TableSkeleton rows={6} />
      </div>
    </div>
  );
}
