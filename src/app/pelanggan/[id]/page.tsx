import { notFound, redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { getPelangganById, getTransactions } from "@/lib/data-service";
import AdminShell from "@/components/AdminShell";
import DetailPelangganClient from "./DetailPelangganClient";

export const dynamic = "force-dynamic";

export default async function DetailPelangganPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const auth = await isAuthenticated();
  if (!auth) {
    redirect("/login");
  }

  const { id } = await params;
  const pelangganId = parseInt(id, 10);
  if (isNaN(pelangganId)) {
    notFound();
  }

  const [pelanggan, allTransactions] = await Promise.all([
    getPelangganById(pelangganId),
    getTransactions(),
  ]);

  if (!pelanggan) {
    notFound();
  }

  // Cocokkan transaksi dengan pelanggan ini:
  // 1. Melalui customerId (foreign key langsung)
  // 2. Fallback melalui nomor telepon
  // 3. Fallback melalui nama pemesan
  const cleanPhone = pelanggan.noTelepon ? pelanggan.noTelepon.replace(/[^0-9]/g, "") : "";
  const lowerName = pelanggan.nama ? pelanggan.nama.trim().toLowerCase() : "";

  const customerTransactions = allTransactions.filter((tx) => {
    if (tx.customerId === pelanggan.id) return true;
    if (cleanPhone && tx.recipientPhone) {
      const txCleanPhone = tx.recipientPhone.replace(/[^0-9]/g, "");
      if (txCleanPhone === cleanPhone) return true;
    }
    if (lowerName && tx.customerNameSnapshot) {
      if (tx.customerNameSnapshot.trim().toLowerCase() === lowerName) return true;
    }
    return false;
  });

  return (
    <AdminShell>
      <DetailPelangganClient
        pelanggan={pelanggan}
        transactions={customerTransactions}
      />
    </AdminShell>
  );
}
