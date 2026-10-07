import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import AdminShell from "@/components/AdminShell";
import PengaturanClient from "./PengaturanClient";

export const dynamic = "force-dynamic";

export default async function PengaturanPage() {
  const auth = await isAuthenticated();
  if (!auth) {
    redirect("/login");
  }

  return (
    <AdminShell>
      <PengaturanClient />
    </AdminShell>
  );
}
