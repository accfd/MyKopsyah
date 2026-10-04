import { redirect, notFound } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { getTransactionById } from "@/lib/data-service";
import AdminShell from "@/components/AdminShell";
import DetailTransaksiClient from "./DetailTransaksiClient";

export const dynamic = "force-dynamic";

export default async function DetailTransaksiPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const auth = await isAuthenticated();
  if (!auth) {
    redirect("/login");
  }

  const { id } = await params;
  const transactionId = parseInt(id, 10);
  if (isNaN(transactionId)) {
    notFound();
  }

  const tx = await getTransactionById(transactionId);
  if (!tx) {
    notFound();
  }

  return (
    <AdminShell>
      <DetailTransaksiClient tx={tx} />
    </AdminShell>
  );
}
