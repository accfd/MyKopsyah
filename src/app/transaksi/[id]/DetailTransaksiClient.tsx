"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { TransactionData } from "@/lib/data-service";
import { formatRupiah, formatTanggal, generateWhatsAppReceipt } from "@/lib/format";
import {
  togglePaymentStatusAction,
  toggleShippingStatusAction,
  removeTransactionAction,
} from "@/app/actions";
import {
  Printer,
  Share2,
  Check,
  Trash2,
  ClockAlert,
  CheckCircle2,
  Truck,
  Building2,
  MapPin,
  Phone,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

export default function DetailTransaksiClient({ tx }: { tx: TransactionData }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [copiedWA, setCopiedWA] = useState(false);

  const handleCopyWA = () => {
    const text = generateWhatsAppReceipt(tx);
    navigator.clipboard.writeText(text);
    setCopiedWA(true);
    setTimeout(() => setCopiedWA(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleTogglePayment = () => {
    const newStatus = tx.paymentStatus === "Lunas" ? "Belum Lunas" : "Lunas";
    startTransition(async () => {
      await togglePaymentStatusAction(tx.id, newStatus);
      router.refresh();
    });
  };

  const handleToggleShipping = () => {
    const newStatus = tx.shippingStatus === "Sudah Dikirim" ? "Belum Dikirim" : "Sudah Dikirim";
    startTransition(async () => {
      await toggleShippingStatusAction(tx.id, newStatus);
      router.refresh();
    });
  };

  const handleDelete = () => {
    if (
      confirm(
        `Apakah Anda yakin ingin membatalkan & menghapus nota ${tx.invoiceNumber}?\n\nPerhatian: Seluruh stok barang dalam nota ini akan OTOMATIS dikembalikan ke gudang.`
      )
    ) {
      startTransition(async () => {
        const res = await removeTransactionAction(tx.id);
        if (res.success) {
          router.push("/transaksi");
        } else {
          alert(res.error || "Gagal menghapus nota");
        }
      });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Action Header - Hide in print */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <Link
          href="/transaksi"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Nota</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          {/* Tombol Salin WA */}
          <button
            type="button"
            onClick={handleCopyWA}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold rounded-xl shadow-sm transition-all active:scale-95"
          >
            {copiedWA ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            <span>{copiedWA ? "Format WA Disalin!" : "📲 Salin Format WhatsApp"}</span>
          </button>

          {/* Tombol Cetak Struk */}
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold rounded-xl shadow-sm transition-all active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>🖨️ Cetak Struk</span>
          </button>

          {/* Tombol Hapus */}
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="flex items-center gap-1.5 px-3 py-2.5 bg-rose-50 text-rose-700 hover:bg-rose-100 text-sm font-semibold rounded-xl transition-all"
            title="Hapus Transaksi dan Kembalikan Stok"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Hapus & Rollback</span>
          </button>
        </div>
      </div>

      {/* Kontrol Status Cepat - Hide in print */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h4 className="text-xs uppercase font-bold text-slate-500 tracking-wider">
            Pengaturan Status Cepat
          </h4>
          <p className="text-sm text-slate-600">
            Klik tombol status untuk mengubah status bayar atau kirim seketika.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={isPending}
            onClick={handleTogglePayment}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold border transition-all flex items-center gap-1.5 shadow-sm active:scale-95 ${
              tx.paymentStatus === "Lunas"
                ? "bg-emerald-600 text-white border-emerald-700"
                : "bg-amber-500 text-white border-amber-600"
            }`}
          >
            {tx.paymentStatus === "Lunas" ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Status: LUNAS (Ubah)</span>
              </>
            ) : (
              <>
                <ClockAlert className="w-4 h-4" />
                <span>Status: BELUM LUNAS (Klik utk Lunas)</span>
              </>
            )}
          </button>

          <button
            type="button"
            disabled={isPending}
            onClick={handleToggleShipping}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold border transition-all flex items-center gap-1.5 shadow-sm active:scale-95 ${
              tx.shippingStatus === "Sudah Dikirim"
                ? "bg-sky-600 text-white border-sky-700"
                : "bg-slate-700 text-white border-slate-800"
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>{tx.shippingStatus} (Ubah)</span>
          </button>
        </div>
      </div>

      {/* Nota / Struk Pembelian (Printable Container) */}
      <div className="receipt-container bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-md space-y-6">
        {/* Header Nota */}
        <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
              Koperasi Syariah
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">MYKOPSYAH</h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Pengelolaan Perlengkapan Santri & Seragam
            </p>
          </div>

          <div className="text-left sm:text-right space-y-1">
            <p className="text-xs font-bold text-slate-500 uppercase">Nomor Nota:</p>
            <p className="text-xl sm:text-2xl font-mono font-black text-emerald-800">
              {tx.invoiceNumber}
            </p>
            <p className="text-xs text-slate-500">{formatTanggal(tx.createdAt)}</p>
          </div>
        </div>

        {/* Data Pelanggan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-500 uppercase">Tujuan / Pemesan:</p>
            <p className="font-bold text-slate-900 text-base flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{tx.customerNameSnapshot}</span>
            </p>
            <p className="text-slate-600 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>
                Penerima: {tx.recipientName} ({tx.recipientPhone})
              </span>
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-500 uppercase">Alamat Pengiriman:</p>
            <p className="font-semibold text-slate-900 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{tx.citySnapshot}</span>
            </p>
            {tx.fullAddressSnapshot && (
              <p className="text-slate-600 text-xs">{tx.fullAddressSnapshot}</p>
            )}
          </div>
        </div>

        {/* Tabel Rincian Barang */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Nama Barang & Varian</th>
                <th className="py-3 px-4 text-center">Harga Satuan</th>
                <th className="py-3 px-4 text-center">Jumlah</th>
                <th className="py-3 px-4 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tx.items.map((item) => (
                <tr key={item.id}>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    {item.itemNameSnapshot}
                  </td>
                  <td className="py-3.5 px-4 text-center text-slate-700">
                    {formatRupiah(item.unitPrice)}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-900">
                    {item.quantity}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                    {formatRupiah(item.subtotal)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
              <tr>
                <td colSpan={3} className="py-4 px-4 text-right text-slate-700 text-base">
                  TOTAL BELANJA:
                </td>
                <td className="py-4 px-4 text-right text-emerald-800 text-xl font-black">
                  {formatRupiah(tx.totalAmount)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Status Badge di Nota */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200">
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                tx.paymentStatus === "Lunas"
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  : "bg-amber-100 text-amber-800 border border-amber-300"
              }`}
            >
              Status Bayar: {tx.paymentStatus.toUpperCase()}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                tx.shippingStatus === "Sudah Dikirim"
                  ? "bg-sky-100 text-sky-800 border border-sky-300"
                  : "bg-slate-100 text-slate-700 border border-slate-300"
              }`}
            >
              Status Kirim: {tx.shippingStatus.toUpperCase()}
            </span>
          </div>

          {tx.notes && (
            <p className="text-xs text-slate-500 italic">
              <strong>Catatan:</strong> {tx.notes}
            </p>
          )}
        </div>

        {/* Footer Nota Print */}
        <div className="pt-6 text-center text-xs text-slate-400 border-t border-dashed border-slate-200">
          <p>Terima kasih atas kepercayaannya berbelanja di Koperasi Syariah (MyKopsyah).</p>
          <p>Semoga berkah dan bermanfaat.</p>
        </div>
      </div>
    </div>
  );
}
