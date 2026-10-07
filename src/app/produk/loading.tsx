import AdminShell from "@/components/AdminShell";
import { Skeleton } from "@/components/Skeleton";

export default function ProdukLoading() {
  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Header with Title & Action Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <Skeleton className="h-8 w-64 rounded-xl" />
            <Skeleton className="h-4 w-80 rounded-lg" />
          </div>
          <div className="flex items-center gap-2.5">
            <Skeleton className="h-11 w-44 rounded-xl" />
          </div>
        </div>

        {/* 3 Metric Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="col-span-2 sm:col-span-1 h-20 w-full rounded-2xl" />
        </div>

        {/* Search & Category Pills */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <Skeleton className="h-6 w-48 rounded-lg" />
            <Skeleton className="h-10 w-full sm:w-72 rounded-xl" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-20 rounded-xl" />
            <Skeleton className="h-9 w-24 rounded-xl" />
            <Skeleton className="h-9 w-20 rounded-xl" />
            <Skeleton className="h-9 w-24 rounded-xl" />
          </div>
        </div>

        {/* Product Cards */}
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs"
            >
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-16 rounded-md" />
                  <Skeleton className="h-6 w-44 rounded-md" />
                </div>
                <Skeleton className="h-8 w-36 rounded-lg" />
              </div>
              <div className="p-4 space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-28 rounded-md" />
                  <Skeleton className="h-4 w-20 rounded-md" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-32 rounded-md" />
                  <Skeleton className="h-4 w-20 rounded-md" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
