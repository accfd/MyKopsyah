"use client";

import { useState } from "react";
import Link from "next/link";
import { ProductData } from "@/lib/data-service";
import { formatRupiah } from "@/lib/format";
import {
  Package,
  Search,
  Plus,
  Layers,
  Pencil,
} from "lucide-react";

export default function ProdukManagementClient({
  products,
}: {
  products: ProductData[];
}) {
  // Tab Kategori & Filter Pencarian untuk Katalog
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const categories = ["Semua", "Seragam", "Buku", "Aksesoris"];

  // Filter Produk
  const filteredProducts = products.filter((p) => {
    const matchCategory = selectedCategory === "Semua" || p.category === selectedCategory;
    const matchSearch =
      searchQuery.trim() === "" ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.variants.some((v) => v.variantName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCategory && matchSearch;
  });

  // Hitung total ringkasan
  const totalProductsCount = products.length;
  const totalVariantsCount = products.reduce((acc, p) => acc + p.variants.length, 0);
  const totalStockAll = products.reduce(
    (acc, p) => acc + p.variants.reduce((vAcc, v) => vAcc + v.stockQuantity, 0),
    0
  );

  return (
    <div className="space-y-6 pb-16">
      {/* ─── HEADER UTAMA DENGAN TOMBOL AKSI ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Package className="w-7 h-7 text-emerald-600 shrink-0" />
            <span>Katalog Produk & Kelola Stok</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Pantau ketersediaan stok fisik gudang per varian dan daftarkan produk baru Kopsyah.
          </p>
        </div>

        {/* Action Button: Hanya Tambah Produk Baru */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/produk/baru"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-700/20 transition-all active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Produk Baru</span>
          </Link>
        </div>
      </div>

      {/* ─── RINGKASAN METRIK STOK PRODUK ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Produk</div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
            {totalProductsCount} Macam
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Varian</div>
          <div className="text-xl sm:text-2xl font-black text-sky-700 mt-0.5">
            {totalVariantsCount} Varian Ukuran
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Fisik Gudang</div>
          <div className="text-xl sm:text-2xl font-black text-emerald-700 mt-0.5">
            {totalStockAll.toLocaleString("id-ID")} Unit
          </div>
        </div>
      </div>

      {/* ─── DAFTAR KATALOG PRODUK & VARIAN ─── */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
              Daftar Barang & Varian Ukuran
            </h2>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-72">
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

        {/* Tab Kategori Filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Daftar Kartu Produk */}
        <div className="space-y-4 pt-2">
          {filteredProducts.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-500 text-xs sm:text-sm">
              Tidak ada produk yang cocok dengan pencarian "{searchQuery}".
            </div>
          ) : (
            filteredProducts.map((prod) => {
              const totalProdStock = prod.variants.reduce(
                (sum, v) => sum + v.stockQuantity,
                0
              );

              return (
                <div
                  key={prod.id}
                  className="rounded-2xl border border-slate-200 overflow-hidden hover:border-slate-300 transition-all shadow-xs"
                >
                  {/* Header Produk */}
                  <div className="bg-slate-50/80 p-3.5 sm:px-5 sm:py-3.5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2.5 py-0.5 rounded-lg text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {prod.category}
                      </span>
                      <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                        {prod.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2.5 text-xs">
                      <span className="hidden sm:inline text-slate-500 font-medium">
                        {prod.variants.length} Varian Ukuran
                      </span>
                      <span className="font-bold text-slate-800 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                        Total: {totalProdStock} {prod.unit}
                      </span>
                      <Link
                        href={`/produk/edit/${prod.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 transition-all active:scale-95 shadow-2xs"
                        title="Edit nama, kategori, harga & varian produk"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </Link>
                    </div>
                  </div>

                  {/* Tabel Baris Varian */}
                  <div className="divide-y divide-slate-100 bg-white">
                    {prod.variants.map((v) => {
                      const isLowStock = v.stockQuantity <= 5;
                      return (
                        <div
                          key={v.id}
                          className="p-3 sm:px-4 sm:py-3 flex items-center justify-between gap-4 text-xs sm:text-sm hover:bg-slate-50/80 transition-colors"
                        >
                          <div className="w-1/3 sm:w-1/4">
                            <span className="font-bold text-slate-900">{v.variantName}</span>
                          </div>

                          <div className="text-right sm:text-left w-1/3">
                            <span className="font-extrabold text-slate-800">
                              {formatRupiah(v.price)}
                            </span>
                          </div>

                          <div className="text-right w-1/3 flex items-center justify-end gap-2">
                            <span
                              className={`px-2.5 py-1 rounded-lg text-xs font-black ${
                                isLowStock
                                  ? "bg-rose-100 text-rose-800"
                                  : "bg-emerald-100 text-emerald-800"
                              }`}
                            >
                              {v.stockQuantity} {prod.unit}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
