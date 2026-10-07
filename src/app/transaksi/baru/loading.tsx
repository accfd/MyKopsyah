import AdminShell from "@/components/AdminShell";
import { Skeleton } from "@/components/Skeleton";

export default function KasirLoading() {
  return (
    <AdminShell>
      <div className="space-y-6 sm:space-y-8 pb-36">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <Skeleton className="h-8 w-44" />
        </div>

        {/* Section 1: Customer Form */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 space-y-4">
          <Skeleton className="h-6 w-56" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <Skeleton className="h-4 w-44" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          </div>
        </div>

        {/* Section 2: Product & Cart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 space-y-4">
          <Skeleton className="h-6 w-48" />
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
              <div className="lg:col-span-5 space-y-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-11 w-full rounded-xl" />
              </div>
              <div className="lg:col-span-4 space-y-1">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-11 w-full rounded-xl" />
              </div>
              <div className="lg:col-span-3 space-y-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-11 w-full rounded-xl" />
              </div>
            </div>
          </div>
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>

        {/* Section 3: Status */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 space-y-4">
          <Skeleton className="h-6 w-52" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Skeleton className="h-14 w-full rounded-xl" />
            <Skeleton className="h-14 w-full rounded-xl" />
          </div>
        </div>

        {/* Sticky Bottom Bar Checkout Skeleton */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 border-t-2 border-emerald-600 shadow-2xl p-3 sm:px-6 sm:py-3.5 no-print">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-4">
              <Skeleton className="h-8 w-44 rounded-lg" />
              <Skeleton className="h-6 w-28 rounded-lg" />
            </div>
            <Skeleton className="h-12 w-full sm:w-56 rounded-xl" />
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
