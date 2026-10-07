import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import AdminShell from "@/components/AdminShell";
import TambahProdukClient from "./TambahProdukClient";

export const dynamic = "force-dynamic";

export default async function TambahProdukPage() {
  const auth = await isAuthenticated();
  if (!auth) {
    redirect("/login");
  }

  return (
    <AdminShell>
      <TambahProdukClient />
    </AdminShell>
  );
}
