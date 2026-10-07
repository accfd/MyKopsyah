import { Skeleton } from "@/components/Skeleton";

export default function PublicStokLoading() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-28">
      {/* ─── TOP HEADER SKELETON (EMERALD THEME, PERSIS HEADER ASLI TANPA SIDEBAR) ─── */}
      <header className="sticky top-0 z-30 bg-emerald-800 text-white shadow-md">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 p-1 flex items-center justify-center shrink-0">
              <Skeleton className="w-full h-full rounded-lg bg-emerald-700/50" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-40 bg-emerald-700/70" />
              <Skeleton className="h-3 w-56 bg-emerald-700/40" />
            </div>
          </div>
        </div>
      </header>

      {/* ─── BANNER EDARAN HARGA SKELETON ─── */}
      <div className="bg-emerald-50/70 border-b border-emerald-200/60">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2.5">
            <Skeleton className="w-7 h-7 rounded-lg shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-64 max-w-full" />
              <Skeleton className="h-3 w-80 max-w-full" />
            </div>
          </div>
        </div>
      </div>

      {/* ─── MAIN CONTENT AREA SKELETON ─── */}
      <main className="max-w-4xl mx-auto px-4 pt-4 space-y-4">
        {/* Kolom Pencarian Cepat Skeleton */}
        <div className="relative">
          <Skeleton className="h-11 w-full rounded-2xl" />
        </div>

        {/* Tab Filter Kategori (Semua, Seragam, Buku, Aksesoris) Skeleton */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <Skeleton className="h-9 w-20 rounded-xl shrink-0" />
          <Skeleton className="h-9 w-24 rounded-xl shrink-0" />
          <Skeleton className="h-9 w-20 rounded-xl shrink-0" />
          <Skeleton className="h-9 w-24 rounded-xl shrink-0" />
        </div>

        {/* Daftar Kartu Produk & Varian Stok Skeleton */}
        <div className="space-y-3.5 pt-1">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3.5"
            >
              {/* Header Kartu: Kategori & Nama Produk */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-20 rounded-md" />
                  <Skeleton className="h-5 w-56 max-w-full" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full shrink-0" />
              </div>

              {/* Baris Daftar Varian & Status Stok Skeleton */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                {[1, 2, 3].map((v) => (
                  <div
                    key={v}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80"
                  >
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-3.5 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-7 w-24 rounded-xl shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* ─── FLOATING BOTTOM BAR SKELETON ─── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 sm:p-4 shadow-2xl">
        <div className="max-w-md mx-auto">
          <Skeleton className="h-12 w-full rounded-2xl bg-emerald-600/30" />
        </div>
      </div>
    </div>
  );
}
