"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createProductAction } from "@/app/actions";
import { formatRupiah } from "@/lib/format";
import {
  ArrowLeft,
  Package,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Loader2,
  X,
  HelpCircle,
} from "lucide-react";

interface VariantFormItem {
  id: string;
  variantName: string;
  price: number;
  initialStock: number;
}

export default function TambahProdukClient() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // State Produk
  const [name, setName] = useState("");
  const [category, setCategory] = useState<"Seragam" | "Buku" | "Aksesoris">("Seragam");
  const [unit, setUnit] = useState("Stel");

  // State Varian
  const [variants, setVariants] = useState<VariantFormItem[]>([
    { id: "1", variantName: "Size 2", price: 130000, initialStock: 0 },
    { id: "2", variantName: "Size 3", price: 130000, initialStock: 0 },
    { id: "3", variantName: "Size 4", price: 130000, initialStock: 0 },
  ]);

  // Modal & Error State
  const [errorMessage, setErrorMessage] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Template Varian Cepat
  const applyTemplate = (type: "seragam" | "buku" | "aksesoris") => {
    if (type === "seragam") {
      setCategory("Seragam");
      setUnit("Stel");
      const sizes = ["Size 2", "Size 3", "Size 4", "Size 5", "Size 6", "Size 7", "Size 8", "Size 9", "Size 10", "Size 12"];
      setVariants(
        sizes.map((s, idx) => ({
          id: String(idx + 1),
          variantName: s,
          price: 130000,
          initialStock: 0,
        }))
      );
    } else if (type === "buku") {
      setCategory("Buku");
      setUnit("Eks");
      const classes = ["Kelas 1", "Kelas 2", "Kelas 3", "Kelas 4"];
      setVariants(
        classes.map((c, idx) => ({
          id: String(idx + 1),
          variantName: c,
          price: 24000,
          initialStock: 0,
        }))
      );
    } else {
      setCategory("Aksesoris");
      setUnit("Pcs");
      setVariants([
        { id: "1", variantName: "Standar", price: 15000, initialStock: 0 },
      ]);
    }
  };

  const handleAddVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        variantName: "",
        price: prev[prev.length - 1]?.price || 0,
        initialStock: 0,
      },
    ]);
  };

  const handleRemoveVariant = (id: string) => {
    if (variants.length <= 1) {
      alert("Produk minimal harus memiliki 1 varian.");
      return;
    }
    setVariants((prev) => prev.filter((v) => v.id !== id));
  };

  const handleUpdateVariant = (
    id: string,
    field: "variantName" | "price" | "initialStock",
    value: any
  ) => {
    setVariants((prev) =>
      prev.map((v) => {
        if (v.id === id) {
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

  // Validasi dan Buka Modal Konfirmasi
  const handleInitiateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!name.trim()) {
      setErrorMessage("Nama produk wajib diisi!");
      return;
    }

    if (variants.length === 0) {
      setErrorMessage("Minimal harus ada 1 varian produk.");
      return;
    }

    // Periksa setiap varian
    const seenNames = new Set<string>();
    for (const v of variants) {
      const vName = v.variantName.trim();
      if (!vName) {
        setErrorMessage("Nama setiap varian/ukuran tidak boleh kosong!");
        return;
      }
      if (seenNames.has(vName.toLowerCase())) {
        setErrorMessage(`Nama varian "${vName}" terdaftar ganda! Tiap varian harus unik.`);
        return;
      }
      seenNames.add(vName.toLowerCase());

      if (v.price < 0) {
        setErrorMessage(`Harga varian "${vName}" tidak boleh negatif!`);
        return;
      }
    }

    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = () => {
    setShowConfirmModal(false);

    const payload = {
      name: name.trim(),
      category,
      unit: unit.trim() || "Pcs",
      variants: variants.map((v) => ({
        variantName: v.variantName.trim(),
        price: v.price,
        initialStock: v.initialStock,
      })),
    };

    startTransition(async () => {
      const res = await createProductAction(payload);
      if (res.success) {
        router.push("/produk");
      } else {
        alert(res.error || "Gagal membuat produk baru.");
      }
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-24">
      {/* ─── HEADER BAR ─── */}
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
          <span>Tambah Produk & Varian Baru</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
          Daftarkan produk koperasi baru beserta rincian ukuran/kelas, harga resmi, dan stok awal.
        </p>
      </div>

      <form onSubmit={handleInitiateSubmit} className="space-y-6">
        {/* ─── TEMPLATE CEPAT ─── */}
        <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2.5 text-emerald-900">
            <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold">Template Varian Siap Pakai:</span>
              <p className="text-xs text-emerald-800">Isi otomatis varian standar tanpa mengetik manual</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => applyTemplate("seragam")}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-100 text-emerald-800 font-bold border border-emerald-300 text-xs shadow-2xs transition-all"
            >
              Template Seragam (Size 2 - 12)
            </button>
            <button
              type="button"
              onClick={() => applyTemplate("buku")}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-100 text-emerald-800 font-bold border border-emerald-300 text-xs shadow-2xs transition-all"
            >
              Template Buku (Kelas 1 - 4)
            </button>
            <button
              type="button"
              onClick={() => applyTemplate("aksesoris")}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-100 text-emerald-800 font-bold border border-emerald-300 text-xs shadow-2xs transition-all"
            >
              Template Standar (1 Varian)
            </button>
          </div>
        </div>

        {/* ─── DATA UTAMA PRODUK ─── */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            1. Informasi Pokok Produk
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Produk Barang <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Batik Santri Putra MDTA 2026, Modul Fiqih Santri"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Satuan Dasar <span className="text-rose-500">*</span>
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm bg-white"
              >
                <option value="Stel">Stel (Sepasang)</option>
                <option value="Eks">Eks (Eksemplar Buku)</option>
                <option value="Pcs">Pcs (Buah / Potong)</option>
                <option value="Lembar">Lembar</option>
                <option value="Pak">Pak</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Kategori Produk <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(["Seragam", "Buku", "Aksesoris"] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-bold transition-all text-center cursor-pointer ${
                    category === cat
                      ? "border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500"
                      : "border-slate-300 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ─── TABEL VARIAN / UKURAN DINAMIS ─── */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                2. Daftar Varian / Ukuran & Harga Resmi
              </h3>
              <p className="text-xs text-slate-500">
                Tiap produk dapat memiliki banyak ukuran atau jilid kelas dengan harga masing-masing.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddVariant}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Varian</span>
            </button>
          </div>

          {/* Tabel Varian */}
          <div className="space-y-2.5">
            {variants.map((v, index) => (
              <div
                key={v.id}
                className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center gap-3"
              >
                <div className="w-6 text-center font-bold text-xs text-slate-400">
                  #{index + 1}
                </div>

                <div className="flex-1">
                  <label className="block sm:hidden text-[11px] font-bold text-slate-600 mb-0.5">
                    Nama Varian / Ukuran / Kelas
                  </label>
                  <input
                    type="text"
                    required
                    value={v.variantName}
                    placeholder="Contoh: Size 4, Kelas 1, dsb"
                    onChange={(e) => handleUpdateVariant(v.id, "variantName", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold bg-white"
                  />
                </div>

                <div className="w-full sm:w-44">
                  <label className="block sm:hidden text-[11px] font-bold text-slate-600 mb-0.5">
                    Harga Jual Satuan (Rp)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    required
                    value={v.price}
                    onChange={(e) =>
                      handleUpdateVariant(v.id, "price", parseInt(e.target.value, 10))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-right bg-white"
                  />
                </div>

                <div className="w-full sm:w-32">
                  <label className="block sm:hidden text-[11px] font-bold text-slate-600 mb-0.5">
                    Stok Awal ({unit})
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={v.initialStock}
                    onChange={(e) =>
                      handleUpdateVariant(v.id, "initialStock", parseInt(e.target.value, 10))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-center bg-white"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveVariant(v.id)}
                  disabled={variants.length <= 1}
                  className="self-end sm:self-center p-2 rounded-xl text-rose-600 hover:bg-rose-50 disabled:opacity-30 transition-all cursor-pointer"
                  title="Hapus Varian"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ─── ERROR BANNER JIKA ADA SALAH INPUT ─── */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ─── SUBMIT ACTION ─── */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/produk"
            className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs sm:text-sm hover:bg-slate-100 transition-colors"
          >
            Batal
          </Link>

          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-700/20 active:scale-98 transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Tinjau & Daftarkan Produk</span>
          </button>
        </div>
      </form>

      {/* ─── MODAL VERIFIKASI SEBELUM SIMPAN ─── */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    Konfirmasi Pendaftaran Produk
                  </h3>
                  <p className="text-xs text-slate-500">Periksa detail produk sebelum disimpan</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Info Produk Ringkas */}
            <div className="bg-slate-50 p-3.5 rounded-xl text-xs space-y-1.5 text-slate-700 border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Nama Produk:</span>
                <span className="font-black text-slate-900">{name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Kategori:</span>
                <span className="font-bold text-emerald-800">{category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Satuan:</span>
                <span className="font-bold text-slate-800">{unit}</span>
              </div>
            </div>

            {/* Ringkasan Varian */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-56">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Varian yang Didaftarkan ({variants.length}):
              </div>
              {variants.map((v) => (
                <div
                  key={v.id}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-900">{v.variantName}</span>
                    <span className="text-[11px] text-slate-500 block">
                      Stok awal: {v.initialStock} {unit}
                    </span>
                  </div>
                  <div className="font-black text-emerald-800">{formatRupiah(v.price)}</div>
                </div>
              ))}
            </div>

            {/* Tombol Tindakan Modal */}
            <div className="pt-3 border-t border-slate-100 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs sm:text-sm hover:bg-slate-100 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmSubmit}
                disabled={isPending}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Mendaftarkan...</span>
                  </>
                ) : (
                  <span>Ya, Daftarkan Produk</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
