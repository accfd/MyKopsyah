import { Skeleton } from "@/components/Skeleton";

export default function DetailPelangganLoading() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Navigasi skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28 rounded-xl" />
          <Skeleton className="h-9 w-36 rounded-xl" />
        </div>
      </div>

      {/* Profil card skeleton */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex items-start gap-4">
        <Skeleton className="w-16 h-16 rounded-2xl shrink-0" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-6 w-60" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-72" />
        </div>
      </div>

      {/* Stats KPI skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
            <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-6 w-28" />
            </div>
          </div>
        ))}
      </div>

      {/* History table skeleton */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-52" />
          <Skeleton className="h-9 w-60 rounded-xl" />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="py-4 border-t border-slate-100 flex justify-between items-center">
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-64" />
            </div>
            <Skeleton className="h-8 w-24 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
