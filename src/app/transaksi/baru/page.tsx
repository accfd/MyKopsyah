import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { getProductsWithVariants, getPelanggan } from "@/lib/data-service";
import AdminShell from "@/components/AdminShell";
import KasirForm from "./KasirForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TransaksiBaruPage() {
  const auth = await isAuthenticated();
  if (!auth) {
    redirect("/login");
  }

  const [products, customers] = await Promise.all([
    getProductsWithVariants(),
    getPelanggan(),
  ]);

  const pastCustomers = customers.map((c) => ({
    name: c.nama,
    phone: c.noTelepon,
    city: c.kota,
    address: c.alamatLengkap,
  }));

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/transaksi"
            className="p-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Kasir Penjualan</h2>
          </div>
        </div>

        <KasirForm products={products} pastCustomers={pastCustomers} />
      </div>
    </AdminShell>
  );
}
