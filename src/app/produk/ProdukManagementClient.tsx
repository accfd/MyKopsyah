"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ProductData, StockEntryData } from "@/lib/data-service";
import { formatRupiah, formatTanggal } from "@/lib/format";
import { submitStockEntryAction, submitUpdatePriceAction } from "@/app/actions";
import { PlusCircle, Edit3, PackagePlus, History, X, Check, Search } from "lucide-react";

export default function ProdukManagementClient({
  products,
  recentStockEntries,
}: {
  products: ProductData[];
  recentStockEntries: StockEntryData[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Tab & Search
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modal Stock Entry
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [stockProdId, setStockProdId] = useState<number>(products[0]?.id || 0);
  const selectedProdForStock = products.find((p) => p.id === stockProdId) || products[0];

  const [stockVariantId, setStockVariantId] = useState<number>(
    selectedProdForStock?.variants[0]?.id || 0
  );
  const [quantityAdded, setQuantityAdded] = useState<number>(10);
  const [supplierNotes, setSupplierNotes] = useState<string>("");

  // Modal Edit Price
  const [editingVariant, setEditingVariant] = useState<{
    variantId: number;
    productName: string;
    variantName: string;
    currentPrice: number;
  } | null>(null);
  const [newPriceInput, setNewPriceInput] = useState<number>(0);

  const categories = ["Semua", "Seragam", "Buku", "Aksesoris", "Kain"];

  const handleStockProductChange = (prodId: number) => {
    setStockProdId(prodId);
    const prod = products.find((p) => p.id === prodId);
    if (prod && prod.variants.length > 0) {
      setStockVariantId(prod.variants[0].id);
    }
  };

  const handleStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantityAdded <= 0) {
      alert("Jumlah barang masuk harus minimal 1");
      return;
    }

    startTransition(async () => {
      const res = await submitStockEntryAction(stockVariantId, quantityAdded, supplierNotes);
      if (res.success) {
        setIsStockModalOpen(false);
        setSupplierNotes("");
        router.refresh();
      } else {
        alert(res.error || "Gagal menambah stok");
      }
    });
  };

  const handlePriceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVariant || newPriceInput <= 0) return;

    startTransition(async () => {
      const res = await submitUpdatePriceAction(editingVariant.variantId, newPriceInput);
      if (res.success) {
        setEditingVariant(null);
        router.refresh();
      } else {
        alert("Gagal mengubah harga");
      }
    });
  };

  const filteredProducts = products
    .filter((p) => selectedCategory === "Semua" || p.category === selectedCategory)
    .filter((p) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.variants.some((v) => v.variantName.toLowerCase().includes(q))
      );
    });

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Katalog Barang & Stok</h2>
          <p className="text-sm text-slate-600">
            Periksa ketersediaan stok fisik gudang, atur harga, dan catat barang masuk.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsStockModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md transition-all active:scale-98"
        >
          <PackagePlus className="w-5 h-5" />
          <span>+ Input Stok Masuk</span>
        </button>
      </div>

      {/* Filter Kategori & Pencarian */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1 rounded-xl max-w-fit">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                selectedCategory === cat
                  ? "bg-white text-emerald-800 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari barang atau ukuran..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 shadow-sm"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Grid Katalog Produk */}
      <div className="space-y-4">
        {filteredProducts.map((prod) => (
          <div
            key={prod.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
          >
            <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  {prod.category}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1">{prod.name}</h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">Satuan: {prod.unit}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-slate-500 text-xs uppercase font-semibold border-b border-slate-100">
                  <tr>
                    <th className="py-2.5 px-5">Varian / Ukuran</th>
                    <th className="py-2.5 px-4 text-center">Harga Jual</th>
                    <th className="py-2.5 px-4 text-center">Stok Fisik</th>
                    <th className="py-2.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {prod.variants.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50">
                      <td className="py-3 px-5 font-semibold text-slate-900">
                        {v.variantName}
                        {v.skuCode && (
                          <span className="text-xs font-mono text-slate-400 ml-2">
                            ({v.skuCode})
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-800">
                        {formatRupiah(v.price)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            v.stockQuantity === 0
                              ? "bg-rose-100 text-rose-800"
                              : v.stockQuantity <= 5
                              ? "bg-amber-100 text-amber-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {v.stockQuantity === 0
                            ? "Habis"
                            : `${v.stockQuantity} ${prod.unit}`}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingVariant({
                              variantId: v.id,
                              productName: prod.name,
                              variantName: v.variantName,
                              currentPrice: v.price,
                            });
                            setNewPriceInput(v.price);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Ubah Harga</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* Riwayat Stok Masuk Terakhir */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-4">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <History className="w-5 h-5 text-emerald-700" />
          <span>Riwayat Stok Masuk Terakhir</span>
        </h3>

        {recentStockEntries.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">
            Belum ada catatan stok masuk tersimpan.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Tanggal</th>
                  <th className="py-2.5 px-3">Barang & Varian</th>
                  <th className="py-2.5 px-3 text-center">Jumlah Masuk</th>
                  <th className="py-2.5 px-3">Sumber / Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentStockEntries.slice(0, 10).map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 text-xs text-slate-500">
                      {formatTanggal(entry.createdAt)}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      {entry.productName} ({entry.variantName})
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-emerald-700">
                      +{entry.quantityAdded}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 text-xs">
                      {entry.supplierOrNotes || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Input Stok Masuk */}
      {isStockModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <PackagePlus className="w-5 h-5 text-emerald-700" />
                <span>+ Catat Barang Masuk</span>
              </h3>
              <button
                onClick={() => setIsStockModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStockSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Pilih Produk:
                </label>
                <select
                  value={stockProdId}
                  onChange={(e) => handleStockProductChange(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Pilih Varian / Ukuran:
                </label>
                <select
                  value={stockVariantId}
                  onChange={(e) => setStockVariantId(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900"
                >
                  {selectedProdForStock?.variants.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.variantName} (Stok Saat Ini: {v.stockQuantity})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Jumlah Barang Masuk (+):
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={quantityAdded}
                  onChange={(e) => setQuantityAdded(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-emerald-800 text-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Keterangan / Asal Pengirim:
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Kiriman Konveksi Mas Dani, Penerbit Solo"
                  value={supplierNotes}
                  onChange={(e) => setSupplierNotes(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsStockModalOpen(false)}
                  className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-sm shadow-md disabled:opacity-50"
                >
                  {isPending ? "Menyimpan..." : "Simpan Tambah Stok"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Harga */}
      {editingVariant && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-slate-900">Ubah Harga Jual</h3>
              <button
                onClick={() => setEditingVariant(null)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePriceSubmit} className="space-y-4">
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase">Produk & Varian:</p>
                <p className="font-bold text-slate-900 text-sm">
                  {editingVariant.productName} - {editingVariant.variantName}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Harga Jual Baru (Rp):
                </label>
                <input
                  type="number"
                  min={1000}
                  step={500}
                  required
                  value={newPriceInput}
                  onChange={(e) => setNewPriceInput(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-emerald-800 text-lg"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingVariant(null)}
                  className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 py-2.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-sm shadow-md"
                >
                  {isPending ? "Menyimpan..." : "Update Harga"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
