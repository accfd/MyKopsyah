"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ProductData } from "@/lib/data-service";
import { formatRupiah } from "@/lib/format";
import { submitTransactionAction } from "@/app/actions";
import {
  User,
  Phone,
  FileText,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import CityCombobox from "@/components/CityCombobox";

interface CartItem {
  productId: number;
  variantId: number;
  productName: string;
  variantName: string;
  unitPrice: number;
  quantity: number;
  maxStock: number;
  unit: string;
}

export default function KasirForm({ products }: { products: ProductData[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Customer state
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [city, setCity] = useState("");
  const [fullAddress, setFullAddress] = useState("");

  // Transaction settings
  const [paymentStatus, setPaymentStatus] = useState<"Belum Lunas" | "Lunas">("Belum Lunas");
  const [shippingStatus, setShippingStatus] = useState<"Belum Dikirim" | "Sudah Dikirim">(
    "Belum Dikirim"
  );
  const [notes, setNotes] = useState("");

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);

  // Selection inputs
  const [selectedProductId, setSelectedProductId] = useState<number>(products[0]?.id || 0);
  const currentProduct = products.find((p) => p.id === selectedProductId) || products[0];

  const [selectedVariantId, setSelectedVariantId] = useState<number>(
    currentProduct?.variants[0]?.id || 0
  );
  const currentVariant =
    currentProduct?.variants.find((v) => v.id === selectedVariantId) || currentProduct?.variants[0];

  const [quantityInput, setQuantityInput] = useState<number>(1);

  // Handle product change
  const handleProductChange = (prodId: number) => {
    setSelectedProductId(prodId);
    const prod = products.find((p) => p.id === prodId);
    if (prod && prod.variants.length > 0) {
      setSelectedVariantId(prod.variants[0].id);
    }
  };

  // Add item to cart
  const handleAddToCart = () => {
    if (!currentProduct || !currentVariant) return;

    if (quantityInput <= 0) {
      alert("Jumlah pesanan harus minimal 1 pcs");
      return;
    }

    if (quantityInput > currentVariant.stockQuantity) {
      alert(
        `Stok tidak mencukupi! Sisa stok untuk ${currentProduct.name} - ${currentVariant.variantName} adalah ${currentVariant.stockQuantity} ${currentProduct.unit}.`
      );
      return;
    }

    // Check if already in cart
    const existingIndex = cart.findIndex((item) => item.variantId === currentVariant.id);
    if (existingIndex > -1) {
      const existing = cart[existingIndex];
      const newQty = existing.quantity + quantityInput;
      if (newQty > currentVariant.stockQuantity) {
        alert(
          `Total pesanan (${newQty}) melebihi sisa stok di gudang (${currentVariant.stockQuantity}).`
        );
        return;
      }
      const updatedCart = [...cart];
      updatedCart[existingIndex].quantity = newQty;
      setCart(updatedCart);
    } else {
      setCart([
        ...cart,
        {
          productId: currentProduct.id,
          variantId: currentVariant.id,
          productName: currentProduct.name,
          variantName: currentVariant.variantName,
          unitPrice: currentVariant.price,
          quantity: quantityInput,
          maxStock: currentVariant.stockQuantity,
          unit: currentProduct.unit,
        },
      ]);
    }

    // Reset qty input
    setQuantityInput(1);
  };

  const handleRemoveFromCart = (index: number) => {
    const updated = [...cart];
    updated.splice(index, 1);
    setCart(updated);
  };

  const handleUpdateQuantity = (index: number, newQty: number) => {
    if (newQty <= 0) return;
    const item = cart[index];
    if (newQty > item.maxStock) {
      alert(`Stok maksimal yang tersedia adalah ${item.maxStock}`);
      return;
    }
    const updated = [...cart];
    updated[index].quantity = newQty;
    setCart(updated);
  };

  const grandTotal = cart.reduce((acc, curr) => acc + curr.unitPrice * curr.quantity, 0);

  // Submit transaction
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!recipientName.trim()) {
      setErrorMessage("Silakan isi nama penerima pesanan.");
      return;
    }

    if (!recipientPhone.trim()) {
      setErrorMessage("Silakan isi nomor WhatsApp penerima.");
      return;
    }

    if (!city.trim()) {
      setErrorMessage("Silakan isi Kota / Kabupaten tujuan pengiriman.");
      return;
    }

    if (cart.length === 0) {
      setErrorMessage("Keranjang pesanan masih kosong! Tambahkan minimal 1 barang.");
      return;
    }

    startTransition(async () => {
      const res = await submitTransactionAction({
        recipientName: recipientName.trim(),
        recipientPhone: recipientPhone.trim(),
        city: city.trim(),
        fullAddress: fullAddress.trim() || undefined,
        paymentStatus,
        shippingStatus,
        notes: notes.trim() || undefined,
        items: cart.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          itemName: `${item.productName} - ${item.variantName}`,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
        })),
      });

      if (!res.success) {
        setErrorMessage(res.error || "Gagal menyimpan transaksi");
      } else {
        router.push(`/transaksi/${res.transactionId}?status=sukses`);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 pb-32">
      {errorMessage && (
        <div className="p-4 bg-rose-50 border-l-4 border-rose-600 rounded-r-xl text-rose-800 text-sm font-semibold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Bagian 1: Data Pelanggan */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-5">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <User className="w-5 h-5 text-emerald-700" />
          <span>1. Informasi Penerima & Tujuan Kirim</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">
              Nama Penerima <span className="text-rose-500">*</span>:
            </label>
            <input
              type="text"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="Contoh: Ust. Fuadi, Ibu Rina, Ponpes Al-Hidayah"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-slate-900"
              required
            />
            <p className="text-xs text-slate-500 mt-1">Tulis nama lengkap penerima atau nama pesantren / instansi</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">
              Nomor WhatsApp Penerima <span className="text-rose-500">*</span>:
            </label>
            <div className="relative">
              <input
                type="tel"
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
                placeholder="Contoh: 081234567890"
                className="w-full px-4 py-3 pl-11 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-slate-900"
                required
              />
              <Phone className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="sm:col-span-2">
            <CityCombobox value={city} onChange={setCity} required />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">
              Alamat Lengkap Pengiriman:
            </label>
            <input
              type="text"
              value={fullAddress}
              onChange={(e) => setFullAddress(e.target.value)}
              placeholder="Jalan, RT/RW, Dusun, Kecamatan"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-slate-900"
            />
          </div>
        </div>
      </div>

      {/* Bagian 2: Keranjang Belanja */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-4">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-emerald-700" />
          <span>2. Pilih Barang & Varian Ukuran</span>
        </h3>

        {/* Input Pemilih Barang */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Produk */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Pilih Produk:
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => handleProductChange(Number(e.target.value))}
                className="w-full px-3 py-3 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-600"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Varian */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Varian / Ukuran / Kelas:
              </label>
              <select
                value={selectedVariantId}
                onChange={(e) => setSelectedVariantId(Number(e.target.value))}
                className="w-full px-3 py-3 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-600"
              >
                {currentProduct?.variants.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.variantName} — {formatRupiah(v.price)} (Stok: {v.stockQuantity})
                  </option>
                ))}
              </select>
            </div>

            {/* Jumlah & Tombol Tambah */}
            <div className="flex items-end gap-2">
              <div className="w-24">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Jumlah:
                </label>
                <input
                  type="number"
                  min={1}
                  max={currentVariant?.stockQuantity || 1}
                  value={quantityInput}
                  onChange={(e) => setQuantityInput(Number(e.target.value))}
                  className="w-full px-3 py-3 bg-white border border-slate-300 rounded-xl text-center font-bold text-slate-900"
                />
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!currentVariant || currentVariant.stockQuantity <= 0}
                className="flex-1 py-3 px-4 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-40"
              >
                <Plus className="w-5 h-5" />
                <span>+ Masukkan</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabel Keranjang */}
        {cart.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-500">
            Keranjang belanja masih kosong. Pilih barang di atas dan klik tombol{" "}
            <strong>"+ Masukkan"</strong>.
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Nama Barang</th>
                  <th className="py-3 px-4 text-center">Harga Satuan</th>
                  <th className="py-3 px-4 text-center w-32">Jumlah</th>
                  <th className="py-3 px-4 text-right">Subtotal</th>
                  <th className="py-3 px-3 text-center w-12">Hapus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cart.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <div>{item.productName}</div>
                      <span className="text-xs text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                        {item.variantName}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center text-slate-700">
                      {formatRupiah(item.unitPrice)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(index, item.quantity - 1)}
                          className="w-7 h-7 bg-slate-200 hover:bg-slate-300 rounded-lg font-bold text-slate-700"
                        >
                          -
                        </button>
                        <span className="w-8 font-bold text-center">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(index, item.quantity + 1)}
                          className="w-7 h-7 bg-slate-200 hover:bg-slate-300 rounded-lg font-bold text-slate-700"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-slate-900">
                      {formatRupiah(item.unitPrice * item.quantity)}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveFromCart(index)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bagian 3: Status Bayar, Kirim & Catatan */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-4">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-700" />
          <span>3. Status Pembayaran & Pengiriman</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Status Bayar */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">
              Status Pembayaran:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentStatus("Belum Lunas")}
                className={`py-3 px-4 rounded-xl border text-sm font-bold transition-all ${
                  paymentStatus === "Belum Lunas"
                    ? "bg-amber-500 text-white border-amber-600 shadow-sm"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                ⏳ Belum Lunas
              </button>
              <button
                type="button"
                onClick={() => setPaymentStatus("Lunas")}
                className={`py-3 px-4 rounded-xl border text-sm font-bold transition-all ${
                  paymentStatus === "Lunas"
                    ? "bg-emerald-600 text-white border-emerald-700 shadow-sm"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                ✅ Lunas
              </button>
            </div>
          </div>

          {/* Status Kirim */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">
              Status Pengiriman:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setShippingStatus("Belum Dikirim")}
                className={`py-3 px-4 rounded-xl border text-sm font-bold transition-all ${
                  shippingStatus === "Belum Dikirim"
                    ? "bg-slate-700 text-white border-slate-800 shadow-sm"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                🚚 Belum Dikirim
              </button>
              <button
                type="button"
                onClick={() => setShippingStatus("Sudah Dikirim")}
                className={`py-3 px-4 rounded-xl border text-sm font-bold transition-all ${
                  shippingStatus === "Sudah Dikirim"
                    ? "bg-sky-600 text-white border-sky-700 shadow-sm"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                📦 Sudah Dikirim
              </button>
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-slate-800 mb-1">
              Catatan Pesanan (Opsional):
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Titip ke Ustadz Ahmad, kirim pakai ekspedisi J&T"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-slate-900"
            />
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar Checkout */}
      <div className="fixed bottom-0 md:bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t-2 border-emerald-600 shadow-2xl p-4 sm:px-8 no-print">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase font-bold text-slate-500">Total Tagihan Nota:</p>
            <p className="text-2xl sm:text-3xl font-black text-emerald-800">
              {formatRupiah(grandTotal)}
            </p>
            <p className="text-xs text-slate-500">{cart.length} macam barang terpilih</p>
          </div>

          <button
            type="submit"
            disabled={isPending || cart.length === 0}
            className="px-8 sm:px-12 py-4 bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white text-lg font-bold rounded-2xl shadow-xl transition-all flex items-center gap-2.5 disabled:opacity-50"
          >
            {isPending ? (
              <span>Menyimpan Nota...</span>
            ) : (
              <>
                <Save className="w-6 h-6" />
                <span>SIMPAN TRANSAKSI</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
