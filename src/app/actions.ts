"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { loginAdmin, logoutAdmin, isAuthenticated } from "@/lib/auth";
import {
  createTransaction,
  CreateTransactionInput,
  updateTransactionStatus,
  deleteTransaction,
  addStockEntry,
  updateVariantPrice,
} from "@/lib/data-service";

export async function loginAction(prevState: any, formData: FormData) {
  const pin = formData.get("pin") as string;
  const res = await loginAdmin(pin);

  if (!res.success) {
    return { error: res.error || "Gagal masuk" };
  }

  redirect("/dashboard");
}

export async function logoutAction() {
  await logoutAdmin();
  redirect("/login");
}

export async function submitTransactionAction(input: CreateTransactionInput) {
  const auth = await isAuthenticated();
  if (!auth) {
    return { success: false, error: "Sesi admin telah berakhir, silakan login kembali." };
  }

  const result = await createTransaction(input);

  if (result.success) {
    revalidatePath("/dashboard");
    revalidatePath("/transaksi");
    revalidatePath("/produk");
    revalidatePath("/stok");
    revalidatePath("/laporan/wilayah");
  }

  return result;
}

export async function togglePaymentStatusAction(
  transactionId: number,
  newStatus: "Belum Lunas" | "Lunas"
) {
  const auth = await isAuthenticated();
  if (!auth) throw new Error("Unauthorized");

  await updateTransactionStatus(transactionId, { paymentStatus: newStatus });
  revalidatePath(`/transaksi/${transactionId}`);
  revalidatePath("/transaksi");
  revalidatePath("/dashboard");
  revalidatePath("/laporan/wilayah");
}

export async function toggleShippingStatusAction(
  transactionId: number,
  newStatus: "Belum Dikirim" | "Sudah Dikirim"
) {
  const auth = await isAuthenticated();
  if (!auth) throw new Error("Unauthorized");

  await updateTransactionStatus(transactionId, { shippingStatus: newStatus });
  revalidatePath(`/transaksi/${transactionId}`);
  revalidatePath("/transaksi");
  revalidatePath("/dashboard");
}

export async function removeTransactionAction(transactionId: number) {
  const auth = await isAuthenticated();
  if (!auth) return { success: false, error: "Unauthorized" };

  const result = await deleteTransaction(transactionId);
  if (result.success) {
    revalidatePath("/dashboard");
    revalidatePath("/transaksi");
    revalidatePath("/produk");
    revalidatePath("/stok");
    revalidatePath("/laporan/wilayah");
  }
  return result;
}

export async function submitStockEntryAction(
  variantId: number,
  quantity: number,
  notes?: string
) {
  const auth = await isAuthenticated();
  if (!auth) return { success: false, error: "Unauthorized" };

  const result = await addStockEntry(variantId, quantity, notes);
  if (result.success) {
    revalidatePath("/produk");
    revalidatePath("/stok");
    revalidatePath("/dashboard");
  }
  return result;
}

export async function submitUpdatePriceAction(variantId: number, price: number) {
  const auth = await isAuthenticated();
  if (!auth) return { success: false, error: "Unauthorized" };

  const success = await updateVariantPrice(variantId, price);
  if (success) {
    revalidatePath("/produk");
    revalidatePath("/stok");
  }
  return { success };
}
