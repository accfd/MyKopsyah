import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { getPelanggan } from "@/lib/data-service";
import AdminShell from "@/components/AdminShell";
import PelangganClient from "./PelangganClient";

export const dynamic = "force-dynamic";

export default async function PelangganPage() {
  const auth = await isAuthenticated();
  if (!auth) {
    redirect("/login");
  }

  const pelanggan = await getPelanggan();

  return (
    <AdminShell>
      <PelangganClient initialPelanggan={pelanggan} />
    </AdminShell>
  );
}
