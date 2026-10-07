import { notFound, redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { getProductById } from "@/lib/data-service";
import AdminShell from "@/components/AdminShell";
import EditProdukClient from "../EditProdukClient";

export const dynamic = "force-dynamic";

export default async function EditProdukPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const auth = await isAuthenticated();
  if (!auth) {
    redirect("/login");
  }

  const { id } = await params;
  const numId = Number(id);
  if (isNaN(numId)) {
    notFound();
  }

  const product = await getProductById(numId);
  if (!product) {
    notFound();
  }

  return (
    <AdminShell>
      <EditProdukClient product={product} />
    </AdminShell>
  );
}
