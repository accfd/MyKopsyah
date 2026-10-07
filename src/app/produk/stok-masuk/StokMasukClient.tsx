"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ProductData } from "@/lib/data-service";
import { submitStockAdjustmentAction } from "@/app/actions";
import {
  ArrowLeft,
  PackagePlus,
  SlidersHorizontal,
  Search,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Plus,
  Minus,
  Sparkles,
  Layers,
  ChevronRight,
  Info,
  Loader2,
  X,
} from "lucide-react";

export default function StokMasukClient({ products }: { products: ProductData[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Mode: "TAMBAH" (Restock / Tambah kuantitas) vs "SET_FISIK" (Stok Opname / Set ke angka fisik)
  const [mode, setMode] = useState<"TAMBAH" | "SET_FISIK">("TAMBAH");

  // Filter Kategori & Pencarian
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedProductId, setSelectedProductId] = useState<number>(0); // 0 = Semua Produk

  // Header data
  const [supplierNotes, setSupplierNotes] = useState<string>("");
  const [refDocNumber, setRefDocNumber] = useState<string>("");

  // Staged input: Record<variantId, number>
  // Untuk mode TAMBAH: jumlah yang ditambah (> 0)
  // Untuk mode SET_FISIK: angka fisik baru (>= 0)
  const [stagedValues, setStagedValues] = useState<Record<number, number>>({});

  // Quick fill helper
  const [quickAmount, setQuickAmount] = useState<number>(50);

  // Modal Verifikasi / Konfirmasi Sebelum Submit
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const categories = ["Semua", "Seragam", "Buku", "Aksesoris"];

  // Filter Produk
  const filteredProducts = products.filter((p) => {
    const matchCat = selectedCategory === "Semua" || p.category === selectedCategory;
    const matchProd = selectedProductId === 0 || p.id === selectedProductId;
    const matchSearch =
      searchQuery.trim() === "" ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.variants.some((v) => v.variantName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchProd && matchSearch;
  });

  // Handler ubah nilai varian
  const handleValueChange = (variantId: number, rawVal: number) => {
    const val = Math.max(0, isNaN(rawVal) ? 0 : rawVal);
    setStagedValues((prev) => ({
      ...prev,
      [variantId]: val,
    }));
  };

  const handleStepValue = (variantId: number, delta: number, currentStock: number) => {
    const currentInput =
      stagedValues[variantId] !== undefined
        ? stagedValues[variantId]
        : mode === "SET_FISIK"
        ? currentStock
        : 0;
    const next = Math.max(0, currentInput + delta);
    setStagedValues((prev) => ({
      ...prev,
      [variantId]: next,
    }));
  };

  // Helper isi massal produk terpilih
  const handleQuickFillCurrentProduct = (prod: ProductData) => {
    setStagedValues((prev) => {
      const next = { ...prev };
      prod.variants.forEach((v) => {
        if (mode === "TAMBAH") {
          next[v.id] = quickAmount;
        } else {
          next[v.id] = v.stockQuantity + quickAmount;
        }
      });
      return next;
    });
  };

  // Helper reset produk terpilih
  const handleResetCurrentProduct = (prod: ProductData) => {
    setStagedValues((prev) => {
      const next = { ...prev };
      prod.variants.forEach((v) => {
        delete next[v.id];
      });
      return next;
    });
  };

  // Kumpulkan item yang diisi secara valid
  const activeItemsToSubmit: {
    variantId: number;
    productName: string;
    variantName: string;
    currentStock: number;
    inputValue: number;
    projectedStock: number;
    delta: number;
  }[] = [];

  for (const p of products) {
    for (const v of p.variants) {
      const inputVal = stagedValues[v.id];
      if (inputVal !== undefined && inputVal !== null) {
        if (mode === "TAMBAH" && inputVal > 0) {
          activeItemsToSubmit.push({
            variantId: v.id,
            productName: p.name,
            variantName: v.variantName,
            currentStock: v.stockQuantity,
            inputValue: inputVal,
            projectedStock: v.stockQuantity + inputVal,
            delta: inputVal,
          });
        } else if (mode === "SET_FISIK" && inputVal >= 0 && inputVal !== v.stockQuantity) {
          activeItemsToSubmit.push({
            variantId: v.id,
            productName: p.name,
            variantName: v.variantName,
            currentStock: v.stockQuantity,
            inputValue: inputVal,
            projectedStock: inputVal,
            delta: inputVal - v.stockQuantity,
          });
        }
      }
    }
  }

  const totalVariantsChanged = activeItemsToSubmit.length;
  const totalUnitsDelta = activeItemsToSubmit.reduce((acc, it) => acc + it.delta, 0);

  // Verifikasi dan buka modal
  const handleInitiateSubmit = () => {
    setErrorMessage("");
    if (activeItemsToSubmit.length === 0) {
      setErrorMessage(
        mode === "TAMBAH"
          ? "Silakan masukkan jumlah stok masuk (minimal 1 varian dengan kuantitas > 0)."
          : "Belum ada varian yang nilainya diubah dari stok fisik saat ini."
      );
      return;
    }

    if (!supplierNotes.trim()) {
      setErrorMessage("Keterangan / Sumber Barang (misal: nama konveksi, penerbit, atau catatan opname) wajib diisi!");
      return;
    }

    setShowConfirmModal(true);
  };

  // Eksekusi Simpan ke Database
  const handleConfirmSubmit = () => {
    setShowConfirmModal(false);

    const payload = activeItemsToSubmit.map((it) => ({
      variantId: it.variantId,
      mode,
      quantity: it.inputValue,
    }));

    const finalNotes = refDocNumber.trim()
      ? `[No. Ref: ${refDocNumber.trim()}] ${supplierNotes.trim()}`
      : supplierNotes.trim();

    startTransition(async () => {
      const res = await submitStockAdjustmentAction(payload, finalNotes);
      if (res.success) {
        router.push("/produk");
      } else {
        alert(res.error || "Gagal menyimpan perubahan stok");
      }
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-24">
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
            <PackagePlus className="w-7 h-7 text-emerald-600 shrink-0" />
            <span>Pembaruan Stok Barang</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Kelola penerimaan barang masuk dari konveksi/penerbit atau sesuaikan stok fisik opname gudang.
          </p>
        </div>

        {/* MODE SWITCHER PILL */}
        <div className="inline-flex p-1 bg-slate-200/80 rounded-2xl border border-slate-300 self-start sm:self-auto shadow-xs">
          <button
            type="button"
            onClick={() => {
              setMode("TAMBAH");
              setStagedValues({});
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              mode === "TAMBAH"
                ? "bg-emerald-600 text-white shadow-md scale-102"
                : "text-slate-700 hover:text-slate-900"
            }`}
          >
            <PackagePlus className="w-4 h-4" />
            <span>Tambah Stok (Restock)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("SET_FISIK");
              setStagedValues({});
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              mode === "SET_FISIK"
                ? "bg-sky-700 text-white shadow-md scale-102"
                : "text-slate-700 hover:text-slate-900"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Opname / Set Fisik</span>
          </button>
        </div>
      </div>

      {/* ─── KETERANGAN MODE INFO BANNER ─── */}
      <div
        className={`p-4 rounded-2xl border text-xs sm:text-sm flex items-start gap-3 shadow-xs ${
          mode === "TAMBAH"
            ? "bg-emerald-50/80 border-emerald-200 text-emerald-900"
            : "bg-sky-50/80 border-sky-200 text-sky-900"
        }`}
      >
        <Info className="w-5 h-5 shrink-0 mt-0.5" />
        <div className="space-y-0.5 leading-relaxed">
          <div className="font-bold">
            {mode === "TAMBAH" ? "Mode Tambah Stok (Restock Masuk):" : "Mode Penyesuaian Fisik (Stok Opname):"}
          </div>
          <div>
            {mode === "TAMBAH"
              ? "Nilai yang diinput akan DITAMBAHKAN ke stok saat ini (Stok Baru = Stok Sekarang + Input). Cocok saat menerima pasokan barang baru."
              : "Nilai yang diinput akan MENJADI stok akhir baru (Stok Baru = Input). Sistem otomatis menghitung selisih bertambah atau berkurangnya stok."}
          </div>
        </div>
      </div>

      {/* ─── FORM INFORMASI PENERIMAAN / OPNAME ─── */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
          <span>1. Informasi Dokumen & Sumber Penerimaan</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Sumber Barang / Pengirim / Keterangan <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={supplierNotes}
              onChange={(e) => setSupplierNotes(e.target.value)}
              placeholder={
                mode === "TAMBAH"
                  ? "Contoh: Konveksi Bukittinggi, Penerbit Erlangga, Pabrik MDTA"
                  : "Contoh: Hasil Stok Opname Gudang Akhir Triwulan"
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              No. Surat Jalan / No. Referensi Pengiriman (Opsional)
            </label>
            <input
              type="text"
              value={refDocNumber}
              onChange={(e) => setRefDocNumber(e.target.value)}
              placeholder="Contoh: SJ-2026/09/88 atau Bukti Terima #42"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm bg-white"
            />
          </div>
        </div>
      </div>

      {/* ─── FILTER & SELEKSI PRODUK ─── */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            <span>2. Pilih Barang & Masukkan Kuantitas</span>
          </h3>

          {/* Quick fill massal */}
          <div className="flex items-center gap-2 self-start sm:self-auto text-xs bg-slate-100 p-1.5 rounded-xl border border-slate-200">
            <span className="font-semibold text-slate-600 pl-1">Isi Cepat:</span>
            {[10, 50, 100].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setQuickAmount(amt)}
                className={`px-2 py-1 rounded-lg font-bold transition-all ${
                  quickAmount === amt
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-white text-slate-700 hover:bg-slate-200"
                }`}
              >
                +{amt}
              </button>
            ))}
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Kategori tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar shrink-0">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat);
                  setSelectedProductId(0);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-emerald-700 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama barang atau varian..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 bg-white"
            />
          </div>
        </div>

        {/* DAFTAR PRODUK & TABEL VARIAN */}
        <div className="space-y-4 pt-2">
          {filteredProducts.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-500 text-xs sm:text-sm">
              Tidak ada produk yang cocok dengan pencarian.
            </div>
          ) : (
            filteredProducts.map((prod) => (
              <div
                key={prod.id}
                className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50/50 shadow-xs"
              >
                {/* Header Barang */}
                <div className="p-3.5 sm:p-4 bg-white border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                      {prod.category}
                    </span>
                    <h4 className="font-extrabold text-sm sm:text-base text-slate-900">
                      {prod.name}
                    </h4>
                    <span className="text-xs text-slate-500">({prod.unit})</span>
                  </div>

                  {/* Tombol Aksi Cepat per Produk */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => handleQuickFillCurrentProduct(prod)}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Semua +{quickAmount}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleResetCurrentProduct(prod)}
                      className="px-2 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                      title="Kosongkan input produk ini"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                {/* Grid / Tabel Varian */}
                <div className="divide-y divide-slate-200 bg-white">
                  {prod.variants.map((v) => {
                    const currentVal =
                      stagedValues[v.id] !== undefined
                        ? stagedValues[v.id]
                        : mode === "SET_FISIK"
                        ? v.stockQuantity
                        : 0;

                    const projected =
                      mode === "TAMBAH" ? v.stockQuantity + (stagedValues[v.id] || 0) : currentVal;

                    const delta =
                      mode === "TAMBAH" ? stagedValues[v.id] || 0 : currentVal - v.stockQuantity;

                    const isChanged =
                      mode === "TAMBAH" ? (stagedValues[v.id] || 0) > 0 : currentVal !== v.stockQuantity;

                    return (
                      <div
                        key={v.id}
                        className={`p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                          isChanged ? "bg-emerald-50/30" : ""
                        }`}
                      >
                        {/* Nama Varian & Stok Sekarang */}
                        <div className="flex items-center justify-between sm:justify-start gap-4 sm:w-1/3">
                          <div>
                            <div className="font-bold text-xs sm:text-sm text-slate-900">
                              {v.variantName}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              Stok saat ini:{" "}
                              <span className="font-bold text-slate-800">
                                {v.stockQuantity} {prod.unit}
                              </span>
                            </div>
                          </div>

                          {/* Badge Proyeksi di Mobile */}
                          {isChanged && (
                            <span className="sm:hidden px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                              Menjadi: {projected} {prod.unit}
                            </span>
                          )}
                        </div>

                        {/* Input Control dengan Button - dan + */}
                        <div className="flex items-center gap-2 self-start sm:self-center">
                          <button
                            type="button"
                            onClick={() => handleStepValue(v.id, -10, v.stockQuantity)}
                            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold text-xs flex items-center justify-center transition-all"
                            title="-10"
                          >
                            -10
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStepValue(v.id, -1, v.stockQuantity)}
                            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold text-xs flex items-center justify-center transition-all"
                            title="-1"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>

                          <input
                            type="number"
                            min={0}
                            value={stagedValues[v.id] !== undefined ? stagedValues[v.id] : ""}
                            placeholder={mode === "SET_FISIK" ? String(v.stockQuantity) : "0"}
                            onChange={(e) =>
                              handleValueChange(
                                v.id,
                                e.target.value === "" ? 0 : parseInt(e.target.value, 10)
                              )
                            }
                            className={`w-20 sm:w-24 px-2 py-1.5 text-center font-bold text-xs sm:text-sm rounded-xl border focus:ring-2 focus:ring-emerald-500 ${
                              isChanged
                                ? "border-emerald-600 bg-emerald-50 text-emerald-900 font-black ring-1 ring-emerald-500"
                                : "border-slate-300 text-slate-800"
                            }`}
                          />

                          <button
                            type="button"
                            onClick={() => handleStepValue(v.id, 1, v.stockQuantity)}
                            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold text-xs flex items-center justify-center transition-all"
                            title="+1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStepValue(v.id, 10, v.stockQuantity)}
                            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold text-xs flex items-center justify-center transition-all"
                            title="+10"
                          >
                            +10
                          </button>
                        </div>

                        {/* Ringkasan Perubahan Stok Akhir di Desktop */}
                        <div className="hidden sm:flex items-center justify-end gap-3 text-right w-1/3">
                          {isChanged ? (
                            <div>
                              <div className="text-xs font-extrabold text-emerald-800 flex items-center justify-end gap-1">
                                <span>Menjadi {projected} {prod.unit}</span>
                                <span className="text-[11px] font-bold text-emerald-600">
                                  ({delta >= 0 ? `+${delta}` : delta})
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-500">
                                Stok lama: {v.stockQuantity} {prod.unit}
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 font-medium italic">
                              Tidak ada perubahan
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ─── ERROR BANNER JIKA VALIDASI GAGAL ─── */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* ─── FLOATING ACTION BAR DI BAWAH ─── */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t-2 border-emerald-600 shadow-2xl p-3 sm:p-4 no-print">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-sm shrink-0">
              {totalVariantsChanged}
            </div>
            <div>
              <div className="font-extrabold text-sm sm:text-base text-slate-900">
                {totalVariantsChanged} Varian Terpilih
              </div>
              <div className="text-xs text-slate-600 font-medium">
                {mode === "TAMBAH"
                  ? `Total stok masuk: +${totalUnitsDelta} unit`
                  : `Total selisih unit: ${totalUnitsDelta >= 0 ? `+${totalUnitsDelta}` : totalUnitsDelta} unit`}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                if (confirm("Kosongkan semua isian perubahan stok?")) {
                  setStagedValues({});
                }
              }}
              disabled={totalVariantsChanged === 0 || isPending}
              className="px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-colors"
            >
              Reset Semua
            </button>

            <button
              type="button"
              onClick={handleInitiateSubmit}
              disabled={totalVariantsChanged === 0 || isPending}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-700/20 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Tinjau & Simpan Perubahan</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ─── MODAL VERIFIKASI & KONFIRMASI (ANTI HUMAN ERROR) ─── */}
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
                    Konfirmasi {mode === "TAMBAH" ? "Penerimaan Stok" : "Penyesuaian Stok"}
                  </h3>
                  <p className="text-xs text-slate-500">Periksa ringkasan sebelum disimpan ke database</p>
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

            {/* Info Dokumen */}
            <div className="bg-slate-50 p-3.5 rounded-xl text-xs space-y-1 text-slate-700 border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Mode:</span>
                <span className="font-bold text-emerald-800">
                  {mode === "TAMBAH" ? "Tambah Stok (Restock)" : "Penyesuaian Fisik (Opname)"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Sumber / Catatan:</span>
                <span className="font-bold text-slate-900">{supplierNotes}</span>
              </div>
              {refDocNumber && (
                <div className="flex justify-between">
                  <span className="text-slate-500">No. Referensi:</span>
                  <span className="font-bold text-slate-900">{refDocNumber}</span>
                </div>
              )}
            </div>

            {/* Daftar Rincian Barang yang Diubah */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-60">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Daftar Barang yang Diperbarui ({activeItemsToSubmit.length}):
              </div>
              {activeItemsToSubmit.map((it) => (
                <div
                  key={it.variantId}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-900">
                      {it.productName} - {it.variantName}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Stok saat ini: {it.currentStock} unit
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-emerald-700">
                      Menjadi {it.projectedStock} unit
                    </div>
                    <div className="text-[10px] font-bold text-slate-600">
                      {it.delta >= 0 ? `(+${it.delta})` : `(${it.delta})`}
                    </div>
                  </div>
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
                Kembali Edit
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
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <span>Ya, Simpan ke Sistem</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
