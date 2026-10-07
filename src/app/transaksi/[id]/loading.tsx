import AdminShell from "@/components/AdminShell";
import { Skeleton } from "@/components/Skeleton";

export default function DetailTransaksiLoading() {
  return (
    <AdminShell>
      <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto pb-16">
        {/* Top Action Bar (1 Row on Mobile & PC) */}
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-9 w-32 rounded-xl" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9 sm:w-24 rounded-xl" />
            <Skeleton className="h-9 w-9 sm:w-28 rounded-xl" />
            <Skeleton className="h-9 w-9 sm:w-20 rounded-xl" />
          </div>
        </div>

        {/* Printable Receipt Paper Container */}
        <div className="bg-white rounded-2xl border border-slate-300 p-4 sm:p-10 shadow-lg space-y-6">
          {/* Header Kop Surat Skeleton */}
          <div className="border-b-4 border-black/20 pb-3 flex items-center justify-between gap-3">
            <Skeleton className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2 flex flex-col items-center">
              <Skeleton className="h-4 w-3/4 rounded-md" />
              <Skeleton className="h-5 w-2/3 rounded-md" />
              <Skeleton className="h-3 w-1/2 rounded-md" />
            </div>
            <div className="w-12 h-12 sm:w-16 sm:h-16 shrink-0 hidden sm:block" />
          </div>

          {/* Centered Title & Invoice No */}
          <div className="flex flex-col items-center space-y-1.5 py-2">
            <Skeleton className="h-6 w-44 rounded-md" />
            <Skeleton className="h-4 w-32 rounded-md" />
          </div>

          {/* 2-Column Metadata */}
          <div className="grid grid-cols-2 gap-4 py-2 border-b border-black/10 pb-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-36 rounded-md" />
              <Skeleton className="h-4 w-28 rounded-md" />
              <Skeleton className="h-4 w-28 rounded-md" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-40 rounded-md" />
              <Skeleton className="h-4 w-32 rounded-md" />
              <Skeleton className="h-4 w-36 rounded-md" />
            </div>
          </div>

          {/* Table Items */}
          <div className="space-y-2 pt-2">
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-12 w-full rounded-md" />
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-8 text-center">
            <div className="flex flex-col items-center space-y-12">
              <Skeleton className="h-4 w-32 rounded-md" />
              <Skeleton className="h-4 w-40 rounded-md" />
            </div>
            <div className="flex flex-col items-center space-y-12">
              <Skeleton className="h-4 w-32 rounded-md" />
              <Skeleton className="h-4 w-40 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
