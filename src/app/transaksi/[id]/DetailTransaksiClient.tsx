"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { TransactionData, ProductData } from "@/lib/data-service";
import { formatRupiah, formatTanggal, generateWhatsAppReceipt } from "@/lib/format";
import {
  removeTransactionAction,
  updateTransactionAction,
} from "@/app/actions";
import {
  Printer,
  Share2,
  Check,
  Trash2,
  ArrowLeft,
  AlertTriangle,
  Loader2,
  Lock,
  Pencil,
  X,
  Plus,
  Minus,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";
import ReportHeader from "@/components/ReportHeader";
import CityCombobox from "@/components/CityCombobox";

function terbilangRupiah(n: number): string {
  if (n === 0) return "Nol Rupiah";
  const satuan = [
    "",
    "Satu",
    "Dua",
    "Tiga",
    "Empat",
    "Lima",
    "Enam",
    "Tujuh",
    "Delapan",
    "Sembilan",
    "Sepuluh",
    "Sebelas",
  ];

  function spell(x: number): string {
    if (x < 12) return satuan[x];
    if (x < 20) return spell(x - 10) + " Belas";
    if (x < 100) return spell(Math.floor(x / 10)) + " Puluh " + spell(x % 10);
    if (x < 200) return "Seratus " + spell(x - 100);
    if (x < 1000) return spell(Math.floor(x / 100)) + " Ratus " + spell(x % 100);
    if (x < 2000) return "Seribu " + spell(x - 1000);
    if (x < 1000000) return spell(Math.floor(x / 1000)) + " Ribu " + spell(x % 1000);
    if (x < 1000000000) return spell(Math.floor(x / 1000000)) + " Juta " + spell(x % 1000000);
    return spell(Math.floor(x / 1000000000)) + " Miliar " + spell(x % 1000000000);
  }

  return spell(n).replace(/\s+/g, " ").trim() + " Rupiah";
}

function parseItemName(full: string): { productName: string; variantName: string } {
  const dashIndex = full.lastIndexOf(" - ");
  if (dashIndex !== -1) {
    const productName = full.substring(0, dashIndex).trim();
    const variantName = full.substring(dashIndex + 3).trim();
    return { productName, variantName };
  }
  return { productName: full, variantName: "-" };
}

interface EditItemRow {
  key: string;
  productId: number;
  variantId: number;
  itemName: string;
  unitPrice: number;
  quantity: number;
}

export default function DetailTransaksiClient({
  tx,
  products = [],
}: {
  tx: TransactionData;
  products?: ProductData[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [copiedWA, setCopiedWA] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editRecipientName, setEditRecipientName] = useState(tx.recipientName || tx.customerNameSnapshot);
  const [editRecipientPhone, setEditRecipientPhone] = useState(tx.recipientPhone || "");
  const [editCity, setEditCity] = useState(tx.citySnapshot || "");
  const [editFullAddress, setEditFullAddress] = useState(tx.fullAddressSnapshot || "");
  const [editPaymentStatus, setEditPaymentStatus] = useState<"Belum Lunas" | "Lunas">(tx.paymentStatus);
  const [editShippingStatus, setEditShippingStatus] = useState<"Belum Dikirim" | "Sudah Dikirim">(tx.shippingStatus);
  const [editNotes, setEditNotes] = useState(tx.notes || "");

  // State untuk item barang pesanan yang dapat diedit
  const [editItems, setEditItems] = useState<EditItemRow[]>(() =>
    tx.items.map((it, idx) => ({
      key: `item-${it.id || idx}`,
      productId: it.productId,
      variantId: it.variantId,
      itemName: it.itemNameSnapshot,
      unitPrice: it.unitPrice,
      quantity: it.quantity,
    }))
  );

  const [isAddingItem, setIsAddingItem] = useState(false);
  const [addSelectedProductId, setAddSelectedProductId] = useState<number | "">("");
  const [addSelectedVariantId, setAddSelectedVariantId] = useState<number | "">("");
  const [addQty, setAddQty] = useState(1);

  const handleOpenEditModal = () => {
    setEditRecipientName(tx.recipientName || tx.customerNameSnapshot);
    setEditRecipientPhone(tx.recipientPhone || "");
    setEditCity(tx.citySnapshot || "");
    setEditFullAddress(tx.fullAddressSnapshot || "");
    setEditPaymentStatus(tx.paymentStatus);
    setEditShippingStatus(tx.shippingStatus);
    setEditNotes(tx.notes || "");
    setEditItems(
      tx.items.map((it, idx) => ({
        key: `item-${it.id || idx}`,
        productId: it.productId,
        variantId: it.variantId,
        itemName: it.itemNameSnapshot,
        unitPrice: it.unitPrice,
        quantity: it.quantity,
      }))
    );
    setIsAddingItem(false);
    setAddSelectedProductId("");
    setAddSelectedVariantId("");
    setAddQty(1);
    setShowEditModal(true);
  };

  const handleUpdateItemQty = (index: number, newQty: number) => {
    if (newQty < 1) return;
    setEditItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, quantity: newQty } : it))
    );
  };

  const handleUpdateItemPrice = (index: number, newPrice: number) => {
    if (newPrice < 0) return;
    setEditItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, unitPrice: newPrice } : it))
    );
  };

  const handleRemoveItem = (index: number) => {
    if (editItems.length <= 1) {
      alert("Pesanan harus memiliki minimal 1 item barang.");
      return;
    }
    setEditItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddItemToOrder = () => {
    if (!addSelectedProductId || !addSelectedVariantId) {
      alert("Silakan pilih produk dan varian barang.");
      return;
    }
    const p = products.find((prod) => prod.id === Number(addSelectedProductId));
    const v = p?.variants.find((vr) => vr.id === Number(addSelectedVariantId));
    if (!p || !v) return;

    const itemName = `${p.name} - ${v.variantName}`;
    setEditItems((prev) => [
      ...prev,
      {
        key: `new-${Date.now()}-${Math.random()}`,
        productId: p.id,
        variantId: v.id,
        itemName,
        unitPrice: v.price,
        quantity: Math.max(1, addQty),
      },
    ]);
    setAddSelectedProductId("");
    setAddSelectedVariantId("");
    setAddQty(1);
    setIsAddingItem(false);
  };

  const totalEditAmount = editItems.reduce(
    (sum, it) => sum + it.unitPrice * it.quantity,
    0
  );

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editRecipientName.trim()) {
      alert("Nama penerima tidak boleh kosong");
      return;
    }
    if (!editCity.trim()) {
      alert("Kabupaten/Kota tujuan tidak boleh kosong");
      return;
    }
    if (editItems.length === 0) {
      alert("Pesanan harus memiliki minimal 1 item barang.");
      return;
    }

    startTransition(async () => {
      const res = await updateTransactionAction(tx.id, {
        recipientName: editRecipientName.trim(),
        recipientPhone: editRecipientPhone.trim(),
        city: editCity.trim(),
        fullAddress: editFullAddress.trim(),
        paymentStatus: editPaymentStatus,
        shippingStatus: editShippingStatus,
        notes: editNotes.trim(),
        items: editItems.map((it) => ({
          productId: it.productId,
          variantId: it.variantId,
          itemName: it.itemName,
          unitPrice: it.unitPrice,
          quantity: it.quantity,
        })),
      });
      if (res.success) {
        setShowEditModal(false);
        router.refresh();
      } else {
        alert(res.error || "Gagal memperbarui nota transaksi");
      }
    });
  };

  const handleCopyWA = () => {
    const text = generateWhatsAppReceipt(tx);
    navigator.clipboard.writeText(text);
    setCopiedWA(true);
    setTimeout(() => setCopiedWA(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleConfirmDelete = () => {
    startTransition(async () => {
      const res = await removeTransactionAction(tx.id);
      if (res.success) {
        setShowDeleteModal(false);
        router.push("/transaksi");
      } else {
        alert(res.error || "Gagal menghapus nota");
      }
    });
  };

  const totalItemQty = tx.items.reduce((sum, it) => sum + it.quantity, 0);

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto pb-16">
      {/* ─── Tombol Aksi Web (1 Baris Penuh di HP & PC, Sembunyi saat cetak) ─── */}
      <div className="flex items-center justify-between gap-2 no-print">
        <Link
          href="/transaksi"
          className="inline-flex items-center gap-1.5 px-2.5 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Daftar Transaksi</span>
          <span className="sm:hidden">Kembali</span>
        </Link>

        {/* 3 Tombol Aksi: Rapi dalam 1 baris */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Tombol Salin WA */}
          <button
            type="button"
            onClick={handleCopyWA}
            className="flex items-center gap-1.5 p-2 sm:px-3.5 sm:py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
            title="Salin Rincian ke WhatsApp"
          >
            {copiedWA ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{copiedWA ? "Disalin!" : "Salin WA"}</span>
          </button>

          {/* Tombol Cetak Nota */}
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 p-2 sm:px-3.5 sm:py-2 bg-slate-900 hover:bg-black text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
            title="Cetak Nota Resmi"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Cetak Nota</span>
          </button>

          {/* Tombol Edit Nota */}
          <button
            type="button"
            onClick={handleOpenEditModal}
            className="flex items-center gap-1.5 p-2 sm:px-3.5 sm:py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
            title="Edit Data Pemesan & Rincian Pesanan"
          >
            <Pencil className="w-4 h-4" />
            <span className="hidden sm:inline">Edit Nota</span>
          </button>

          {/* Tombol Hapus / Kunci */}
          {tx.paymentStatus === "Lunas" && tx.shippingStatus === "Sudah Dikirim" ? (
            <div
              className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 bg-slate-100 text-slate-500 border border-slate-200 text-xs sm:text-sm font-bold rounded-xl cursor-not-allowed select-none"
              title="Transaksi telah Lunas dan Selesai Dikirim (Terkunci demi integritas arsip)"
            >
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Terkunci</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              disabled={isPending}
              className="flex items-center gap-1.5 p-2 sm:px-3.5 sm:py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer active:scale-95"
              title="Hapus Transaksi dan Kembalikan Stok"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Hapus</span>
            </button>
          )}
        </div>
      </div>

      {/* ─── KERTAS NOTA CETAK RESMI (RESPONSIF PENUH DI HP & PC) ─── */}
      <div className="receipt-container bg-white p-3.5 sm:p-10 rounded-2xl border border-slate-300 print:border-0 shadow-lg print:shadow-none text-black print:p-0">
        {/* Header Kop Surat Kopsyah FKDT Sumbar Terpadu */}
        <ReportHeader
          title="NOTA PENJUALAN"
          documentNumber={`No. Nota: ${tx.invoiceNumber}`}
        />

        {/* Informasi Nota & Pelanggan */}
        <div className="grid grid-cols-2 gap-4 text-xs mb-5 pb-3 border-b border-black/20">
          {/* Kolom Kiri: Info Transaksi */}
          <div className="space-y-1.5">
            <div className="flex">
              <span className="w-24 text-slate-700 print:text-black font-semibold">Tanggal</span>
              <span className="font-bold">: {formatTanggal(tx.createdAt)}</span>
            </div>
            <div className="flex items-center">
              <span className="w-24 text-slate-700 print:text-black font-semibold">Status Bayar</span>
              <span>
                :{" "}
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                    tx.paymentStatus === "Lunas"
                      ? "bg-emerald-100 text-emerald-900 print:border print:border-black"
                      : "bg-amber-100 text-amber-900 print:border print:border-black"
                  }`}
                >
                  {tx.paymentStatus}
                </span>
              </span>
            </div>
            <div className="flex items-center">
              <span className="w-24 text-slate-700 print:text-black font-semibold">Status Kirim</span>
              <span>
                :{" "}
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    tx.shippingStatus === "Sudah Dikirim"
                      ? "bg-sky-100 text-sky-900 print:border print:border-black"
                      : "bg-slate-100 text-slate-800 print:border print:border-black"
                  }`}
                >
                  {tx.shippingStatus}
                </span>
              </span>
            </div>
          </div>

          {/* Kolom Kanan: Info Pembeli & Penerima */}
          <div className="space-y-1.5 text-left">
            <div className="flex">
              <span className="w-24 text-slate-700 print:text-black font-semibold">Penerima</span>
              <span className="font-bold">: {tx.recipientName || tx.customerNameSnapshot}</span>
            </div>
            <div className="flex">
              <span className="w-24 text-slate-700 print:text-black font-semibold">No. HP</span>
              <span>: {tx.recipientPhone && tx.recipientPhone !== "-" ? tx.recipientPhone : "-"}</span>
            </div>
            <div className="flex">
              <span className="w-24 text-slate-700 print:text-black font-semibold">Tujuan</span>
              <span className="font-bold">: {tx.citySnapshot}</span>
            </div>
            {tx.fullAddressSnapshot && (
              <div className="flex">
                <span className="w-24 text-slate-700 print:text-black font-semibold">Alamat</span>
                <span>: {tx.fullAddressSnapshot}</span>
              </div>
            )}
          </div>
        </div>

        {/* ─── TABEL RESMI NOTA: DIPISAH MENJADI 2 KOLOM (Nama Barang & Varian) ─── */}
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-xs border-collapse border border-black">
            <thead>
              <tr className="bg-slate-200 print:bg-slate-200 text-black font-extrabold uppercase border-b border-black">
                <th className="py-2.5 px-2 text-center border border-black w-10">NO</th>
                <th className="py-2.5 px-3 text-left border border-black">Nama Barang</th>
                <th className="py-2.5 px-3 text-center border border-black w-36">Varian / Ukuran / Kelas</th>
                <th className="py-2.5 px-2 text-center border border-black w-24">Banyaknya (Qty)</th>
                <th className="py-2.5 px-3 text-right border border-black w-28">Harga Satuan</th>
                <th className="py-2.5 px-3 text-right border border-black w-32">Jumlah (Rp)</th>
              </tr>
            </thead>
            <tbody>
              {tx.items.map((item, idx) => {
                const { productName, variantName } = parseItemName(item.itemNameSnapshot);
                return (
                  <tr key={item.id} className="border-b border-black/30">
                    <td className="py-2 px-2 text-center border border-black/40 font-bold">{idx + 1}</td>
                    <td className="py-2 px-3 border border-black/40 font-bold text-slate-900 print:text-black">
                      {productName}
                    </td>
                    <td className="py-2 px-3 text-center border border-black/40 font-semibold text-slate-800 print:text-black">
                      {variantName}
                    </td>
                    <td className="py-2 px-2 text-center border border-black/40 font-bold">
                      {item.quantity}
                    </td>
                    <td className="py-2 px-3 text-right border border-black/40">
                      {formatRupiah(item.unitPrice)}
                    </td>
                    <td className="py-2 px-3 text-right border border-black/40 font-extrabold">
                      {formatRupiah(item.subtotal)}
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* Footer Total & Terbilang */}
            <tbody className="border-t-2 border-black font-bold">
              <tr className="bg-slate-100 print:bg-slate-100">
                <td colSpan={5} className="py-2.5 px-3 text-right font-black uppercase border border-black">
                  TOTAL PEMBAYARAN :
                </td>
                <td className="py-2.5 px-3 text-right font-black text-sm border border-black">
                  {formatRupiah(tx.totalAmount)}
                </td>
              </tr>
              <tr>
                <td colSpan={6} className="py-2 px-3 text-left italic border border-black bg-slate-50 print:bg-white text-[11px]">
                  <strong>Terbilang:</strong> {terbilangRupiah(tx.totalAmount)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Catatan Transaksi (Jika ada) */}
        {tx.notes && (
          <div className="mb-6 p-2.5 bg-slate-50 print:bg-white border border-dashed border-slate-300 print:border-black/30 rounded-lg text-xs">
            <span className="font-bold">Catatan:</span> {tx.notes}
          </div>
        )}

        {/* ─── TANDA TANGAN KIRI & KANAN (DIKOSONGKAN) ─── */}
        <div className="mt-8 pt-4 break-inside-avoid text-xs">
          <div className="flex justify-between items-start text-center px-6">
            {/* Tanda Tangan Kiri: Penerima / Pemesan */}
            <div className="w-48">
              <p className="font-bold">Penerima / Pemesan,</p>
              <div className="h-20" />
              <p className="font-bold underline uppercase">( ........................................ )</p>
            </div>

            {/* Tanda Tangan Kanan: Hormat Kami / Pengurus Koperasi */}
            <div className="w-56">
              <p className="font-medium">
                Padang, {new Date(tx.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
              </p>
              <p className="font-bold mt-0.5">Hormat Kami,</p>
              <p className="text-[11px] text-slate-700 print:text-black">Pengurus KOPSYAH FKDT</p>
              <div className="h-16" />
              <p className="font-bold underline uppercase">( ........................................ )</p>
            </div>
          </div>
        </div>

        {/* Footer teks halus */}
        <div className="mt-8 pt-3 border-t border-dotted border-slate-300 print:border-black/30 text-[10px] text-center text-slate-500 print:text-black">
          Bukti pembayaran / nota ini sah diterbitkan oleh Koperasi Syariah Forum Komunikasi Diniyah Takmiliyah (KOPSYAH FKDT) Prov. Sumatera Barat.
        </div>
      </div>

      {/* ─── MODAL VERIFIKASI HAPUS NOTA (ANTI SALAH PENCET) ─── */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-11 h-11 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  Batalkan & Hapus Nota?
                </h3>
                <p className="text-xs text-slate-500">
                  Periksa rincian sebelum menghapus transaksi ini
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">No. Nota:</span>
                <span className="font-mono font-bold text-slate-900">{tx.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Penerima:</span>
                <span className="font-bold text-slate-800">
                  {tx.recipientName || tx.customerNameSnapshot}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Belanja:</span>
                <span className="font-black text-emerald-800">{formatRupiah(tx.totalAmount)}</span>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed">
              ⚠️ <strong>Perhatian:</strong> Seluruh stok barang dalam nota ini (
              <strong>{totalItemQty} unit</strong>) akan <strong>OTOMATIS DIKEMBALIKAN</strong> ke gudang
              Koperasi. Tindakan ini tidak dapat dibatalkan.
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isPending}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs sm:text-sm hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isPending}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <span>Ya, Hapus & Rollback</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ─── MODAL EDIT NOTA & RINCIAN PESANAN LENGKAP ─── */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs no-print">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            {/* Header Modal Sticky */}
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    Edit Nota & Rincian Pesanan
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    {tx.invoiceNumber}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form & Konten Scrollable */}
            <form onSubmit={handleSaveEdit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs">
              {/* BAGIAN 1: DATA PEMESAN & TUJUAN */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-1.5 border-b border-slate-200 text-slate-800 font-extrabold text-sm">
                  <span>1. Data Pemesan & Status Nota</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Nama Penerima / Pemesan <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editRecipientName}
                      onChange={(e) => setEditRecipientName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 text-xs sm:text-sm font-semibold"
                      placeholder="Nama pemesan atau instansi..."
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Nomor WhatsApp / HP
                    </label>
                    <input
                      type="text"
                      value={editRecipientPhone}
                      onChange={(e) => setEditRecipientPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 text-xs sm:text-sm font-semibold font-mono"
                      placeholder="08123456789..."
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Kabupaten / Kota Tujuan <span className="text-rose-600">*</span>
                    </label>
                    <CityCombobox
                      value={editCity}
                      onChange={(c) => setEditCity(c)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Alamat Lengkap Pengiriman
                    </label>
                    <input
                      type="text"
                      value={editFullAddress}
                      onChange={(e) => setEditFullAddress(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 text-xs font-medium"
                      placeholder="Jalan, No, Kelurahan, Kecamatan..."
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Status Pembayaran
                    </label>
                    <select
                      value={editPaymentStatus}
                      onChange={(e) => setEditPaymentStatus(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 text-xs font-bold"
                    >
                      <option value="Belum Lunas">Belum Lunas</option>
                      <option value="Lunas">Lunas</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Status Pengiriman
                    </label>
                    <select
                      value={editShippingStatus}
                      onChange={(e) => setEditShippingStatus(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 text-xs font-bold"
                    >
                      <option value="Belum Dikirim">Belum Dikirim</option>
                      <option value="Sudah Dikirim">Sudah Dikirim</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">
                      Catatan Transaksi
                    </label>
                    <input
                      type="text"
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 text-xs font-medium"
                      placeholder="Catatan tambahan..."
                    />
                  </div>
                </div>
              </div>

              {/* BAGIAN 2: RINCIAN BARANG & PESANAN */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                  <div className="flex items-center gap-2 text-slate-800 font-extrabold text-sm">
                    <ShoppingBag className="w-4 h-4 text-emerald-700" />
                    <span>2. Rincian Barang Pesanan</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      {editItems.length} Item
                    </span>
                  </div>

                  {!isAddingItem && products.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsAddingItem(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Barang</span>
                    </button>
                  )}
                </div>

                {/* Form Tambah Barang Baru ke Pesanan */}
                {isAddingItem && (
                  <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-emerald-900">
                        Tambah Barang Baru ke Nota
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsAddingItem(false)}
                        className="text-slate-400 hover:text-slate-600 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {/* Pilih Produk */}
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Pilih Produk
                        </label>
                        <select
                          value={addSelectedProductId}
                          onChange={(e) => {
                            const pId = e.target.value ? Number(e.target.value) : "";
                            setAddSelectedProductId(pId);
                            setAddSelectedVariantId("");
                          }}
                          className="w-full px-2.5 py-2 border border-slate-300 rounded-xl bg-white text-xs font-semibold"
                        >
                          <option value="">-- Pilih Produk --</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.category})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Pilih Varian */}
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Pilih Varian & Ukuran
                        </label>
                        <select
                          disabled={!addSelectedProductId}
                          value={addSelectedVariantId}
                          onChange={(e) => setAddSelectedVariantId(e.target.value ? Number(e.target.value) : "")}
                          className="w-full px-2.5 py-2 border border-slate-300 rounded-xl bg-white text-xs font-semibold disabled:bg-slate-100"
                        >
                          <option value="">-- Pilih Varian --</option>
                          {addSelectedProductId &&
                            products
                              .find((p) => p.id === Number(addSelectedProductId))
                              ?.variants.map((v) => (
                                <option key={v.id} value={v.id}>
                                  {v.variantName} (Stok: {v.stockQuantity} | {formatRupiah(v.price)})
                                </option>
                              ))}
                        </select>
                      </div>

                      {/* Jumlah Qty */}
                      <div className="flex items-end gap-2">
                        <div className="flex-1">
                          <label className="block font-bold text-slate-700 mb-1">
                            Jumlah (Qty)
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={addQty}
                            onChange={(e) => setAddQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                            className="w-full px-2.5 py-2 border border-slate-300 rounded-xl bg-white text-xs font-bold text-center"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleAddItemToOrder}
                          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs h-[38px] shadow-xs active:scale-95 cursor-pointer"
                        >
                          + Tambah
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tabel Item Pesanan */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead className="bg-slate-100 text-slate-800 font-extrabold uppercase border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-2 text-center w-8">#</th>
                        <th className="py-2 px-3">Nama Barang & Varian</th>
                        <th className="py-2 px-2 text-center w-32">Kuantitas (Qty)</th>
                        <th className="py-2 px-3 text-right w-32">Harga Satuan (Rp)</th>
                        <th className="py-2 px-3 text-right w-28">Subtotal</th>
                        <th className="py-2 px-2 text-center w-10">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {editItems.map((item, idx) => (
                        <tr key={item.key} className="hover:bg-slate-50/60">
                          <td className="py-2 px-2 text-center font-bold text-slate-500">
                            {idx + 1}
                          </td>
                          <td className="py-2 px-3 font-bold text-slate-900">
                            {item.itemName}
                          </td>
                          <td className="py-2 px-2 text-center">
                            <div className="inline-flex items-center gap-1 border border-slate-300 rounded-xl px-1 py-0.5 bg-white">
                              <button
                                type="button"
                                onClick={() => handleUpdateItemQty(idx, item.quantity - 1)}
                                className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-600 font-bold active:scale-90"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => handleUpdateItemQty(idx, parseInt(e.target.value, 10) || 1)}
                                className="w-12 text-center font-extrabold text-xs bg-transparent focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => handleUpdateItemQty(idx, item.quantity + 1)}
                                className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-600 font-bold active:scale-90"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                          <td className="py-2 px-3 text-right">
                            <input
                              type="number"
                              min="0"
                              step="500"
                              value={item.unitPrice}
                              onChange={(e) => handleUpdateItemPrice(idx, parseInt(e.target.value, 10) || 0)}
                              className="w-24 text-right px-2 py-1 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-amber-500"
                            />
                          </td>
                          <td className="py-2 px-3 text-right font-extrabold text-emerald-800">
                            {formatRupiah(item.unitPrice * item.quantity)}
                          </td>
                          <td className="py-2 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Hapus barang ini dari nota"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-emerald-50/80 border-t-2 border-emerald-200 font-extrabold text-slate-900">
                      <tr>
                        <td colSpan={4} className="py-2.5 px-3 text-right uppercase">
                          TOTAL TAGIHAN NOTA BARU:
                        </td>
                        <td className="py-2.5 px-3 text-right font-black text-emerald-900 text-sm">
                          {formatRupiah(totalEditAmount)}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600">
                  ℹ️ <strong>Penyesuaian Otomatis:</strong> Setiap perubahan jumlah atau barang pada pesanan ini akan secara otomatis memperbarui catatan stok gudang dan nilai total transaksi di pembukuan Koperasi.
                </div>
              </div>

              {/* Tombol Aksi Bawah */}
              <div className="flex items-center gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  disabled={isPending}
                  className="flex-1 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs sm:text-sm hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Menyimpan Seluruh Perubahan...</span>
                    </>
                  ) : (
                    <span>Simpan Seluruh Perubahan Nota</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
