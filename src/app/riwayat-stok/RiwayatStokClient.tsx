"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StockBatchData } from "@/lib/data-service";
import { formatTanggal } from "@/lib/format";
import {
  History,
  PackagePlus,
  Package,
  Search,
  FileText,
  Calendar,
  Truck,
  ArrowRight,
  Boxes,
} from "lucide-react";

export default function RiwayatStokClient({
  batches,
}: {
  batches: StockBatchData[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filteredBatches = batches.filter((b) => {
    const q = search.toLowerCase();
    const matchId = b.batchId.toLowerCase().includes(q);
    const matchNotes = b.supplierOrNotes.toLowerCase().includes(q);
    const matchItems = b.entries.some(
      (e) =>
        e.productName.toLowerCase().includes(q) ||
        e.variantName.toLowerCase().includes(q)
    );
    return matchId || matchNotes || matchItems;
  });

  const totalUnits = batches.reduce((acc, b) => acc + b.totalQuantity, 0);

  return (
    <div className="space-y-6 pb-16">
      {/* ─── HEADER UTAMA DENGAN TOMBOL AKSI ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-7 h-7 text-emerald-600 shrink-0" />
            <span>Riwayat Stok Masuk</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Arsip dokumen berita acara penerimaan barang & penambahan stok fisik gudang Kopsyah.
          </p>
        </div>

        {/* Action Button: Catat Stok Masuk */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/riwayat-stok/masuk"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-700/20 transition-all active:scale-98"
          >
            <PackagePlus className="w-4 h-4" />
            <span>Catat Stok Masuk</span>
          </Link>
        </div>
      </div>

      {/* ─── SEARCH & STATS BAR ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari no. dokumen BM, sumber/supplier, nama barang..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 shadow-xs"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-600 font-medium">
          <span className="px-3 py-1.5 bg-slate-100 rounded-xl border border-slate-200/80 font-bold text-slate-800">
            {batches.length} Dokumen Masuk
          </span>
          <span className="px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 font-bold">
            +{totalUnits} Total Unit Masuk
          </span>
        </div>
      </div>

      {/* ─── DAFTAR CARD RIWAYAT STOK MASUK ─── */}
      {filteredBatches.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300 text-slate-500 space-y-2">
          <Boxes className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="font-bold text-slate-700 text-sm">Tidak ada riwayat stok ditemukan</p>
          <p className="text-xs text-slate-500">
            {search ? `Tidak ada dokumen yang cocok dengan kata kunci "${search}"` : "Belum ada dokumen penerimaan barang."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredBatches.map((batch) => {
            const previewItems = batch.entries.slice(0, 3);
            const remainingCount = batch.entries.length - previewItems.length;

            return (
              <div
                key={batch.batchId}
                onClick={() => router.push(`/riwayat-stok/${batch.batchId}`)}
                className="group bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-500/60 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4"
              >
                {/* Header Card: No. Dokumen, Tanggal & Total Unit */}
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono font-bold text-xs sm:text-sm px-2.5 py-1 bg-sky-50 text-sky-800 border border-sky-200 rounded-lg">
                      {batch.batchId}
                    </span>

                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-black">
                      +{batch.totalQuantity} unit
                    </span>
                  </div>

                  {/* Tanggal & Waktu */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{formatTanggal(batch.createdAt)}</span>
                  </div>

                  {/* Sumber / Supplier / Catatan */}
                  <div className="flex items-start gap-2 mt-3 pt-3 border-t border-slate-100">
                    <Truck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block">
                        Sumber / Pengirim
                      </span>
                      <p className="font-extrabold text-sm text-slate-900 truncate">
                        {batch.supplierOrNotes}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Rincian Barang yang Masuk (Cuplikan 3 Barang Teratas) */}
                <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-600 text-[11px]">
                    <span>Rincian Barang</span>
                    <span>{batch.totalVariants} varian</span>
                  </div>

                  <div className="space-y-1">
                    {previewItems.map((entry, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-slate-700 font-medium"
                      >
                        <span className="truncate pr-2 text-slate-800">
                          {entry.productName} ({entry.variantName})
                        </span>
                        <span className="font-bold text-emerald-700 shrink-0">
                          +{entry.quantityAdded}
                        </span>
                      </div>
                    ))}
                  </div>

                  {remainingCount > 0 && (
                    <p className="text-[11px] text-slate-500 font-medium pt-1 italic">
                      + dan {remainingCount} varian barang lainnya...
                    </p>
                  )}
                </div>

                {/* Footer Card: Tombol Lihat Bukti */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">
                    Berita Acara Logistik
                  </span>

                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 group-hover:text-emerald-800 group-hover:translate-x-0.5 transition-all">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Lihat Bukti Berita Acara</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
