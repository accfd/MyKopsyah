import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { getRegionalReport } from "@/lib/data-service";
import { formatRupiah } from "@/lib/format";
import AdminShell from "@/components/AdminShell";
import { MapPin, Building, Banknote, ShoppingBag } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function RegionalReportPage() {
  const auth = await isAuthenticated();
  if (!auth) {
    redirect("/login");
  }

  const reports = await getRegionalReport();

  const totalCities = reports.length;
  const grandTotalRevenue = reports.reduce((acc, curr) => acc + curr.totalRevenue, 0);
  const grandTotalItems = reports.reduce((acc, curr) => acc + curr.totalItemsSold, 0);

  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Rekap Penjualan per Wilayah
          </h2>
          <p className="text-sm text-slate-600">
            Distribusi pemesanan seragam & perlengkapan berdasarkan Kota/Kabupaten tujuan.
          </p>
        </div>

        {/* 3 Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs uppercase font-bold text-slate-500">Kota / Kabupaten</p>
              <h4 className="text-2xl font-black text-slate-900 mt-0.5">{totalCities} Wilayah</h4>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs uppercase font-bold text-slate-500">Total Barang Terjual</p>
              <h4 className="text-2xl font-black text-slate-900 mt-0.5">
                {grandTotalItems} Pcs / Stel
              </h4>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <Banknote className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs uppercase font-bold text-slate-500">Total Omset Wilayah</p>
              <h4 className="text-2xl font-black text-emerald-800 mt-0.5">
                {formatRupiah(grandTotalRevenue)}
              </h4>
            </div>
          </div>
        </div>

        {/* Tabel Rekap Wilayah */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Building className="w-5 h-5 text-emerald-700" />
              <span>Tabel Rincian Penjualan per Wilayah</span>
            </h3>
            <span className="text-xs font-semibold text-slate-500">Urut berdasarkan Omset</span>
          </div>

          {reports.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              Belum ada transaksi penjualan yang tercatat.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">No.</th>
                    <th className="py-3 px-4">Kota / Kabupaten</th>
                    <th className="py-3 px-4 text-center">Jumlah Transaksi</th>
                    <th className="py-3 px-4 text-center">Barang Terjual</th>
                    <th className="py-3 px-4 text-center">Status Piutang</th>
                    <th className="py-3 px-4 text-right">Total Belanja (Omset)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reports.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-bold text-slate-400">{idx + 1}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{row.city}</span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-semibold text-slate-700">
                        {row.transactionCount} nota
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                        {row.totalItemsSold} pcs
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {row.pendingPaymentCount > 0 ? (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                            {row.pendingPaymentCount} Belum Lunas
                          </span>
                        ) : (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                            Lunas Semua
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-emerald-800 text-base">
                        {formatRupiah(row.totalRevenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
