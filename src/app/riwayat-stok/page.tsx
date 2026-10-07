import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import {
  getStockEntries,
  groupStockEntriesIntoBatches,
} from "@/lib/data-service";
import AdminShell from "@/components/AdminShell";
import RiwayatStokClient from "./RiwayatStokClient";

export const dynamic = "force-dynamic";

export default async function RiwayatStokPage() {
  const auth = await isAuthenticated();
  if (!auth) {
    redirect("/login");
  }

  const entries = await getStockEntries(500);
  const batches = groupStockEntriesIntoBatches(entries);

  return (
    <AdminShell>
      <RiwayatStokClient batches={batches} />
    </AdminShell>
  );
}
