"use client";

import { useState } from "react";
import Link from "next/link";
import { TransactionData } from "@/lib/data-service";
import { formatRupiah, formatTanggal } from "@/lib/format";
import { Search, PlusCircle, ArrowRight, ClockAlert, Truck, CheckCircle2 } from "lucide-react";

export default function TransaksiList({ transactions }: { transactions: TransactionData[] }) {
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
          <span>+ Catat Transaksi Baru</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => {
            setFilterPayment("ALL");
            setFilterShipping("ALL");
          }}
          className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
            filterPayment === "ALL" && filterShipping === "ALL"
              ? "bg-slate-800 text-white border-slate-800 shadow-sm"
              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
          }`}
        >
          Semua ({transactions.length})
        </button>

        <button
          onClick={() => {
            setFilterPayment("Belum Lunas");
            setFilterShipping("ALL");
          }}
          className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 ${
            filterPayment === "Belum Lunas"
              ? "bg-amber-500 text-white border-amber-600 shadow-sm"
              : "bg-white text-amber-700 border-amber-200 hover:bg-amber-50"
          }`}
        >
          <ClockAlert className="w-3.5 h-3.5" />
          <span>Belum Lunas</span>
        </button>

        <button
          onClick={() => {
            setFilterPayment("Lunas");
            setFilterShipping("ALL");
          }}
          className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 ${
            filterPayment === "Lunas"
              ? "bg-emerald-600 text-white border-emerald-700 shadow-sm"
              : "bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50"
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Lunas</span>
        </button>

        <button
          onClick={() => {
            setFilterPayment("ALL");
            setFilterShipping("Belum Dikirim");
          }}
          className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 ${
            filterShipping === "Belum Dikirim"
              ? "bg-slate-700 text-white border-slate-800 shadow-sm"
              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Truck className="w-3.5 h-3.5" />
          <span>Belum Dikirim</span>
        </button>
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
              className="block bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-extrabold text-emerald-800 text-base">
                      {tx.invoiceNumber}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500 font-medium">
                      {formatTanggal(tx.createdAt)}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900">
                    {tx.customerNameSnapshot}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Penerima: <span className="font-semibold text-slate-700">{tx.recipientName}</span> ({tx.recipientPhone}) • Tujuan: <span className="font-semibold text-slate-700">{tx.citySnapshot}</span>
                  </p>
                  <p className="text-xs text-slate-500">
                    {tx.items.length} macam barang: {tx.items.map((it) => `${it.itemNameSnapshot} (${it.quantity})`).join(", ")}
                  </p>
                </div>

                <div className="flex sm:flex-col sm:items-end justify-between items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <span className="text-lg font-black text-slate-900">
                    {formatRupiah(tx.totalAmount)}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                        tx.paymentStatus === "Lunas"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {tx.paymentStatus}
                    </span>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                        tx.shippingStatus === "Sudah Dikirim"
                          ? "bg-sky-100 text-sky-800"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {tx.shippingStatus}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-1 transition-all ml-1" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
