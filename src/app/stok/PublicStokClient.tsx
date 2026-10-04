"use client";

import { useState } from "react";
import Link from "next/link";
import { ProductData } from "@/lib/data-service";
import { formatRupiah } from "@/lib/format";
import { Search, Store, MessageCircle, CheckCircle2, AlertCircle } from "lucide-react";

export default function PublicStokClient({ products }: { products: ProductData[] }) {
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = ["Semua", "Seragam", "Buku", "Aksesoris", "Kain"];

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

  const adminPhone = process.env.NEXT_PUBLIC_ADMIN_WA || "628123456789";
  const waLink = `https://wa.me/${adminPhone}?text=${encodeURIComponent(
    "Assalamu'alaikum Admin Kopsyah, saya ingin menanyakan ketersediaan pesanan barang perlengkapan santri..."
  )}`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-28">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-emerald-800 text-white shadow-md">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-inner">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-white leading-tight">
                Katalog Stok Kopsyah
              </h1>
              <p className="text-xs text-emerald-200">Koperasi Syariah - Informasi Ketersediaan</p>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Notice */}
      <div className="bg-gradient-to-b from-emerald-800 to-emerald-700 text-white px-4 py-6 text-center">
        <div className="max-w-xl mx-auto space-y-2">
          <span className="inline-block text-xs font-bold bg-emerald-900/60 text-emerald-200 px-3 py-1 rounded-full border border-emerald-600/50">
            📡 Stok Diperbarui Secara Real-time
          </span>
          <h2 className="text-xl sm:text-2xl font-bold">Cek Ketersediaan Barang Santri & Guru</h2>
          <p className="text-xs sm:text-sm text-emerald-100">
            Silakan periksa ketersediaan ukuran seragam, buku, dan perlengkapan lainnya di bawah ini.
          </p>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Search & Categories */}
        <div className="space-y-3">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ketik nama barang, ukuran, atau kelas (misal: Baju santri no 5)..."
              className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-300 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 shadow-sm text-slate-900"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>

          {/* Category Chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-emerald-700 text-white shadow-sm"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500">
            Tidak ditemukan barang yang sesuai dengan kata kunci pencarian.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProducts.map((prod) => (
              <div
                key={prod.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
              >
                <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                      {prod.category}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">{prod.name}</h3>
                  </div>
                  <span className="text-xs text-slate-500">Satuan: {prod.unit}</span>
                </div>

                <div className="divide-y divide-slate-100">
                  {prod.variants.map((v) => {
                    const isOutOfStock = v.stockQuantity === 0;
                    const isLowStock = v.stockQuantity > 0 && v.stockQuantity <= 5;

                    return (
                      <div
                        key={v.id}
                        className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors"
                      >
                        <div>
                          <p className="font-bold text-slate-900 text-sm sm:text-base">
                            {v.variantName}
                          </p>
                          <p className="text-emerald-800 font-extrabold text-sm sm:text-base mt-0.5">
                            {formatRupiah(v.price)}
                          </p>
                        </div>

                        <div>
                          {isOutOfStock ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>Habis</span>
                            </span>
                          ) : isLowStock ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>Sisa Sedikit ({v.stockQuantity})</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Tersedia ({v.stockQuantity})</span>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Floating Bottom Bar: Hubungi Admin via WA */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 sm:p-4 shadow-2xl">
        <div className="max-w-md mx-auto">
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2.5 w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold rounded-2xl shadow-lg transition-all"
          >
            <MessageCircle className="w-5 h-5 fill-white text-emerald-600" />
            <span>Pesan / Tanya Admin via WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
