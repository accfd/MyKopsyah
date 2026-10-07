"use client";

import { useTransition } from "react";
import { logoutAction } from "@/app/actions";
import { LogOut, Link2, ExternalLink } from "lucide-react";
import CopyStockLinkBtn from "@/components/CopyStockLinkBtn";

export default function PengaturanClient() {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    if (confirm("Apakah Anda yakin ingin keluar dari sesi admin?")) {
      startTransition(() => logoutAction());
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Pengaturan</h2>
      </div>

      {/* ── Bagikan Link Stok ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
            <Link2 className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Bagikan Link Cek Stok ke Pelanggan</h3>
            <p className="text-xs text-slate-500">
              Salin tautan ini, lalu tempelkan ke chat WhatsApp pelanggan — mereka bisa langsung cek stok sendiri tanpa tanya-tanya lagi
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <CopyStockLinkBtn />
          <a
            href="/stok"
            target="_blank"
            className="inline-flex items-center gap-1.5 text-sm text-emerald-700 font-semibold hover:text-emerald-900 underline underline-offset-2"
          >
            <ExternalLink className="w-4 h-4" />
            Lihat tampilan halaman stok pelanggan
          </a>
        </div>
      </div>

      {/* ── Keluar ── */}
      <div className="bg-white rounded-2xl border border-rose-100 shadow-sm p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
              <LogOut className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Keluar dari Sistem</h3>
              <p className="text-xs text-slate-500">
                Setelah keluar, Anda harus masukkan PIN lagi untuk bisa menggunakan sistem
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            disabled={isPending}
            className="shrink-0 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition-all disabled:opacity-60"
          >
            {isPending ? "Keluar..." : "Keluar"}
          </button>
        </div>
      </div>
    </div>
  );
}
