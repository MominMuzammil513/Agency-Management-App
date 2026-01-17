import { Skeleton } from "@/components/ui/Skeleton";

export default function AreaDetailLoading() {
  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header Skeleton */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-30">
        <div className="px-5 py-4 flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="px-5 py-4 grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <Skeleton className="h-3 w-16 mb-2" />
            <Skeleton className="h-8 w-12" />
          </div>
        ))}
      </div>

      {/* Shops Section Skeleton */}
      <div className="px-5 py-4">
        <Skeleton className="h-6 w-32 mb-3" />
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <Skeleton className="h-5 w-24 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>
      </div>

      {/* Orders Section Skeleton */}
      <div className="px-5 py-4">
        <Skeleton className="h-6 w-32 mb-3" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <Skeleton className="h-5 w-24 mb-2" />
              <Skeleton className="h-4 w-32 mb-3" />
              <div className="flex gap-2">
                <Skeleton className="h-8 flex-1 rounded-xl" />
                <Skeleton className="h-8 flex-1 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
