// app/admin/more/managestaff/earnings/loading.tsx
import { Skeleton } from "@/components/ui/Skeleton";

export default function StaffEarningsLoading() {
  return (
    <div className="min-h-screen bg-emerald-50/60 pb-24 font-sans">
      {/* Header Skeleton */}
      <div className="bg-white/80 backdrop-blur-md sticky top-0 z-30 px-6 py-5 border-b border-emerald-100 rounded-b-[2.5rem] shadow-sm mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
        <div className="flex gap-2 mb-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-full" />
          ))}
        </div>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-7 w-24 rounded-full" />
          ))}
        </div>
      </div>

      <div className="px-6 space-y-6">
        {/* Summary Cards Skeleton */}
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>

        {/* Staff List Skeleton */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-3xl p-6 shadow-sm">
              <div className="flex justify-between mb-4">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <div className="space-y-2 text-right">
                  <Skeleton className="h-6 w-24 ml-auto" />
                  <Skeleton className="h-3 w-20 ml-auto" />
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <Skeleton className="h-3 w-32 mb-3" />
                <Skeleton className="h-12 rounded-xl" />
                <Skeleton className="h-12 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
