import { notFound, redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { getStockBatchById } from "@/lib/data-service";
import AdminShell from "@/components/AdminShell";
import DetailRiwayatStokClient from "./DetailRiwayatStokClient";

export const dynamic = "force-dynamic";

export default async function DetailRiwayatStokPage({
  params,
}: {
  params: Promise<{ batchId: string }>;
}) {
  const auth = await isAuthenticated();
  if (!auth) {
    redirect("/login");
  }

  const { batchId } = await params;
  const batch = await getStockBatchById(batchId);

  if (!batch) {
    notFound();
  }

  return (
    <AdminShell>
      <DetailRiwayatStokClient batch={batch} />
    </AdminShell>
  );
}
