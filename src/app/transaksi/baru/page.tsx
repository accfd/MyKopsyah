import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { getProductsWithVariants, getTransactions } from "@/lib/data-service";
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

  const [products, transactions] = await Promise.all([
    getProductsWithVariants(),
    getTransactions(),
  ]);

  const customerMap = new Map<string, { name: string; phone: string; city: string; address?: string | null }>();
  for (const tx of transactions) {
    const name = (tx.recipientName || tx.customerNameSnapshot || "").trim();
    if (name && !customerMap.has(name.toLowerCase())) {
      customerMap.set(name.toLowerCase(), {
        name,
        phone: tx.recipientPhone || "",
        city: tx.citySnapshot || "",
        address: tx.fullAddressSnapshot || "",
      });
    }
  }
  const pastCustomers = Array.from(customerMap.values());

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
