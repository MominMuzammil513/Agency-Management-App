// app/admin/more/managestaff/loading.tsx
import { Skeleton } from "@/components/ui/Skeleton";

export default function ManageStaffLoading() {
  return (
    <div className="min-h-screen bg-emerald-50/60 font-sans pb-24">
      {/* Header Skeleton */}
      <div className="bg-white/80 backdrop-blur-md sticky top-0 z-30 px-6 py-5 border-b border-emerald-100 rounded-b-[2.5rem] shadow-sm mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-12 w-32 rounded-2xl" />
        </div>
      </div>

      {/* Staff Grid Skeleton */}
      <div className="px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-3xl p-5 shadow-sm border border-emerald-50">
              <div className="flex items-center gap-4 mb-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
