import AdminShell from "@/components/AdminShell";
import { Skeleton } from "@/components/Skeleton";

export default function LaporanWilayahLoading() {
  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Skeleton className="h-8 w-44" />
          <div className="flex gap-2.5">
            <Skeleton className="h-10 w-36 rounded-xl" />
            <Skeleton className="h-10 w-28 rounded-xl" />
          </div>
        </div>

        {/* Filter Pills Skeleton */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-9 w-24 rounded-xl" />
            <Skeleton className="h-9 w-20 rounded-xl" />
            <Skeleton className="h-9 w-24 rounded-xl" />
            <Skeleton className="h-9 w-20 rounded-xl" />
          </div>
        </div>

        {/* Large Table Skeleton */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-100/70 border-b border-slate-200 flex justify-between">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-5 w-32" />
          </div>
          <div className="p-4 space-y-3">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex gap-4 items-center py-2 border-b border-slate-100 last:border-0">
                <Skeleton className="h-4 w-10 shrink-0" />
                <Skeleton className="h-4 w-28 shrink-0" />
                <Skeleton className="h-4 w-36 shrink-0" />
                <Skeleton className="h-4 w-32 shrink-0" />
                <div className="flex-1 flex gap-2 justify-end">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
