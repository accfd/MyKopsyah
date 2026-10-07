import { notFound, redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { getStockBatchById } from "@/lib/data-service";
import AdminShell from "@/components/AdminShell";
import DetailBuktiTerimaClient from "./DetailBuktiTerimaClient";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ batchId: string }>;
}

export default async function BuktiTerimaDetailPage({ params }: PageProps) {
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
      <DetailBuktiTerimaClient batch={batch} />
    </AdminShell>
  );
}
