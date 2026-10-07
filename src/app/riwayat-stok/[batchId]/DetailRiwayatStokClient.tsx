"use client";

import Link from "next/link";
import { StockBatchData } from "@/lib/data-service";
import { formatTanggal } from "@/lib/format";
import { ArrowLeft, Printer } from "lucide-react";
import ReportHeader from "@/components/ReportHeader";
import ReportFooter from "@/components/ReportFooter";

export default function DetailRiwayatStokClient({ batch }: { batch: StockBatchData }) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20">
      {/* ─── TOP BAR ACTIONS (HANYA TAMPIL DI LAYAR, SEMBUNYI SAAT CETAK) ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <Link
          href="/riwayat-stok"
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
        {/* Kop Surat & Judul Dokumen Cetak Terpadu */}
        <ReportHeader
          title="BERITA ACARA PENERIMAAN BARANG GUDANG"
          documentNumber={`No. Dokumen: ${batch.batchId}`}
        />

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

        {/* Kolom Tanda Tangan & Keterangan Dokumen Resmi */}
        <ReportFooter
          leftTitle="Petugas Penerima Gudang,"
          leftRole="Pengelola Logistik Gudang"
          leftName="( ........................................ )"
          rightCity="Padang"
          rightRole="Pengurus KOPSYAH FKDT Prov. Sumbar"
          rightName="( ........................................ )"
        />
      </div>
    </div>
  );
}
