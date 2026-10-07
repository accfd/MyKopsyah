import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { getProductById } from "@/lib/data-service";
import AdminShell from "@/components/AdminShell";
import EditProdukClient from "./EditProdukClient";

export const dynamic = "force-dynamic";

export default async function EditProdukQueryPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const auth = await isAuthenticated();
  if (!auth) {
    redirect("/login");
  }

  const { id } = await searchParams;
  if (!id) {
    redirect("/produk");
  }

  const numId = Number(id);
  if (isNaN(numId)) {
    redirect("/produk");
  }

  const product = await getProductById(numId);
  if (!product) {
    redirect("/produk");
  }

  return (
    <AdminShell>
      <EditProdukClient product={product} />
    </AdminShell>
  );
}
