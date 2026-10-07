import AdminShell from "@/components/AdminShell";
import { Skeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Title skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
        </div>

        {/* Content grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>

        {/* Big card skeleton */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </AdminShell>
  );
}
