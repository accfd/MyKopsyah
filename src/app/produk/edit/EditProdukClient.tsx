"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ProductData } from "@/lib/data-service";
import { updateProductAction } from "@/app/actions";
import { formatRupiah } from "@/lib/format";
import {
  ArrowLeft,
  Package,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  Layers,
  Sparkles,
  X,
} from "lucide-react";

interface VariantEditItem {
  id?: number;
  tempKey: string;
  variantName: string;
  price: number;
  stockQuantity: number;
}

export default function EditProdukClient({ product }: { product: ProductData }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // State Produk
  const [name, setName] = useState(product.name);
  const [category, setCategory] = useState<"Seragam" | "Buku" | "Aksesoris">(
    product.category as "Seragam" | "Buku" | "Aksesoris"
  );
  const [unit, setUnit] = useState(product.unit || "Pcs");

  // State Varian
  const [variants, setVariants] = useState<VariantEditItem[]>(
    product.variants.map((v) => ({
      id: v.id,
      tempKey: String(v.id),
      variantName: v.variantName,
      price: v.price,
      stockQuantity: v.stockQuantity,
    }))
  );

  // Modal & Error State
  const [errorMessage, setErrorMessage] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleAddVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        tempKey: String(Date.now()),
        variantName: "",
        price: prev[prev.length - 1]?.price || 0,
        stockQuantity: 0,
      },
    ]);
  };

  const handleRemoveVariant = (tempKey: string) => {
    if (variants.length <= 1) {
      alert("Produk minimal harus memiliki 1 varian.");
      return;
    }
    setVariants((prev) => prev.filter((v) => v.tempKey !== tempKey));
  };

  const handleUpdateVariant = (
    tempKey: string,
    field: "variantName" | "price" | "stockQuantity",
    value: any
  ) => {
    setVariants((prev) =>
      prev.map((v) => {
        if (v.tempKey === tempKey) {
          return {
            ...v,
            [field]:
              field === "variantName"
                ? value
                : Math.max(0, isNaN(value) ? 0 : Number(value)),
          };
        }
        return v;
      })
    );
  };

  const handleOpenConfirm = () => {
    setErrorMessage("");
    if (!name.trim()) {
      setErrorMessage("Nama produk tidak boleh kosong.");
      return;
    }
    if (variants.length === 0) {
      setErrorMessage("Minimal harus ada 1 varian produk.");
      return;
    }
    for (let i = 0; i < variants.length; i++) {
      if (!variants[i].variantName.trim()) {
        setErrorMessage(`Nama varian ke-${i + 1} tidak boleh kosong.`);
        return;
      }
    }
    setShowConfirmModal(true);
  };

  const handleExecuteSave = () => {
    setShowConfirmModal(false);
    startTransition(async () => {
      const payload = {
        name: name.trim(),
        category,
        unit: unit.trim() || "Pcs",
        variants: variants.map((v) => ({
          id: v.id,
          variantName: v.variantName.trim(),
          price: v.price,
          stockQuantity: v.stockQuantity,
        })),
      };

      const res = await updateProductAction(product.id, payload);
      if (res.success) {
        router.push("/produk");
      } else {
        setErrorMessage(res.error || "Gagal memperbarui data produk");
      }
    });
  };

  const totalStockAll = variants.reduce((acc, v) => acc + v.stockQuantity, 0);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-28">
      {/* ─── TOP BAR HEADER ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/produk"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-emerald-700 hover:text-emerald-900 mb-1 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Katalog Produk</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Package className="w-7 h-7 text-emerald-600 shrink-0" />
            <span>Edit Data Produk</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Perbarui nama produk, kategori satuan, harga jual, dan stok varian barang.
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 bg-rose-50 border-l-4 border-rose-600 rounded-r-xl text-rose-800 text-sm font-semibold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* ─── KARTU 1: INFORMASI UTAMA PRODUK ─── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-4">
        <h2 className="text-sm sm:text-base font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b pb-3 border-slate-100">
          <span>1. Informasi Utama Produk</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Nama Produk Barang <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Modul Fiqih Kelas 1, Batik Santri MDTA"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-semibold focus:ring-2 focus:ring-emerald-600 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Kategori Barang <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["Seragam", "Buku", "Aksesoris"] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border ${
                    category === cat
                      ? "bg-emerald-600 text-white border-emerald-700 shadow-xs"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Satuan Unit <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="Contoh: Stel, Eks, Pcs, Rim"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-semibold focus:ring-2 focus:ring-emerald-600 bg-white"
            />
          </div>
        </div>
      </div>

      {/* ─── KARTU 2: RINCIAN VARIAN UKURAN & HARGA ─── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3 border-slate-100">
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600" />
              <span>2. Varian Ukuran / Kelas / Harga</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Atur nama varian, harga jual nota, dan stok fisik gudang saat ini.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddVariant}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-bold border border-emerald-200 transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Varian Baru</span>
          </button>
        </div>

        {/* Tabel Input Varian */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-700 font-bold text-xs uppercase tracking-wider">
                <th className="py-2.5 px-3 w-10 text-center">No</th>
                <th className="py-2.5 px-3">Nama Varian / Ukuran</th>
                <th className="py-2.5 px-3 w-44">Harga Jual (Rp)</th>
                <th className="py-2.5 px-3 w-36 text-center">Stok Fisik ({unit})</th>
                <th className="py-2.5 px-2 w-12 text-center">Hapus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {variants.map((v, idx) => (
                <tr key={v.tempKey} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-2.5 px-3 text-center font-bold text-slate-400">
                    {idx + 1}
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="text"
                      required
                      value={v.variantName}
                      onChange={(e) =>
                        handleUpdateVariant(v.tempKey, "variantName", e.target.value)
                      }
                      placeholder="Contoh: Size 2, Kelas 1, Standar"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-600 bg-white text-xs sm:text-sm"
                    />
                  </td>
                  <td className="py-2 px-3">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                        Rp
                      </span>
                      <input
                        type="number"
                        min={0}
                        step={1000}
                        value={v.price}
                        onChange={(e) =>
                          handleUpdateVariant(v.tempKey, "price", e.target.value)
                        }
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 font-extrabold text-slate-900 focus:ring-2 focus:ring-emerald-600 bg-white text-xs sm:text-sm"
                      />
                    </div>
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="number"
                      min={0}
                      value={v.stockQuantity}
                      onChange={(e) =>
                        handleUpdateVariant(v.tempKey, "stockQuantity", e.target.value)
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-black text-center text-emerald-800 focus:ring-2 focus:ring-emerald-600 bg-white text-xs sm:text-sm"
                    />
                  </td>
                  <td className="py-2 px-2 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(v.tempKey)}
                      disabled={variants.length <= 1}
                      className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 disabled:opacity-30 cursor-pointer"
                      title="Hapus Varian"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 font-bold text-slate-800 border-t-2 border-slate-200">
                <td colSpan={3} className="py-3 px-3 text-right text-xs uppercase tracking-wider">
                  Total Stok Keseluruhan Varian:
                </td>
                <td className="py-3 px-3 text-center font-black text-emerald-800 text-sm">
                  {totalStockAll} {unit}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ─── STICKY BOTTOM ACTIONS BAR ─── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-2xl p-3 sm:px-6 sm:py-3.5 no-print">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <Link
            href="/produk"
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs sm:text-sm font-bold hover:bg-slate-100 transition-colors"
          >
            Batal
          </Link>

          <button
            type="button"
            onClick={handleOpenConfirm}
            disabled={isPending}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs sm:text-sm font-extrabold shadow-md shadow-emerald-700/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Perubahan Produk</span>
          </button>
        </div>
      </div>

      {/* ─── MODAL KONFIRMASI SIMPAN ─── */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                  Konfirmasi Perubahan Produk
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Periksa ringkasan sebelum perubahan diterapkan.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 text-xs sm:text-sm text-slate-700 space-y-1.5">
              <p>
                Nama: <strong className="text-slate-900">{name}</strong>
              </p>
              <p>
                Kategori: <strong className="text-emerald-800">{category}</strong> ({unit})
              </p>
              <p>
                Jumlah Varian: <strong className="text-slate-900">{variants.length} varian</strong>
              </p>
              <p>
                Total Stok Akhir: <strong className="text-emerald-800">{totalStockAll} {unit}</strong>
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs sm:text-sm font-bold hover:bg-slate-100 transition-all cursor-pointer"
              >
                Kembali Edit
              </button>
              <button
                type="button"
                onClick={handleExecuteSave}
                disabled={isPending}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-700/20 transition-all active:scale-98 cursor-pointer flex items-center gap-2"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <span>Ya, Simpan Perubahan</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
