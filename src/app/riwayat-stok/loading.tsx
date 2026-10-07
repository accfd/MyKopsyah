import AdminShell from "@/components/AdminShell";

export default function RiwayatStokLoading() {
  return (
    <AdminShell>
      <div className="space-y-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-slate-200 rounded-xl" />
            <div className="h-4 w-96 max-w-full bg-slate-100 rounded-lg" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-10 w-36 bg-slate-200 rounded-xl" />
            <div className="h-10 w-40 bg-emerald-100 rounded-xl" />
          </div>
        </div>

        {/* Search Bar Skeleton */}
        <div className="h-12 w-full max-w-md bg-slate-200 rounded-xl" />

        {/* Cards Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="h-6 w-32 bg-sky-100 rounded-lg" />
                <div className="h-6 w-24 bg-emerald-100 rounded-lg" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-3/4 bg-slate-200 rounded-md" />
                <div className="h-4 w-1/2 bg-slate-100 rounded-md" />
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div className="h-4 w-28 bg-slate-100 rounded-md" />
                <div className="h-8 w-36 bg-slate-200 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
