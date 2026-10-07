"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ProductData } from "@/lib/data-service";
import { formatRupiah } from "@/lib/format";
import { Search, Store, MessageCircle, CheckCircle2, AlertCircle, FileText, Download, ChevronDown, ChevronUp } from "lucide-react";

export default function PublicStokClient({ products }: { products: ProductData[] }) {
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [showPdf, setShowPdf] = useState(false);

  const categories = ["Semua", "Seragam", "Buku", "Aksesoris"];

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

  // Nomor WhatsApp resmi Admin Kopsyah: 0895-6191-4774
  const adminPhone = "6289561914774";
  const waLink = `https://wa.me/${adminPhone}?text=${encodeURIComponent(
    "Assalamu'alaikum Admin Kopsyah, saya ingin menanyakan ketersediaan pesanan barang perlengkapan santri..."
  )}`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-28">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-emerald-800 text-white shadow-md">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shadow-md overflow-hidden shrink-0 border border-emerald-700/50">
              <Image
                src="/logo-kopsyah.png"
                alt="Logo Koperasi Indonesia"
                width={40}
                height={40}
                className="w-full h-full object-contain"
              />
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

      {/* Edaran Harga */}
      <div className="bg-emerald-50 border-b border-emerald-200">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-emerald-900 leading-tight">Edaran Harga Resmi</p>
                <p className="text-[10px] text-emerald-700 truncate">No. 001/KOP-SYAH/FKDT-SB/VI/2026</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <a
                href="/edaran-kopsyah.pdf"
                download="Edaran-Harga-Kopsyah-FKDT.pdf"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh</span>
              </a>
              <button
                onClick={() => setShowPdf((v) => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold rounded-lg transition-colors"
              >
                {showPdf ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                <span>{showPdf ? "Tutup" : "Lihat"}</span>
              </button>
            </div>
          </div>

          {showPdf && (
            <div className="mt-3 rounded-xl overflow-hidden border border-emerald-300 shadow-md">
              <iframe
                src="/edaran-kopsyah.pdf"
                className="w-full"
                style={{ height: "70vh" }}
                title="Edaran Harga Resmi Kopsyah FKDT"
              />
            </div>
          )}
        </div>
      </div>


      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Filter Kategori & Pencarian */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Category Tabs - 1 Baris Penuh di PC maupun HP */}
          <div className="w-full sm:w-auto overflow-x-auto no-scrollbar">
            <div className="grid grid-cols-4 gap-1 p-1 bg-slate-200/70 rounded-2xl border border-slate-300/80 min-w-[280px] sm:min-w-[360px]">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`py-2 px-2 text-xs font-bold rounded-xl transition-all text-center truncate ${
                    selectedCategory === cat
                      ? "bg-white text-emerald-800 shadow-sm font-extrabold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama barang atau ukuran..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 shadow-sm"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
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
            <span>Pesan / Tanya Admin via WhatsApp (0895-6191-4774)</span>
          </a>
        </div>
      </div>
    </div>
  );
}
