import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { getTransactions, getProductsWithVariants } from "@/lib/data-service";
import AdminShell from "@/components/AdminShell";
import LaporanWilayahClient from "./LaporanWilayahClient";

export const dynamic = "force-dynamic";

export default async function RegionalReportPage() {
  const auth = await isAuthenticated();
  if (!auth) {
    redirect("/login");
  }

  const [transactions, products] = await Promise.all([
    getTransactions(),
    getProductsWithVariants(),
  ]);

  return (
    <AdminShell>
      <LaporanWilayahClient transactions={transactions} products={products} />
    </AdminShell>
  );
}
