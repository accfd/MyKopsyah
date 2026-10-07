"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { PelangganData, TransactionData } from "@/lib/data-service";
import { formatRupiah, formatTanggal } from "@/lib/format";
import {
  ArrowLeft,
  Building2,
  User,
  Phone,
  MapPin,
  Calendar,
  MessageCircle,
  Receipt,
  Plus,
  Search,
  ShoppingBag,
  Banknote,
  Clock,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Truck,
} from "lucide-react";

export default function DetailPelangganClient({
  pelanggan,
  transactions,
}: {
  pelanggan: PelangganData;
  transactions: TransactionData[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"SEMUA" | "Lunas" | "Belum Lunas">("SEMUA");

  const isInstansi = pelanggan.tipePelanggan.includes("Instansi");

  // Format nomor WhatsApp internasional
  const cleanPhone = pelanggan.noTelepon ? pelanggan.noTelepon.replace(/[^0-9]/g, "") : "";
  const waNumber = cleanPhone.startsWith("0")
    ? "62" + cleanPhone.slice(1)
    : cleanPhone;

  // Akumulasi Finansial & Belanja Pelanggan
  const stats = useMemo(() => {
    let totalNominal = 0;
    let lunasNominal = 0;
    let belumLunasNominal = 0;
    let totalItems = 0;

    for (const tx of transactions) {
      totalNominal += tx.totalAmount;
      if (tx.paymentStatus === "Lunas") {
        lunasNominal += tx.totalAmount;
      } else {
        belumLunasNominal += tx.totalAmount;
      }
      for (const it of tx.items) {
        totalItems += it.quantity;
      }
    }

    return {
      txCount: transactions.length,
      totalNominal,
      lunasNominal,
      belumLunasNominal,
      totalItems,
    };
  }, [transactions]);

  // Filter Daftar Transaksi
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Filter Status Bayar
      if (statusFilter !== "SEMUA" && tx.paymentStatus !== statusFilter) {
        return false;
      }

      // Filter Pencarian
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchInvoice = tx.invoiceNumber.toLowerCase().includes(q);
        const matchItems = tx.items.some((it) =>
          it.itemNameSnapshot.toLowerCase().includes(q)
        );
        const matchNotes = tx.notes ? tx.notes.toLowerCase().includes(q) : false;
        return matchInvoice || matchItems || matchNotes;
      }

      return true;
    });
  }, [transactions, statusFilter, searchQuery]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* ─── NAVIGASI KEMBALI & AKSI CEPAT ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <Link
          href="/pelanggan"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-emerald-800 transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Data Pelanggan</span>
        </Link>

        <div className="flex items-center gap-2">
          {waNumber && (
            <a
              href={`https://wa.me/${waNumber}?text=${encodeURIComponent(
                `Assalamu'alaikum ${pelanggan.nama}, kami dari Koperasi Syariah FKDT Sumbar...`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-all border border-emerald-200 shadow-xs"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat WhatsApp</span>
            </a>
          )}

          <Link
            href="/transaksi/baru"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Transaksi Baru</span>
          </Link>
        </div>
      </div>

      {/* ─── KARTU PROFIL PELANGGAN ─── */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-50/60 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-start justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-800 text-white flex items-center justify-center font-black text-xl sm:text-2xl shadow-sm shrink-0">
              {pelanggan.nama.charAt(0).toUpperCase()}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {pelanggan.nama}
                </h1>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-black uppercase tracking-wider ${
                    isInstansi
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      : "bg-slate-100 text-slate-700 border border-slate-200"
                  }`}
                >
                  {isInstansi ? (
                    <Building2 className="w-3 h-3" />
                  ) : (
                    <User className="w-3 h-3" />
                  )}
                  <span>{pelanggan.tipePelanggan}</span>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span className="font-bold text-slate-800">
                    {pelanggan.kota}
                    {pelanggan.provinsi ? `, ${pelanggan.provinsi}` : ""}
                  </span>
                </div>

                {pelanggan.noTelepon && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{pelanggan.noTelepon}</span>
                  </div>
                )}

                <div className="flex items-center gap-1.5 text-slate-400">
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  <span>ID #{pelanggan.id}</span>
                </div>
              </div>

              {pelanggan.alamatLengkap && (
                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-2">
                  <span className="font-bold text-slate-700">Alamat Lengkap: </span>
                  {pelanggan.alamatLengkap}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── KARTU KPI STATISTIK BELANJA PELANGGAN ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Transaksi */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
            <Receipt className="w-6 h-6 text-emerald-800" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase">Total Pesanan</span>
            <div className="text-2xl font-black text-slate-900 mt-0.5">
              {stats.txCount}{" "}
              <span className="text-xs font-bold text-slate-400">Nota</span>
            </div>
            <span className="text-[11px] text-slate-500">{stats.totalItems} unit item</span>
          </div>
        </div>

        {/* Total Nilai Belanja */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
            <Banknote className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase">Total Belanja</span>
            <div className="text-xl sm:text-2xl font-black text-emerald-900 mt-0.5">
              {formatRupiah(stats.totalNominal)}
            </div>
            <span className="text-[11px] text-emerald-700 font-bold">Akumulasi pesanan</span>
          </div>
        </div>

        {/* Terbayar Lunas */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase">Terbayar Lunas</span>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
              {formatRupiah(stats.lunasNominal)}
            </div>
            <span className="text-[11px] text-emerald-700 font-bold">Dana masuk kasir</span>
          </div>
        </div>

        {/* Piutang Belum Lunas */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase">Sisa Piutang</span>
            <div className="text-xl sm:text-2xl font-black text-amber-700 mt-0.5">
              {formatRupiah(stats.belumLunasNominal)}
            </div>
            <span className="text-[11px] text-amber-800 font-bold">Belum diselesaikan</span>
          </div>
        </div>
      </div>

      {/* ─── DAFTAR RIWAYAT TRANSAKSI ─── */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Header Bagian Transaksi & Filter Toolbar */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-emerald-800" />
              <span>Riwayat Transaksi Pemesan</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Daftar seluruh nota penjualan dan faktur atas nama {pelanggan.nama}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Filter Status Bayar */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => setStatusFilter("SEMUA")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  statusFilter === "SEMUA"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Semua ({transactions.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("Lunas")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  statusFilter === "Lunas"
                    ? "bg-white text-emerald-800 shadow-xs font-black"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Lunas
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("Belum Lunas")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  statusFilter === "Belum Lunas"
                    ? "bg-white text-amber-800 shadow-xs font-black"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Belum Lunas
              </button>
            </div>

            {/* Kolom Cari Nota */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari no. nota / barang..."
                className="w-full sm:w-56 pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>

        {/* Konten Daftar Nota */}
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-800">
              {transactions.length === 0
                ? "Belum ada transaksi tercatat untuk pemesan ini"
                : "Tidak ada transaksi yang sesuai filter"}
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {transactions.length === 0
                ? "Pelanggan ini baru didaftarkan. Klik tombol di bawah untuk mencatat transaksi penjualan pertamanya."
                : "Coba ubah kata kunci pencarian atau ganti status filter pembayaran."}
            </p>
            {transactions.length === 0 && (
              <div className="mt-4">
                <Link
                  href="/transaksi/baru"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-800 text-white font-bold text-xs shadow-xs hover:bg-emerald-700 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Catat Transaksi Pertama</span>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredTransactions.map((tx) => {
              const totalItemsInTx = tx.items.reduce((s, it) => s + it.quantity, 0);

              return (
                <div
                  key={tx.id}
                  className="p-4 sm:p-5 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* Info Nota Kiri */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/transaksi/${tx.id}`}
                        className="font-mono font-black text-sm text-emerald-900 hover:text-emerald-700 hover:underline"
                      >
                        {tx.invoiceNumber}
                      </Link>

                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs font-semibold text-slate-500">
                        {formatTanggal(tx.createdAt)}
                      </span>

                      {/* Badge Pembayaran */}
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                          tx.paymentStatus === "Lunas"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : "bg-amber-100 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {tx.paymentStatus}
                      </span>

                      {/* Badge Pengiriman */}
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                          tx.shippingStatus === "Sudah Dikirim"
                            ? "bg-sky-100 text-sky-800 border border-sky-200"
                            : "bg-slate-100 text-slate-700 border border-slate-200"
                        }`}
                      >
                        <Truck className="w-2.5 h-2.5" />
                        <span>{tx.shippingStatus}</span>
                      </span>
                    </div>

                    {/* Rincian Item Barang Singkat */}
                    <div className="text-xs text-slate-700 flex flex-wrap gap-1.5 pt-0.5">
                      {tx.items.slice(0, 3).map((it) => (
                        <span
                          key={it.id}
                          className="bg-slate-100 px-2 py-0.5 rounded-md text-[11px] font-medium text-slate-700"
                        >
                          {it.itemNameSnapshot} ({it.quantity})
                        </span>
                      ))}
                      {tx.items.length > 3 && (
                        <span className="text-[11px] text-slate-400 font-bold self-center">
                          +{tx.items.length - 3} barang lainnya
                        </span>
                      )}
                    </div>

                    {tx.notes && (
                      <p className="text-[11px] text-slate-500 italic">
                        Catatan: {tx.notes}
                      </p>
                    )}
                  </div>

                  {/* Nilai Tagihan Kanan & Tombol Buka Nota */}
                  <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-0 border-slate-100">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase block">
                        Total {totalItemsInTx} unit
                      </span>
                      <span className="text-base sm:text-lg font-black text-slate-900 block">
                        {formatRupiah(tx.totalAmount)}
                      </span>
                    </div>

                    <Link
                      href={`/transaksi/${tx.id}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-emerald-800 hover:text-white text-slate-700 font-bold text-xs transition-all shadow-xs active:scale-95"
                    >
                      <span>Buka Nota</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
