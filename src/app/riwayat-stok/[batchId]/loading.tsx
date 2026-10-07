import AdminShell from "@/components/AdminShell";

export default function DetailRiwayatStokLoading() {
  return (
    <AdminShell>
      <div className="space-y-6 max-w-4xl mx-auto animate-pulse">
        {/* Top Bar Skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-8 w-44 bg-slate-200 rounded-xl" />
          <div className="h-10 w-40 bg-emerald-100 rounded-xl" />
        </div>

        {/* Paper Skeleton */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div className="w-16 h-16 bg-slate-200 rounded-lg" />
            <div className="space-y-2 text-center flex-1">
              <div className="h-5 w-64 bg-slate-200 rounded mx-auto" />
              <div className="h-4 w-48 bg-slate-100 rounded mx-auto" />
            </div>
            <div className="w-16 h-16 bg-transparent" />
          </div>

          <div className="space-y-2">
            <div className="h-4 w-full bg-slate-100 rounded" />
            <div className="h-4 w-5/6 bg-slate-100 rounded" />
          </div>

          <div className="h-40 bg-slate-50 border border-slate-200 rounded-xl" />
        </div>
      </div>
    </AdminShell>
  );
}
