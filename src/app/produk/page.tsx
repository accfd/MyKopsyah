import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { getProductsWithVariants, getStockEntries } from "@/lib/data-service";
import AdminShell from "@/components/AdminShell";
import ProdukManagementClient from "./ProdukManagementClient";

export const dynamic = "force-dynamic";

export default async function ProdukPage() {
  const auth = await isAuthenticated();
  if (!auth) {
    redirect("/login");
  }

  const [products, stockEntries] = await Promise.all([
    getProductsWithVariants(),
    getStockEntries(15),
  ]);

  return (
    <AdminShell>
      <ProdukManagementClient products={products} recentStockEntries={stockEntries} />
    </AdminShell>
  );
}
