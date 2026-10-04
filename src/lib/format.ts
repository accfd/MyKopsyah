import { TransactionData } from "./data-service";

export function formatRupiah(amount: number): string {
  return "Rp " + new Intl.NumberFormat("id-ID").format(amount);
}

export function formatTanggal(dateString: string): string {
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return dateString;
  }
}

export function generateWhatsAppReceipt(tx: TransactionData): string {
  const dateFormatted = formatTanggal(tx.createdAt);
  const itemsText = tx.items
    .map(
      (item, idx) =>
        `${idx + 1}. ${item.itemNameSnapshot}\n   ${item.quantity} x ${formatRupiah(item.unitPrice)} = ${formatRupiah(item.subtotal)}`
    )
    .join("\n");

  const statusBayar = tx.paymentStatus === "Lunas" ? "✅ LUNAS" : "⏳ BELUM LUNAS";
  const statusKirim = tx.shippingStatus === "Sudah Dikirim" ? "📦 SUDAH DIKIRIM" : "🚚 BELUM DIKIRIM";

  return `*KOPERASI SYARIAH (MYKOPSYAH)*
*RINCIAN NOTA PESANAN*
---------------------------------------
*No. Nota:* ${tx.invoiceNumber}
*Tanggal:* ${dateFormatted}

*Pemesan:* ${tx.customerNameSnapshot}
*Penerima:* ${tx.recipientName} (${tx.recipientPhone})
*Tujuan:* ${tx.citySnapshot}
${tx.fullAddressSnapshot ? `*Alamat:* ${tx.fullAddressSnapshot}\n` : ""}---------------------------------------
*Rincian Barang:*
${itemsText}
---------------------------------------
*TOTAL BELANJA:* ${formatRupiah(tx.totalAmount)}

*Status Pembayaran:* ${statusBayar}
*Status Pengiriman:* ${statusKirim}
${tx.notes ? `\n*Catatan:* ${tx.notes}` : ""}
---------------------------------------
_Jazakumullahu khairan atas kepercayaannya berbelanja di Kopsyah._ 🙏`;
}
