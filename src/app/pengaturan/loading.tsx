import AdminShell from "@/components/AdminShell";
import { Skeleton } from "@/components/Skeleton";

export default function PengaturanLoading() {
  return (
    <AdminShell>
      <div className="max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-8 w-36" />

        {/* Setting Card 1 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-3 w-72" />
            </div>
          </div>
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>

        {/* Setting Card 2 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-3 w-60" />
            </div>
          </div>
          <Skeleton className="h-10 w-36 rounded-xl" />
        </div>
      </div>
    </AdminShell>
  );
}
