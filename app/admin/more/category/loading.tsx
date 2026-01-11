// app/admin/more/category/loading.tsx
import { Skeleton } from "@/components/ui/Skeleton";

export default function CategoryLoading() {
  return (
    <div className="min-h-screen bg-emerald-50/60 pb-24 font-sans">
      {/* Header Skeleton */}
      <div className="bg-white/80 backdrop-blur-md sticky top-0 z-30 px-6 py-5 border-b border-emerald-100 rounded-b-[2.5rem] shadow-sm mb-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-10 w-32 rounded-2xl" />
        </div>
      </div>

      <div className="p-5">
        {/* Search Skeleton */}
        <Skeleton className="h-12 w-full rounded-2xl mb-6" />

        {/* Category List Skeleton */}
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <Skeleton className="h-10 w-10 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
