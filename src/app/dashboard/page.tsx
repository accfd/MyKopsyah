import { redirect } from "next/navigation";
import Link from "next/link";
import { isAuthenticated } from "@/lib/auth";
import { getTransactions, getProductsWithVariants } from "@/lib/data-service";
import { formatRupiah, formatTanggal } from "@/lib/format";
import AdminShell from "@/components/AdminShell";
import {
  Banknote,
  ClockAlert,
  Truck,
  PlusCircle,
  AlertTriangle,
  ArrowRight,
  ReceiptText,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const auth = await isAuthenticated();
  if (!auth) {
    redirect("/login");
  }

  const [transactions, products] = await Promise.all([
    getTransactions(),
    getProductsWithVariants(),
  ]);

  // Compute metrics
  const totalRevenue = transactions.reduce((acc, curr) => acc + curr.totalAmount, 0);

  const pendingPaymentTxs = transactions.filter((t) => t.paymentStatus === "Belum Lunas");
  const pendingPaymentTotal = pendingPaymentTxs.reduce((acc, curr) => acc + curr.totalAmount, 0);

  const pendingShippingTxs = transactions.filter((t) => t.shippingStatus === "Belum Dikirim");

  // Critical stock list (stock <= 5)
  const lowStockItems: {
    productName: string;
    variantName: string;
    stockQuantity: number;
    price: number;
    unit: string;
  }[] = [];

  for (const prod of products) {
    for (const v of prod.variants) {
      if (v.stockQuantity <= 5) {
        lowStockItems.push({
          productName: prod.name,
          variantName: v.variantName,
          stockQuantity: v.stockQuantity,
          price: v.price,
          unit: prod.unit,
        });
      }
    }
  }

  return (
    <AdminShell>
      <div className="space-y-6 sm:space-y-8">
        {/* Welcome & Actions Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Dasbor Utama</h2>
          </div>
          <Link
            href="/transaksi/baru"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md transition-all active:scale-98"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Catat Penjualan Baru</span>
          </Link>
        </div>

        {/* 3 Kartu Metrik Utama */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {/* Total Penjualan */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between">
            <div>
              <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-500">
                Total Penjualan
              </p>
              <h4 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
                {formatRupiah(totalRevenue)}
              </h4>
              <p className="text-xs text-slate-500 mt-1">{transactions.length} total nota tercatat</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Banknote className="w-6 h-6" />
            </div>
          </div>

          {/* Belum Lunas */}
          <Link
            href="/transaksi"
            className="bg-white p-5 sm:p-6 rounded-2xl border border-amber-200 shadow-sm hover:border-amber-400 transition-all flex items-start justify-between group"
          >
            <div>
              <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-amber-700">
                Pesanan Belum Lunas
              </p>
              <h4 className="text-xl sm:text-2xl font-extrabold text-amber-600 mt-2">
                {formatRupiah(pendingPaymentTotal)}
              </h4>
              <p className="text-xs font-semibold text-amber-800 mt-1 flex items-center gap-1">
                <span>{pendingPaymentTxs.length} nota menunggu pelunasan</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ClockAlert className="w-6 h-6" />
            </div>
          </Link>

          {/* Belum Dikirim */}
          <Link
            href="/transaksi"
            className="bg-white p-5 sm:p-6 rounded-2xl border border-sky-200 shadow-sm hover:border-sky-400 transition-all flex items-start justify-between group"
          >
            <div>
              <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-sky-700">
                Pesanan Belum Dikirim
              </p>
              <h4 className="text-xl sm:text-2xl font-extrabold text-sky-600 mt-2">
                {pendingShippingTxs.length} Paket
              </h4>
              <p className="text-xs font-semibold text-sky-800 mt-1 flex items-center gap-1">
                <span>Siap dipacking & dikirim</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Truck className="w-6 h-6" />
            </div>
          </Link>
        </div>

        {/* Peringatan Stok Kritis (Stok Menipis) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Peringatan Barang Stok Kritis</h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Daftar barang dengan stok tersisa 5 buah atau habis
                </p>
              </div>
            </div>
            <Link
              href="/produk"
              className="text-sm font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>Input Stok Masuk</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {lowStockItems.length === 0 ? (
            <div className="py-6 text-center text-slate-500 bg-slate-50 rounded-xl">
              ✅ Seluruh barang memiliki stok aman di atas 5 pcs.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase font-semibold">
                    <th className="py-3 px-3">Nama Produk</th>
                    <th className="py-3 px-3">Varian</th>
                    <th className="py-3 px-3">Sisa Stok</th>
                    <th className="py-3 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lowStockItems.slice(0, 6).map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-semibold text-slate-900">{item.productName}</td>
                      <td className="py-3 px-3 text-slate-600">{item.variantName}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            item.stockQuantity === 0
                              ? "bg-rose-100 text-rose-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {item.stockQuantity === 0
                            ? "Habis (0)"
                            : `Sisa ${item.stockQuantity} ${item.unit}`}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Link
                          href="/produk"
                          className="px-3 py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg inline-block"
                        >
                          Tambah Stok
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Transaksi Terakhir */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                <ReceiptText className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">5 Transaksi Terakhir</h3>
            </div>
            <Link
              href="/transaksi"
              className="text-sm font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>Lihat Semua Nota</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {transactions.slice(0, 5).map((tx) => (
              <Link
                key={tx.id}
                href={`/transaksi/${tx.id}`}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50 px-2 rounded-xl transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-emerald-800 text-sm">
                      {tx.invoiceNumber}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500">{formatTanggal(tx.createdAt)}</span>
                  </div>
                  <h4 className="font-semibold text-slate-900 mt-1">{tx.customerNameSnapshot}</h4>
                  <p className="text-xs text-slate-500">{tx.citySnapshot}</p>
                </div>
                <div className="flex items-center sm:flex-col sm:items-end justify-between gap-2">
                  <span className="text-base font-extrabold text-slate-900">
                    {formatRupiah(tx.totalAmount)}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                        tx.paymentStatus === "Lunas"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {tx.paymentStatus}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        tx.shippingStatus === "Sudah Dikirim"
                          ? "bg-sky-100 text-sky-800"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {tx.shippingStatus}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
