// app/admin/more/loading.tsx
import { Skeleton } from "@/components/ui/Skeleton";

export default function MoreLoading() {
  return (
    <div className="min-h-screen bg-emerald-50/60 pb-32 font-sans">
      {/* Header Skeleton */}
      <div className="bg-white/80 backdrop-blur-md sticky top-0 z-30 px-6 py-6 border-b border-emerald-100 rounded-b-[3rem] shadow-sm mb-8">
        <div className="flex items-center gap-4">
          <Skeleton className="h-14 w-14 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      </div>

      <div className="px-6 space-y-8">
        {/* Main Actions Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-4 w-32 mb-4" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-4xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Skeleton className="h-14 w-14 rounded-2xl" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          ))}
        </div>

        {/* Secondary Actions Skeleton */}
        <div>
          <Skeleton className="h-4 w-32 mb-4" />
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white/60 rounded-4xl p-4 flex flex-col items-center">
                <Skeleton className="h-10 w-10 rounded-full mb-2" />
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-2 w-12 mt-1 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
