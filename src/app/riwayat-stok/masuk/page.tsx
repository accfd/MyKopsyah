import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { getProductsWithVariants } from "@/lib/data-service";
import AdminShell from "@/components/AdminShell";
import StokMasukClient from "./StokMasukClient";

export const dynamic = "force-dynamic";

export default async function StokMasukPage() {
  const auth = await isAuthenticated();
  if (!auth) {
    redirect("/login");
  }

  const products = await getProductsWithVariants();

  return (
    <AdminShell>
      <StokMasukClient products={products} />
    </AdminShell>
  );
}
