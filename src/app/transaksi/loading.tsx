import AdminShell from "@/components/AdminShell";
import { Skeleton } from "@/components/Skeleton";

export default function TransaksiLoading() {
  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Title & Action Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <Skeleton className="h-8 w-60 rounded-xl" />
            <Skeleton className="h-4 w-72 rounded-lg" />
          </div>
          <Skeleton className="h-11 w-44 rounded-xl" />
        </div>

        {/* 4 Filter Tabs (1 Row) & Search Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3.5 shadow-xs">
          {/* 1 Row Filter Tabs */}
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>

          {/* Search Box */}
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>

        {/* Cards Skeleton */}
        <div className="space-y-3.5">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-32 rounded-lg" />
                  <Skeleton className="h-4 w-28 rounded-md" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-7 w-24 rounded-full" />
                  <Skeleton className="h-7 w-24 rounded-full" />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100">
                <div className="space-y-1.5">
                  <Skeleton className="h-5 w-48 rounded-md" />
                  <Skeleton className="h-4 w-64 rounded-md" />
                </div>
                <Skeleton className="h-7 w-32 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
