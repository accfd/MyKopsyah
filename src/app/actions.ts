"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { loginAdmin, logoutAdmin, isAuthenticated } from "@/lib/auth";
import {
  createTransaction,
  CreateTransactionInput,
  updateTransactionStatus,
  updateTransactionDetails,
  UpdateTransactionDetailsInput,
  deleteTransaction,
  addStockEntry,
  addBatchStockEntries,
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

export async function updateTransactionAction(
  transactionId: number,
  input: UpdateTransactionDetailsInput
) {
  const auth = await isAuthenticated();
  if (!auth) return { success: false, error: "Unauthorized" };

  const result = await updateTransactionDetails(transactionId, input);
  if (result.success) {
    revalidatePath(`/transaksi/${transactionId}`);
    revalidatePath("/transaksi");
    revalidatePath("/dashboard");
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

export async function submitBatchStockEntryAction(
  items: { variantId: number; quantityAdded: number }[],
  notes?: string
) {
  const auth = await isAuthenticated();
  if (!auth) return { success: false, error: "Unauthorized" };

  const validItems = items.filter((it) => it.quantityAdded > 0);
  if (validItems.length === 0) {
    return { success: false, error: "Tidak ada jumlah barang masuk yang diisi." };
  }

  const result = await addBatchStockEntries(validItems, notes);
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

export async function createProductAction(input: any) {
  const auth = await isAuthenticated();
  if (!auth) return { success: false, error: "Unauthorized" };

  const { createProduct } = await import("@/lib/data-service");
  const result = await createProduct(input);
  if (result.success) {
    revalidatePath("/produk");
    revalidatePath("/transaksi/baru");
    revalidatePath("/stok");
    revalidatePath("/dashboard");
  }
  return result;
}

export async function submitStockAdjustmentAction(items: any[], notes?: string) {
  const auth = await isAuthenticated();
  if (!auth) return { success: false, error: "Unauthorized" };

  const { processStockAdjustment } = await import("@/lib/data-service");
  const result = await processStockAdjustment(items, notes);
  if (result.success) {
    revalidatePath("/produk");
    revalidatePath("/stok");
    revalidatePath("/dashboard");
    revalidatePath("/transaksi/baru");
  }
  return result;
}

export async function updateProductAction(productId: number, input: any) {
  const auth = await isAuthenticated();
  if (!auth) return { success: false, error: "Unauthorized" };

  const { updateProduct } = await import("@/lib/data-service");
  const result = await updateProduct(productId, input);
  if (result.success) {
    revalidatePath("/produk");
    revalidatePath("/transaksi/baru");
    revalidatePath("/dashboard");
    revalidatePath(`/produk/edit/${productId}`);
  }
  return result;
}

export async function createPelangganAction(input: any) {
  const auth = await isAuthenticated();
  if (!auth) return { success: false, error: "Unauthorized" };

  const { createPelanggan } = await import("@/lib/data-service");
  const result = await createPelanggan(input);
  if (result.success) {
    revalidatePath("/pelanggan");
    revalidatePath("/transaksi/baru");
  }
  return result;
}

export async function updatePelangganAction(id: number, input: any) {
  const auth = await isAuthenticated();
  if (!auth) return { success: false, error: "Unauthorized" };

  const { updatePelanggan } = await import("@/lib/data-service");
  const result = await updatePelanggan(id, input);
  if (result.success) {
    revalidatePath("/pelanggan");
    revalidatePath("/transaksi/baru");
  }
  return result;
}

export async function deletePelangganAction(id: number) {
  const auth = await isAuthenticated();
  if (!auth) return { success: false, error: "Unauthorized" };

  const { deletePelanggan } = await import("@/lib/data-service");
  const result = await deletePelanggan(id);
  if (result.success) {
    revalidatePath("/pelanggan");
    revalidatePath("/transaksi/baru");
  }
  return result;
}

