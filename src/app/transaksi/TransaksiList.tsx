"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TransactionData } from "@/lib/data-service";
import { formatRupiah, formatTanggal } from "@/lib/format";
import {
  togglePaymentStatusAction,
  toggleShippingStatusAction,
} from "@/app/actions";
import {
  Search,
  PlusCircle,
  ArrowRight,
  ClockAlert,
  Truck,
  CheckCircle2,
  PackageCheck,
  Loader2,
  Lock,
  AlertCircle,
} from "lucide-react";

export default function TransaksiList({ transactions }: { transactions: TransactionData[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [updatingAction, setUpdatingAction] = useState<{ id: number; field: "payment" | "shipping" } | null>(null);
  const [confirmStatusModal, setConfirmStatusModal] = useState<{
    tx: TransactionData;
    field: "payment" | "shipping";
    nextStatus: "Belum Lunas" | "Lunas" | "Belum Dikirim" | "Sudah Dikirim";
  } | null>(null);

  const [search, setSearch] = useState("");
  const [filterPayment, setFilterPayment] = useState<string>("ALL");
  const [filterShipping, setFilterShipping] = useState<string>("ALL");

  const filtered = transactions.filter((tx) => {
    const matchSearch =
      tx.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      tx.customerNameSnapshot.toLowerCase().includes(search.toLowerCase()) ||
      tx.citySnapshot.toLowerCase().includes(search.toLowerCase()) ||
      tx.recipientName.toLowerCase().includes(search.toLowerCase());

    const matchPayment =
      filterPayment === "ALL" || tx.paymentStatus === filterPayment;

    const matchShipping =
      filterShipping === "ALL" || tx.shippingStatus === filterShipping;

    return matchSearch && matchPayment && matchShipping;
  });

  // Memicu modal konfirmasi ubah status bayar
  const promptTogglePayment = (e: React.MouseEvent, tx: TransactionData) => {
    e.preventDefault();
    e.stopPropagation();
    const nextStatus = tx.paymentStatus === "Lunas" ? "Belum Lunas" : "Lunas";
    setConfirmStatusModal({ tx, field: "payment", nextStatus });
  };

  // Memicu modal konfirmasi ubah status kirim
  const promptToggleShipping = (e: React.MouseEvent, tx: TransactionData) => {
    e.preventDefault();
    e.stopPropagation();
    const nextStatus = tx.shippingStatus === "Sudah Dikirim" ? "Belum Dikirim" : "Sudah Dikirim";
    setConfirmStatusModal({ tx, field: "shipping", nextStatus });
  };

  // Eksekusi perubahan status setelah dikonfirmasi di modal
  const handleConfirmStatusChange = () => {
    if (!confirmStatusModal) return;
    const { tx, field, nextStatus } = confirmStatusModal;
    setUpdatingAction({ id: tx.id, field });
    setConfirmStatusModal(null);

    startTransition(async () => {
      try {
        if (field === "payment") {
          await togglePaymentStatusAction(tx.id, nextStatus as "Belum Lunas" | "Lunas");
        } else {
          await toggleShippingStatusAction(tx.id, nextStatus as "Belum Dikirim" | "Sudah Dikirim");
        }
        router.refresh();
      } finally {
        setUpdatingAction(null);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Search & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari no. nota, nama pemesan, kota..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 shadow-sm"
          />
          <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <Link
          href="/transaksi/baru"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md transition-all active:scale-98"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Catat Transaksi Baru</span>
        </Link>
      </div>

      {/* Filter Tabs - 1 Baris Penuh di PC maupun HP */}
      <div className="w-full overflow-x-auto no-scrollbar">
        <div className="grid grid-cols-4 gap-1 sm:gap-2 p-1 sm:p-1.5 bg-slate-100 rounded-2xl border border-slate-200/80 min-w-[320px] sm:min-w-0 max-w-2xl">
          <button
            type="button"
            onClick={() => {
              setFilterPayment("ALL");
              setFilterShipping("ALL");
            }}
            className={`py-2 px-1 sm:px-3 text-center text-xs font-bold rounded-xl transition-all flex items-center justify-center truncate ${
              filterPayment === "ALL" && filterShipping === "ALL"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
            }`}
          >
            <span>Semua ({transactions.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setFilterPayment("Belum Lunas");
              setFilterShipping("ALL");
            }}
            className={`py-2 px-1 sm:px-3 text-center text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 sm:gap-1.5 truncate ${
              filterPayment === "Belum Lunas"
                ? "bg-amber-500 text-white shadow-sm"
                : "text-amber-800 hover:bg-amber-50"
            }`}
          >
            <ClockAlert className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Belum Lunas</span>
            <span className="sm:hidden text-[11px]">Blm Lunas</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setFilterPayment("Lunas");
              setFilterShipping("ALL");
            }}
            className={`py-2 px-1 sm:px-3 text-center text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 sm:gap-1.5 truncate ${
              filterPayment === "Lunas"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-emerald-800 hover:bg-emerald-50"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>Lunas</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setFilterPayment("ALL");
              setFilterShipping("Belum Dikirim");
            }}
            className={`py-2 px-1 sm:px-3 text-center text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 sm:gap-1.5 truncate ${
              filterShipping === "Belum Dikirim"
                ? "bg-slate-700 text-white shadow-sm"
                : "text-slate-700 hover:bg-slate-200/60"
            }`}
          >
            <Truck className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Belum Dikirim</span>
            <span className="sm:hidden text-[11px]">Blm Kirim</span>
          </button>
        </div>
      </div>

      {/* List of Transactions */}
      {filtered.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500">
          Tidak ada nota transaksi yang sesuai dengan filter pencarian.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((tx) => (
            <Link
              key={tx.id}
              href={`/transaksi/${tx.id}`}
              className="block bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-400 hover:shadow-md transition-all group relative"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-extrabold text-emerald-800 text-sm sm:text-base">
                      {tx.invoiceNumber}
                    </span>
                    <span className="text-xs text-slate-300">•</span>
                    <span className="text-xs text-slate-500 font-medium">
                      {formatTanggal(tx.createdAt)}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 group-hover:text-emerald-900 transition-colors">
                    {tx.customerNameSnapshot}
                  </h4>

                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500">
                    <span className="font-semibold text-emerald-800">{tx.citySnapshot}</span>
                    {tx.recipientPhone && tx.recipientPhone !== "-" && (
                      <span>• HP: {tx.recipientPhone}</span>
                    )}
                    {tx.recipientName && tx.recipientName !== tx.customerNameSnapshot && (
                      <span>• Penerima: {tx.recipientName}</span>
                    )}
                  </div>

                  {/* Ringkasan Barang yang Ringkas & Rapi */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                      {tx.items.length} macam barang ({tx.items.reduce((acc, it) => acc + it.quantity, 0)} total unit)
                    </span>
                    {tx.items.slice(0, 3).map((it, idx) => {
                      const shortName = it.itemNameSnapshot.includes(" - ")
                        ? it.itemNameSnapshot.split(" - ").pop()
                        : it.itemNameSnapshot;
                      return (
                        <span
                          key={idx}
                          className="text-[11px] text-slate-600 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md"
                        >
                          {shortName} <strong className="text-slate-800">({it.quantity})</strong>
                        </span>
                      );
                    })}
                    {tx.items.length > 3 && (
                      <span className="text-[11px] text-slate-400 font-semibold">
                        +{tx.items.length - 3} lainnya
                      </span>
                    )}
                  </div>
                </div>

                {/* Kolom Kanan: Total & Status Toggle Cepat Langsung di Card */}
                <div className="flex sm:flex-col sm:items-end justify-between items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <span className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                    {formatRupiah(tx.totalAmount)}
                  </span>

                  <div className="flex items-center gap-1.5 sm:gap-2">
                    {/* Tombol Status Bayar Cepat */}
                    <button
                      type="button"
                      title={tx.paymentStatus === "Lunas" ? "Ubah jadi Belum Lunas" : "Tandai LUNAS"}
                      onClick={(e) => promptTogglePayment(e, tx)}
                      disabled={isPending && updatingAction?.id === tx.id}
                      className={`inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer border ${
                        tx.paymentStatus === "Lunas"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                          : "bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100"
                      } ${
                        isPending && updatingAction?.id === tx.id && updatingAction.field === "payment"
                          ? "opacity-60"
                          : ""
                      }`}
                    >
                      {isPending && updatingAction?.id === tx.id && updatingAction.field === "payment" ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : tx.paymentStatus === "Lunas" ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                      ) : (
                        <ClockAlert className="w-3.5 h-3.5 text-amber-700" />
                      )}
                      <span>{tx.paymentStatus}</span>
                    </button>

                    {/* Tombol Status Kirim Cepat */}
                    <button
                      type="button"
                      title={tx.shippingStatus === "Sudah Dikirim" ? "Ubah jadi Belum Dikirim" : "Tandai Sudah Dikirim"}
                      onClick={(e) => promptToggleShipping(e, tx)}
                      disabled={isPending && updatingAction?.id === tx.id}
                      className={`inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer border ${
                        tx.shippingStatus === "Sudah Dikirim"
                          ? "bg-sky-50 text-sky-800 border-sky-300 hover:bg-sky-100"
                          : "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200"
                      } ${
                        isPending && updatingAction?.id === tx.id && updatingAction.field === "shipping"
                          ? "opacity-60"
                          : ""
                      }`}
                    >
                      {isPending && updatingAction?.id === tx.id && updatingAction.field === "shipping" ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : tx.shippingStatus === "Sudah Dikirim" ? (
                        <PackageCheck className="w-3.5 h-3.5 text-sky-700" />
                      ) : (
                        <Truck className="w-3.5 h-3.5 text-slate-600" />
                      )}
                      <span>{tx.shippingStatus}</span>
                    </button>

                    {tx.paymentStatus === "Lunas" && tx.shippingStatus === "Sudah Dikirim" && (
                      <span
                        title="Transaksi Selesai & Terkunci"
                        className="p-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200 hidden sm:inline-flex"
                      >
                        <Lock className="w-3.5 h-3.5" />
                      </span>
                    )}

                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-1 transition-all hidden sm:block ml-0.5" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* ─── MODAL KONFIRMASI UBAH STATUS (MENCEGAH KESALAHAN SENTUH DI HP) ─── */}
      {confirmStatusModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setConfirmStatusModal(null)}
        >
          <div
            className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-100 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                  {confirmStatusModal.field === "payment"
                    ? "Konfirmasi Status Pembayaran"
                    : "Konfirmasi Status Pengiriman"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-mono">
                  Nota: {confirmStatusModal.tx.invoiceNumber}
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 text-xs sm:text-sm text-slate-700 space-y-1.5">
              <p>
                Pelanggan: <strong className="text-slate-900">{confirmStatusModal.tx.customerNameSnapshot}</strong>
              </p>
              <p>
                Total Nota: <strong className="text-emerald-800">{formatRupiah(confirmStatusModal.tx.totalAmount)}</strong>
              </p>
              <div className="pt-2 border-t border-slate-200 text-xs text-slate-600">
                {confirmStatusModal.field === "payment" ? (
                  confirmStatusModal.nextStatus === "Lunas" ? (
                    <p>
                      Ubah status menjadi <strong className="text-emerald-700 font-bold">LUNAS</strong>? Pastikan pembayaran tunai atau transfer telah masuk ke rekening koperasi.
                    </p>
                  ) : (
                    <p>
                      Kembalikan status menjadi <strong className="text-amber-700 font-bold">BELUM LUNAS</strong> (piutang)?
                    </p>
                  )
                ) : confirmStatusModal.nextStatus === "Sudah Dikirim" ? (
                  <p>
                    Tandai barang <strong className="text-sky-700 font-bold">SUDAH DIKIRIM</strong>? Pastikan barang fisik telah diserahkan ke kurir atau diterima pemesan.
                  </p>
                ) : (
                  <p>
                    Kembalikan status pengiriman menjadi <strong className="text-slate-700 font-bold">BELUM DIKIRIM</strong>?
                  </p>
                )}
              </div>

              {confirmStatusModal.nextStatus === "Lunas" && confirmStatusModal.tx.shippingStatus === "Sudah Dikirim" && (
                <div className="p-2 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 font-semibold flex items-center gap-1.5 mt-2">
                  <Lock className="w-3.5 h-3.5 shrink-0" />
                  <span>Perhatian: Transaksi yang Lunas & Sudah Dikirim akan otomatis terkunci permanen.</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmStatusModal(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs sm:text-sm font-bold hover:bg-slate-100 transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmStatusChange}
                disabled={isPending}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-700/20 transition-all active:scale-95 cursor-pointer flex items-center gap-2"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <span>Ya, Konfirmasi Ubah</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
