// app/admin/more/products/loading.tsx
import { Skeleton } from "@/components/ui/Skeleton";

export default function ProductsLoading() {
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
        {/* Search and Filter Skeleton */}
        <div className="mb-6 space-y-3">
          <Skeleton className="h-12 w-full rounded-2xl" />
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-8 w-24 rounded-full" />
            ))}
          </div>
        </div>

        {/* Product Grid Skeleton */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm">
              <Skeleton className="h-32 w-full rounded-xl mb-3" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2 mb-2" />
              <Skeleton className="h-5 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
