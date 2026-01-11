// app/admin/stock/loading.tsx
import { Skeleton } from "@/components/ui/Skeleton";

export default function StockLoading() {
  return (
    <div className="min-h-screen bg-emerald-50/60 pb-24 font-sans">
      {/* Header Skeleton */}
      <div className="bg-white/80 backdrop-blur-md sticky top-0 z-30 px-6 py-5 border-b border-emerald-100 rounded-b-[2.5rem] shadow-sm mb-6">
        <Skeleton className="h-6 w-48" />
      </div>

      <div className="px-6 space-y-6">
        {/* Search and Filter Skeleton */}
        <div className="flex gap-3">
          <Skeleton className="h-12 flex-1 rounded-2xl" />
          <Skeleton className="h-12 w-32 rounded-2xl" />
        </div>

        {/* Stock Table Skeleton */}
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 border-b border-slate-100">
                <div className="flex items-center gap-4 flex-1">
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Skeleton className="h-8 w-20" />
                  <div className="flex gap-2">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <Skeleton className="h-10 w-10 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
