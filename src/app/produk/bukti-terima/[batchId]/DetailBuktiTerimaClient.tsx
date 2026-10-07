"use client";

import Link from "next/link";
import { StockBatchData } from "@/lib/data-service";
import { formatTanggal } from "@/lib/format";
import { ArrowLeft, Printer, FileText } from "lucide-react";

export default function DetailBuktiTerimaClient({ batch }: { batch: StockBatchData }) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20">
      {/* ─── TOP BAR ACTIONS (HANYA TAMPIL DI LAYAR, SEMBUNYI SAAT CETAK) ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <Link
          href="/produk?tab=riwayat"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Riwayat Stok Masuk</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md active:scale-98 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Dokumen Resmi</span>
          </button>
        </div>
      </div>

      {/* ─── KERTAS BERITA ACARA PENERIMAAN STOK RESMI (A4 PRINT READY) ─── */}
      <div className="receipt-container bg-white p-3.5 sm:p-10 rounded-2xl border border-slate-300 print:border-0 shadow-lg print:shadow-none text-black print:p-0">
        {/* Kop Surat Kopsyah FKDT Prov. Sumbar - PERSIS LAPORAN & NOTA */}
        <div className="border-b-4 border-black pb-2 mb-2">
          <div className="flex items-center justify-between gap-2 sm:gap-3">
            <div className="w-12 h-12 sm:w-16 sm:h-16 shrink-0 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-kopsyah.png"
                alt="Logo Koperasi Indonesia"
                className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
              />
            </div>

            <div className="flex-1 text-center">
              <h2 className="text-base sm:text-lg font-black tracking-tight uppercase leading-snug">
                KOPERASI SYARIAH FKDT PROV. SUMATERA BARAT
              </h2>
              <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wide">
                UNIT PENGELOLAAN STOK & DISTRIBUSI LOGISTIK
              </h3>
              <p className="text-[10px] text-slate-700 mt-0.5 leading-tight">
                Jalan Raya Padang - Bukittinggi, Sumatera Barat • Kontak: 0852-6300-6009
              </p>
            </div>

            <div className="w-16 h-16 shrink-0 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-kopsyah.png"
                alt="Logo Koperasi"
                className="w-16 h-16 object-contain opacity-0"
              />
            </div>
          </div>
        </div>

        {/* Judul Dokumen & Nomor Bukti */}
        <div className="text-center py-2 mb-2">
          <h3 className="text-sm sm:text-base font-black uppercase tracking-wider underline">
            BERITA ACARA PENERIMAAN BARANG GUDANG
          </h3>
          <div className="text-xs font-mono font-bold text-slate-800 mt-0.5">
            No. Dokumen: {batch.batchId}
          </div>
        </div>

        {/* Metadata Penerimaan */}
        <div className="grid grid-cols-2 gap-4 text-xs py-2 border-b border-black/20 mb-4 pb-3">
          <div className="space-y-1">
            <div className="flex">
              <span className="w-32 font-bold text-slate-700 print:text-black">Tanggal Penerimaan</span>
              <span className="font-bold">: {formatTanggal(batch.createdAt)}</span>
            </div>
            <div className="flex">
              <span className="w-32 font-bold text-slate-700 print:text-black">Jenis Dokumen</span>
              <span>: Bukti Stok Masuk Logistik</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex">
              <span className="w-32 font-bold text-slate-700 print:text-black">Sumber / Pengirim</span>
              <span className="font-bold">: {batch.supplierOrNotes}</span>
            </div>
            <div className="flex">
              <span className="w-32 font-bold text-slate-700 print:text-black">Total Kuantitas</span>
              <span className="font-bold">: {batch.totalQuantity} Unit</span>
            </div>
          </div>
        </div>

        {/* Tabel Rincian Barang Masuk */}
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-xs border-collapse border border-black">
            <thead>
              <tr className="bg-slate-200 print:bg-slate-200 text-black font-extrabold uppercase border-b border-black">
                <th className="py-2 px-2 text-center border border-black w-10">NO</th>
                <th className="py-2 px-3 text-left border border-black">Nama Produk Barang</th>
                <th className="py-2 px-3 text-center border border-black w-40">Varian / Ukuran / Kelas</th>
                <th className="py-2 px-3 text-center border border-black w-32">Jumlah Masuk</th>
              </tr>
            </thead>
            <tbody>
              {batch.entries.map((item, idx) => (
                <tr key={item.id} className="border-b border-black/30">
                  <td className="py-1.5 px-2 text-center border border-black">{idx + 1}</td>
                  <td className="py-1.5 px-3 text-left border border-black font-bold">
                    {item.productName}
                  </td>
                  <td className="py-1.5 px-3 text-center border border-black">
                    {item.variantName}
                  </td>
                  <td className="py-1.5 px-3 text-center border border-black font-extrabold">
                    {item.quantityAdded >= 0 ? `+${item.quantityAdded}` : item.quantityAdded} Unit
                  </td>
                </tr>
              ))}
              <tr className="bg-slate-100 print:bg-slate-100 font-extrabold border-t-2 border-black">
                <td colSpan={3} className="py-2.5 px-3 text-right border border-black">
                  TOTAL KESELURUHAN UNIT MASUK:
                </td>
                <td className="py-2.5 px-3 text-center border border-black font-black text-sm">
                  {batch.totalQuantity} Unit
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Kolom Tanda Tangan Resmi Kiri - Kanan */}
        <div className="pt-8 grid grid-cols-2 text-center text-xs">
          <div>
            <p className="font-semibold text-slate-800 print:text-black">Petugas Penerima Gudang,</p>
            <div className="h-20" />
            <p className="font-bold underline uppercase">( ........................................ )</p>
          </div>
          <div>
            <p className="font-semibold text-slate-800 print:text-black">Mengetahui Pengurus Koperasi,</p>
            <div className="h-20" />
            <p className="font-bold underline uppercase">( ........................................ )</p>
          </div>
        </div>
      </div>
    </div>
  );
}
