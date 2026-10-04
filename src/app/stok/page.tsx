import { getProductsWithVariants } from "@/lib/data-service";
import PublicStokClient from "./PublicStokClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Cek Stok Perlengkapan Santri - MyKopsyah",
  description: "Informasi ketersediaan stok perlengkapan santri dan guru Koperasi Syariah secara real-time.",
};

export default async function PublicStokPage() {
  const products = await getProductsWithVariants();
  return <PublicStokClient products={products} />;
}
