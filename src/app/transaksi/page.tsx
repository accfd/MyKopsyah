import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { getTransactions } from "@/lib/data-service";
import AdminShell from "@/components/AdminShell";
import TransaksiList from "./TransaksiList";

export const dynamic = "force-dynamic";

export default async function TransaksiPage() {
  const auth = await isAuthenticated();
  if (!auth) {
    redirect("/login");
  }

  const transactions = await getTransactions();

  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Nota Penjualan</h2>
        </div>

        <TransaksiList transactions={transactions} />
      </div>
    </AdminShell>
  );
}
