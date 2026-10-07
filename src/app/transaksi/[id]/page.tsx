import { redirect, notFound } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { getTransactionById, getProductsWithVariants } from "@/lib/data-service";
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

  const [tx, products] = await Promise.all([
    getTransactionById(transactionId),
    getProductsWithVariants(),
  ]);
  if (!tx) {
    notFound();
  }

  return (
    <AdminShell>
      <DetailTransaksiClient tx={tx} products={products} />
    </AdminShell>
  );
}
