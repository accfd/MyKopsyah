"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ProductData, TransactionData } from "@/lib/data-service";
import { formatRupiah } from "@/lib/format";
import {
  Building,
  Banknote,
  ShoppingBag,
  Printer,
  Search,
  Eye,
  Package,
  ShoppingCart,
  Calendar,
  CheckCircle2,
  Clock,
  X,
} from "lucide-react";
import ReportHeader from "@/components/ReportHeader";
import ReportFooter from "@/components/ReportFooter";

interface DetailModulRow {
  id: number;
  invoiceNumber: string;
  date: string;
  name: string;
  city: string;
  k1: number;
  k2: number;
  k3: number;
  k4: number;
  jmlh: number;
  ket: string;
  kontribusiKoperasi: number;
  kontribusiDpw: number;
}

interface GenericReportRow {
  id: number;
  invoiceNumber: string;
  date: string;
  name: string;
  city: string;
  itemDetails: string;
  totalQty: number;
  totalAmount: number;
  paymentStatus: "Belum Lunas" | "Lunas";
  shippingStatus: "Belum Dikirim" | "Sudah Dikirim";
  notes?: string | null;
}

function formatTanggalSingkat(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const tgl = String(d.getDate()).padStart(2, "0");
    const bln = String(d.getMonth() + 1).padStart(2, "0");
    const thn = String(d.getFullYear()).slice(-2);
    return `${tgl}/${bln}/${thn}`;
  } catch {
    return dateStr;
  }
}

export default function LaporanWilayahClient({
  transactions,
  products,
}: {
  transactions: TransactionData[];
  products: ProductData[];
}) {
  const currentYear = new Date().getFullYear();

  // Tahun yang tersedia otomatis mendeteksi transaksi di database + tahun berjalan (2026, 2027, dst)
  const availableYears = useMemo(() => {
    const yearSet = new Set<number>();
    yearSet.add(currentYear);
    for (const tx of transactions) {
      if (tx.createdAt) {
        const d = new Date(tx.createdAt);
        if (!isNaN(d.getTime())) {
          yearSet.add(d.getFullYear());
        }
      }
    }
    return Array.from(yearSet).sort((a, b) => b - a);
  }, [transactions, currentYear]);

  // Default tahun: tahun dari transaksi terbaru atau tahun berjalan saat ini
  const [selectedYear, setSelectedYear] = useState<string>(() => {
    if (transactions.length > 0) {
      const dates = transactions
        .map((t) => new Date(t.createdAt).getTime())
        .filter((t) => !isNaN(t));
      if (dates.length > 0) {
        return new Date(Math.max(...dates)).getFullYear().toString();
      }
    }
    return currentYear.toString();
  });

  const [selectedCategory, setSelectedCategory] = useState<string>("Buku");
  const [selectedMonth, setSelectedMonth] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showPrintPreview, setShowPrintPreview] = useState<boolean>(false);

  const categories = ["Buku", "Seragam", "Lainnya", "Semua"];

  // 13 Opsi Bulan (Semua Bulan + 12 Bulan Lengkap)
  const months = [
    { value: "ALL", label: "Semua Bulan (Tahun Penuh)" },
    { value: "1", label: "Januari" },
    { value: "2", label: "Februari" },
    { value: "3", label: "Maret" },
    { value: "4", label: "April" },
    { value: "5", label: "Mei" },
    { value: "6", label: "Juni" },
    { value: "7", label: "Juli" },
    { value: "8", label: "Agustus" },
    { value: "9", label: "September" },
    { value: "10", label: "Oktober" },
    { value: "11", label: "November" },
    { value: "12", label: "Desember" },
  ];

  const romanMonths = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

  // Label periode yang elegan, formal, dan dinamis
  const periodeLabel = useMemo(() => {
    if (selectedMonth === "ALL") {
      return `Periode: Tahun Buku ${selectedYear}`;
    }
    const found = months.find((m) => m.value === selectedMonth);
    return found ? `Periode: Bulan ${found.label} ${selectedYear}` : `Periode: Tahun ${selectedYear}`;
  }, [selectedMonth, selectedYear, months]);

  // Nomor dokumen resmi sesuai kategori, bulan, & tahun otomatis
  const documentNumber = useMemo(() => {
    const code =
      selectedCategory === "Buku"
        ? "LAP-MODUL"
        : selectedCategory === "Seragam"
        ? "LAP-SRG"
        : selectedCategory === "Lainnya"
        ? "LAP-LAIN"
        : "LAP-WIL";

    if (selectedMonth === "ALL") {
      const yrShort = selectedYear.slice(-2);
      return `No. Dokumen: 0${yrShort}/${code}/KOPSYAH-FKDT/${selectedYear}`;
    }
    const monthNum = parseInt(selectedMonth, 10);
    const roman = romanMonths[monthNum - 1] || "IX";
    const paddedMonth = String(monthNum).padStart(3, "0");
    return `No. Dokumen: ${paddedMonth}/${code}/KOPSYAH-FKDT/${roman}/${selectedYear}`;
  }, [selectedCategory, selectedMonth, selectedYear]);

  // Map product id to category
  const productCategoryMap = useMemo(() => {
    const map = new Map<number, string>();
    for (const p of products) {
      map.set(p.id, p.category);
    }
    return map;
  }, [products]);

  // Filter transaksi berdasarkan Tahun, Bulan, & Kategori
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (!tx.createdAt) return false;
      const d = new Date(tx.createdAt);
      if (isNaN(d.getTime())) return false;

      // Filter Tahun
      if (d.getFullYear().toString() !== selectedYear) {
        return false;
      }

      // Filter Bulan
      if (selectedMonth !== "ALL") {
        const monthNum = (d.getMonth() + 1).toString();
        if (monthNum !== selectedMonth) {
          return false;
        }
      }

      // Filter Kategori
      if (selectedCategory === "Semua") return true;

      const hasMatchingCategory = tx.items.some((item) => {
        const prodCat = productCategoryMap.get(item.productId) || "";
        const lowerName = item.itemNameSnapshot.toLowerCase();

        if (selectedCategory === "Buku") {
          return prodCat === "Buku" || lowerName.includes("modul") || lowerName.includes("buku");
        }
        if (selectedCategory === "Seragam") {
          return prodCat === "Seragam" || lowerName.includes("batik") || lowerName.includes("seragam");
        }
        if (selectedCategory === "Lainnya") {
          const isBuku = prodCat === "Buku" || lowerName.includes("modul") || lowerName.includes("buku");
          const isSeragam = prodCat === "Seragam" || lowerName.includes("batik") || lowerName.includes("seragam");
          return !isBuku && !isSeragam;
        }
        return true;
      });

      return hasMatchingCategory;
    });
  }, [transactions, selectedYear, selectedMonth, selectedCategory, productCategoryMap]);

  // ─── 1. FORMAT KHUSUS BUKU / MODUL (KELAS I - IV) ───
  const modulRows: DetailModulRow[] = useMemo(() => {
    if (selectedCategory !== "Buku") return [];

    const sorted = [...filteredTransactions].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    return sorted.map((tx) => {
      let k1 = 0;
      let k2 = 0;
      let k3 = 0;
      let k4 = 0;

      for (const item of tx.items) {
        const name = item.itemNameSnapshot.toLowerCase();
        if (name.includes("kelas 1") || name.includes("kelas i ") || name.endsWith("kelas 1")) {
          k1 += item.quantity;
        } else if (name.includes("kelas 2") || name.includes("kelas ii") || name.endsWith("kelas 2")) {
          k2 += item.quantity;
        } else if (name.includes("kelas 3") || name.includes("kelas iii") || name.endsWith("kelas 3")) {
          k3 += item.quantity;
        } else if (name.includes("kelas 4") || name.includes("kelas iv") || name.endsWith("kelas 4")) {
          k4 += item.quantity;
        }
      }

      const jmlh = k1 + k2 + k3 + k4;

      let ket = "";
      if (tx.notes?.includes("BB 50%")) {
        ket = "BB 50%";
      } else if (tx.notes?.includes("BB") || tx.paymentStatus === "Belum Lunas") {
        ket = "BB";
      }

      let kontribusiKoperasi = 0;
      let kontribusiDpw = 0;

      if (tx.notes?.includes("Kontribusi: Koperasi Rp")) {
        const kopMatch = tx.notes.match(/Koperasi Rp ([\d\.]+)/);
        const dpwMatch = tx.notes.match(/DPW Rp ([\d\.]+)/);
        if (kopMatch) kontribusiKoperasi = Number(kopMatch[1].replace(/\./g, ""));
        if (dpwMatch) kontribusiDpw = Number(dpwMatch[1].replace(/\./g, ""));
      } else {
        if (ket.includes("BB") && !(tx.customerNameSnapshot.includes("Sasra Rita") && jmlh === 25)) {
          kontribusiKoperasi = 0;
          kontribusiDpw = 0;
        } else {
          kontribusiKoperasi = jmlh * 1500;
          kontribusiDpw = jmlh * 500;
        }
      }

      return {
        id: tx.id,
        invoiceNumber: tx.invoiceNumber,
        date: tx.createdAt,
        name: tx.customerNameSnapshot,
        city: tx.citySnapshot || "-",
        k1,
        k2,
        k3,
        k4,
        jmlh,
        ket,
        kontribusiKoperasi,
        kontribusiDpw,
      };
    });
  }, [filteredTransactions, selectedCategory]);

  // ─── 2. FORMAT KHUSUS SERAGAM, LAINNYA, & SEMUA ───
  const genericRows: GenericReportRow[] = useMemo(() => {
    if (selectedCategory === "Buku") return [];

    const sorted = [...filteredTransactions].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    return sorted.map((tx) => {
      // Filter items according to category
      const targetItems = tx.items.filter((item) => {
        const prodCat = productCategoryMap.get(item.productId) || "";
        const lowerName = item.itemNameSnapshot.toLowerCase();

        if (selectedCategory === "Seragam") {
          return prodCat === "Seragam" || lowerName.includes("batik") || lowerName.includes("seragam");
        }
        if (selectedCategory === "Lainnya") {
          const isBuku = prodCat === "Buku" || lowerName.includes("modul") || lowerName.includes("buku");
          const isSeragam = prodCat === "Seragam" || lowerName.includes("batik") || lowerName.includes("seragam");
          return !isBuku && !isSeragam;
        }
        return true;
      });

      const itemDetails = targetItems
        .map((it) => `${it.itemNameSnapshot} (${it.quantity} pcs)`)
        .join(", ");

      const totalQty = targetItems.reduce((acc, curr) => acc + curr.quantity, 0);
      const totalAmount = targetItems.reduce((acc, curr) => acc + curr.subtotal, 0);

      return {
        id: tx.id,
        invoiceNumber: tx.invoiceNumber,
        date: tx.createdAt,
        name: tx.customerNameSnapshot,
        city: tx.citySnapshot || "-",
        itemDetails: itemDetails || "-",
        totalQty,
        totalAmount,
        paymentStatus: tx.paymentStatus,
        shippingStatus: tx.shippingStatus,
        notes: tx.notes,
      };
    });
  }, [filteredTransactions, selectedCategory, productCategoryMap]);

  // Search filter
  const searchedModulRows = useMemo(() => {
    if (!searchQuery.trim()) return modulRows;
    const q = searchQuery.toLowerCase();
    return modulRows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.city.toLowerCase().includes(q) ||
        r.ket.toLowerCase().includes(q) ||
        r.invoiceNumber.toLowerCase().includes(q)
    );
  }, [modulRows, searchQuery]);

  const searchedGenericRows = useMemo(() => {
    if (!searchQuery.trim()) return genericRows;
    const q = searchQuery.toLowerCase();
    return genericRows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.city.toLowerCase().includes(q) ||
        r.itemDetails.toLowerCase().includes(q) ||
        r.invoiceNumber.toLowerCase().includes(q)
    );
  }, [genericRows, searchQuery]);

  // Akumulasi Modul
  const totalModul = useMemo(() => {
    return searchedModulRows.reduce(
      (acc, r) => ({
        k1: acc.k1 + r.k1,
        k2: acc.k2 + r.k2,
        k3: acc.k3 + r.k3,
        k4: acc.k4 + r.k4,
        jmlh: acc.jmlh + r.jmlh,
        koperasi: acc.koperasi + r.kontribusiKoperasi,
        dpw: acc.dpw + r.kontribusiDpw,
      }),
      { k1: 0, k2: 0, k3: 0, k4: 0, jmlh: 0, koperasi: 0, dpw: 0 }
    );
  }, [searchedModulRows]);

  // Akumulasi Generic (Seragam / Lainnya / Semua)
  const totalGeneric = useMemo(() => {
    return searchedGenericRows.reduce(
      (acc, r) => ({
        totalQty: acc.totalQty + r.totalQty,
        totalAmount: acc.totalAmount + r.totalAmount,
        lunas: acc.lunas + (r.paymentStatus === "Lunas" ? r.totalAmount : 0),
        belumLunas: acc.belumLunas + (r.paymentStatus === "Belum Lunas" ? r.totalAmount : 0),
      }),
      { totalQty: 0, totalAmount: 0, lunas: 0, belumLunas: 0 }
    );
  }, [searchedGenericRows]);

  const handlePrint = () => {
    window.print();
  };

  // Judul Dokumen Resmi Sesuai Kategori
  const getDocumentTitle = () => {
    if (selectedCategory === "Buku") {
      return "LAPORAN PENJUALAN MODUL BUKU KOPSYAH FKDT";
    }
    if (selectedCategory === "Seragam") {
      return "LAPORAN PENJUALAN SERAGAM BATIK SANTRI & GURU MDTA";
    }
    if (selectedCategory === "Lainnya") {
      return "LAPORAN PENJUALAN PRODUK & AKSESORIS LAINNYA";
    }
    return "LAPORAN REKAPITULASI PENJUALAN & DISTRIBUSI WILAYAH";
  };

  return (
    <div className="space-y-6">
      {/* ─── WEB INTERFACE ONLY (HIDDEN ON PRINT) ─── */}
      <div className="print:hidden space-y-6">
        {/* Page Header: Rapi 1 Baris Sejajar di HP & PC */}
        <div className="flex items-center justify-between gap-2.5">
          <div>
            <h2 className="text-xl sm:text-3xl font-bold text-slate-900">
              Rekap Wilayah
            </h2>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5">
            <button
              type="button"
              onClick={() => setShowPrintPreview(true)}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
              title="Pratinjau Lembar Cetak Kop Surat Resmi"
            >
              <Eye className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Pratinjau Kop</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 sm:px-5 sm:py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer shrink-0"
              title="Cetak Laporan Resmi Kopsyah"
            >
              <Printer className="w-4 h-4 shrink-0" />
              <span>Cetak Resmi</span>
            </button>
          </div>
        </div>

        {/* Toolbar Filter: PC (1 Baris Sejajar) vs HP (3 Baris Bersih Proporsional) */}
        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-2.5">
          {/* Kelompok Kiri di PC (Kategori & Periode Bulan/Tahun Berdampingan) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Baris 1 di HP: 4 Tab Kategori Grid Penuh (Buku, Seragam, Lainnya, Semua) */}
            <div className="w-full sm:w-auto">
              <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/80 w-full sm:w-[320px]">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`py-2 px-1 text-xs font-bold rounded-lg transition-all text-center truncate ${
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

            {/* Baris 2 di HP: Filter Periode Bulan (13 Opsi) & Tahun Dinamis Otomatis */}
            <div className="w-full sm:w-auto flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
              <Calendar className="w-4 h-4 text-emerald-700 shrink-0" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer flex-1 sm:w-auto pr-1"
              >
                {months.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
              <span className="text-slate-300 select-none">|</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-transparent text-xs font-bold text-emerald-900 focus:outline-none cursor-pointer pr-1"
              >
                {availableYears.map((yr) => (
                  <option key={yr} value={yr.toString()}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Baris 3 di HP: Kolom Pencarian Cepat Nama / Kab-Kota (Full Width di HP, Fixed di PC) */}
          <div className="relative w-full md:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari pemesan atau kab/kota..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-600 shadow-sm"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Summary KPI Cards Sesuai Kategori */}
        {selectedCategory === "Buku" ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs uppercase font-bold text-slate-500">Total Modul Terjual</p>
                <h4 className="text-2xl font-black text-slate-900 mt-0.5">
                  {totalModul.jmlh.toLocaleString("id-ID")} Eks
                </h4>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <Banknote className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs uppercase font-bold text-slate-500">Kontribusi Koperasi</p>
                <h4 className="text-2xl font-black text-emerald-800 mt-0.5">
                  {formatRupiah(totalModul.koperasi)}
                </h4>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center shrink-0">
                <Building className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs uppercase font-bold text-slate-500">Kontribusi DPW</p>
                <h4 className="text-2xl font-black text-sky-800 mt-0.5">
                  {formatRupiah(totalModul.dpw)}
                </h4>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs uppercase font-bold text-slate-500">
                  Total {selectedCategory === "Seragam" ? "Seragam Terjual" : "Item Terjual"}
                </p>
                <h4 className="text-2xl font-black text-slate-900 mt-0.5">
                  {totalGeneric.totalQty.toLocaleString("id-ID")} {selectedCategory === "Seragam" ? "Stel" : "Pcs"}
                </h4>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <Banknote className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs uppercase font-bold text-slate-500">Total Penjualan (Lunas)</p>
                <h4 className="text-2xl font-black text-emerald-800 mt-0.5">
                  {formatRupiah(totalGeneric.lunas)}
                </h4>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs uppercase font-bold text-slate-500">Piutang Belum Lunas</p>
                <h4 className="text-2xl font-black text-amber-700 mt-0.5">
                  {formatRupiah(totalGeneric.belumLunas)}
                </h4>
              </div>
            </div>
          </div>
        )}

        {/* ─── TABEL TAMPILAN WEB ─── */}
        {selectedCategory === "Buku" ? (
          /* TABEL FORMAT BUKU MODUL */
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-yellow-50 border-b border-yellow-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 uppercase">
                  {getDocumentTitle()}
                </h3>
                <p className="text-xs font-semibold text-amber-900 mt-0.5 font-mono">
                  {documentNumber} • {periodeLabel}
                </p>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Format tabel resmi Koperasi Syariah FKDT Provinsi Sumatera Barat.
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-yellow-200 text-yellow-900 rounded-full">
                {searchedModulRows.length} Transaksi Tercatat
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-center border-collapse">
                <thead>
                  <tr className="bg-yellow-300 text-slate-900 font-extrabold uppercase border-b border-yellow-400">
                    <th rowSpan={2} className="py-2.5 px-2 border-r border-yellow-400 w-10">NO</th>
                    <th rowSpan={2} className="py-2.5 px-2 border-r border-yellow-400 w-24">Tanggal</th>
                    <th rowSpan={2} className="py-2.5 px-3 border-r border-yellow-400 text-left">Nama Pemesan</th>
                    <th rowSpan={2} className="py-2.5 px-3 border-r border-yellow-400 text-left">Kabupaten/Kota</th>
                    <th colSpan={4} className="py-1.5 px-2 border-r border-yellow-400">KELAS</th>
                    <th rowSpan={2} className="py-2.5 px-2 border-r border-yellow-400 w-14">JMLH</th>
                    <th rowSpan={2} className="py-2.5 px-2 border-r border-yellow-400 w-16">KET</th>
                    <th colSpan={2} className="py-1.5 px-2">KONTRIBUSI</th>
                  </tr>
                  <tr className="bg-yellow-300 text-slate-900 font-extrabold uppercase border-b border-slate-300">
                    <th className="py-1 px-2 border-r border-yellow-400 w-10">I</th>
                    <th className="py-1 px-2 border-r border-yellow-400 w-10">II</th>
                    <th className="py-1 px-2 border-r border-yellow-400 w-10">III</th>
                    <th className="py-1 px-2 border-r border-yellow-400 w-10">IV</th>
                    <th className="py-1 px-2 border-r border-yellow-400 w-24">KOPERASI</th>
                    <th className="py-1 px-2 w-20">DPW</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {searchedModulRows.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="py-8 text-center text-slate-500">
                        Tidak ada transaksi modul pada periode ini.
                      </td>
                    </tr>
                  ) : (
                    searchedModulRows.map((r, i) => (
                      <tr key={r.id} className="hover:bg-slate-50">
                        <td className="py-2 px-2 border-r border-slate-100 font-bold text-slate-400">{i + 1}</td>
                        <td className="py-2 px-2 border-r border-slate-100 font-medium text-slate-600">{formatTanggalSingkat(r.date)}</td>
                        <td className="py-2 px-3 border-r border-slate-100 text-left font-bold text-slate-900">{r.name}</td>
                        <td className="py-2 px-3 border-r border-slate-100 text-left font-semibold text-slate-700">{r.city}</td>
                        <td className="py-2 px-2 border-r border-slate-100">{r.k1 || 0}</td>
                        <td className="py-2 px-2 border-r border-slate-100">{r.k2 || 0}</td>
                        <td className="py-2 px-2 border-r border-slate-100">{r.k3 || 0}</td>
                        <td className="py-2 px-2 border-r border-slate-100">{r.k4 || 0}</td>
                        <td className="py-2 px-2 border-r border-slate-100 font-black bg-yellow-50 text-slate-900">{r.jmlh}</td>
                        <td className="py-2 px-2 border-r border-slate-100 font-bold text-rose-600">{r.ket || "-"}</td>
                        <td className="py-2 px-2 border-r border-slate-100 text-right font-medium text-slate-800">
                          {r.kontribusiKoperasi > 0 ? r.kontribusiKoperasi.toLocaleString("id-ID") : "-"}
                        </td>
                        <td className="py-2 px-2 text-right font-medium text-slate-800">
                          {r.kontribusiDpw > 0 ? r.kontribusiDpw.toLocaleString("id-ID") : "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>

                {/* Footer Rekapitulasi Fisik */}
                <tbody className="border-t-2 border-slate-400 text-slate-900 break-inside-avoid font-semibold">
                  <tr className="bg-yellow-300 font-black border-b border-yellow-400">
                    <td colSpan={4} className="py-2.5 px-3 text-right uppercase border-r border-yellow-400">Jumlah</td>
                    <td className="py-2.5 px-2 border-r border-yellow-400">{totalModul.k1}</td>
                    <td className="py-2.5 px-2 border-r border-yellow-400">{totalModul.k2}</td>
                    <td className="py-2.5 px-2 border-r border-yellow-400">{totalModul.k3}</td>
                    <td className="py-2.5 px-2 border-r border-yellow-400">{totalModul.k4}</td>
                    <td className="py-2.5 px-2 border-r border-yellow-400 bg-yellow-400 text-base">{totalModul.jmlh}</td>
                    <td className="py-2.5 px-2 border-r border-yellow-400"></td>
                    <td className="py-2.5 px-2 text-right border-r border-yellow-400 font-black">{formatRupiah(totalModul.koperasi)}</td>
                    <td className="py-2.5 px-2 text-right font-black">{formatRupiah(totalModul.dpw)}</td>
                  </tr>
                  <tr className="bg-yellow-100 border-b border-yellow-300">
                    <td colSpan={4} className="py-2 px-3 text-right font-bold uppercase border-r border-yellow-300">Jumlah Modul yang dicetak</td>
                    <td className="py-2 px-2 border-r border-yellow-300 font-bold">1000</td>
                    <td className="py-2 px-2 border-r border-yellow-300 font-bold">1000</td>
                    <td className="py-2 px-2 border-r border-yellow-300 font-bold">1000</td>
                    <td className="py-2 px-2 border-r border-yellow-300 font-bold">1000</td>
                    <td className="py-2 px-2 border-r border-yellow-300 font-black">4000</td>
                    <td colSpan={3} className="py-2 px-2 bg-yellow-50"></td>
                  </tr>
                  <tr className="bg-yellow-100 border-b border-yellow-300">
                    <td colSpan={4} className="py-2 px-3 text-right font-bold uppercase border-r border-yellow-300">Sisa Modul</td>
                    <td className="py-2 px-2 border-r border-yellow-300 font-bold">{1000 - totalModul.k1}</td>
                    <td className="py-2 px-2 border-r border-yellow-300 font-bold">{1000 - totalModul.k2}</td>
                    <td className="py-2 px-2 border-r border-yellow-300 font-bold">{1000 - totalModul.k3}</td>
                    <td className="py-2 px-2 border-r border-yellow-300 font-bold">{1000 - totalModul.k4}</td>
                    <td className="py-2 px-2 border-r border-yellow-300 font-black text-rose-700">{4000 - totalModul.jmlh}</td>
                    <td colSpan={3} className="py-2 px-2 bg-yellow-50"></td>
                  </tr>
                  <tr className="bg-emerald-100 border-t-2 border-emerald-400 font-black">
                    <td colSpan={4} className="py-2.5 px-3 text-right uppercase border-r border-emerald-300 text-emerald-950">
                      Modal yang belum kembali
                    </td>
                    <td colSpan={8} className="py-2.5 px-3 font-black text-slate-900 text-sm bg-emerald-200 text-left">
                      Rp {((4000 - totalModul.jmlh) * 24000).toLocaleString("id-ID")}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* TABEL FORMAT SERAGAM, LAINNYA, ATAU SEMUA */
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-emerald-50 border-b border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 uppercase">
                  {getDocumentTitle()}
                </h3>
                <p className="text-xs font-semibold text-emerald-900 mt-0.5 font-mono">
                  {documentNumber} • {periodeLabel}
                </p>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Daftar transaksi penjualan & penyaluran produk se-Sumatera Barat.
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-emerald-200 text-emerald-900 rounded-full">
                {searchedGenericRows.length} Transaksi Tercatat
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-emerald-700 text-white font-extrabold uppercase">
                    <th className="py-3 px-3 text-center w-10">NO</th>
                    <th className="py-3 px-3 text-center w-24">Tanggal</th>
                    <th className="py-3 px-4">Nama Pemesan</th>
                    <th className="py-3 px-4">Kabupaten/Kota</th>
                    <th className="py-3 px-4">Rincian Barang & Ukuran</th>
                    <th className="py-3 px-3 text-center w-20">Jmlh</th>
                    <th className="py-3 px-4 text-right w-28">Total Nilai</th>
                    <th className="py-3 px-3 text-center w-24">Status Bayar</th>
                    <th className="py-3 px-3 text-center w-24">Status Kirim</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {searchedGenericRows.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-500">
                        <div className="space-y-2">
                          <Package className="w-8 h-8 text-slate-400 mx-auto" />
                          <p>Tidak ada transaksi untuk kategori {selectedCategory} pada periode ini.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    searchedGenericRows.map((r, i) => (
                      <tr key={r.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 text-center font-bold text-slate-400">{i + 1}</td>
                        <td className="py-2.5 px-3 text-center text-slate-600">{formatTanggalSingkat(r.date)}</td>
                        <td className="py-2.5 px-4 font-bold text-slate-900">{r.name}</td>
                        <td className="py-2.5 px-4 font-semibold text-slate-700">{r.city}</td>
                        <td className="py-2.5 px-4 text-slate-800">{r.itemDetails}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-slate-900 bg-slate-50">
                          {r.totalQty} {selectedCategory === "Seragam" ? "Stel" : "Pcs"}
                        </td>
                        <td className="py-2.5 px-4 text-right font-extrabold text-emerald-800">
                          {formatRupiah(r.totalAmount)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              r.paymentStatus === "Lunas"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {r.paymentStatus}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              r.shippingStatus === "Sudah Dikirim"
                                ? "bg-sky-100 text-sky-800"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {r.shippingStatus}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>

                {/* Footer Akumulasi Generic */}
                {searchedGenericRows.length > 0 && (
                  <tbody className="border-t-2 border-emerald-600 font-extrabold bg-emerald-50 text-slate-900">
                    <tr>
                      <td colSpan={5} className="py-3 px-4 text-right uppercase">
                        TOTAL REKAPITULASI
                      </td>
                      <td className="py-3 px-3 text-center font-black text-sm text-emerald-950">
                        {totalGeneric.totalQty} {selectedCategory === "Seragam" ? "Stel" : "Pcs"}
                      </td>
                      <td className="py-3 px-4 text-right font-black text-sm text-emerald-900">
                        {formatRupiah(totalGeneric.totalAmount)}
                      </td>
                      <td colSpan={2} className="py-3 px-4 text-center text-xs font-bold text-emerald-800">
                        Lunas: {formatRupiah(totalGeneric.lunas)} | Belum: {formatRupiah(totalGeneric.belumLunas)}
                      </td>
                    </tr>
                  </tbody>
                )}
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ─── MODAL POPUP PRATINJAU KOP SURAT & LEMBAR CETAK RESMI ─── */}
      {showPrintPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-slate-50 border-b border-slate-200 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    Pratinjau Lembar Cetak Resmi
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {documentNumber} • {periodeLabel}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowPrintPreview(false)}
                  className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors cursor-pointer"
                  title="Tutup Pratinjau"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: Kertas Pratinjau A4 Scrollable */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-8 bg-slate-100/70">
              <div className="bg-white text-black p-4 sm:p-8 rounded-xl shadow-md border border-slate-200 max-w-3xl mx-auto text-xs">
                {/* Kop Surat & Judul Dokumen Cetak */}
                <ReportHeader
                  title={getDocumentTitle()}
                  documentNumber={documentNumber}
                  period={periodeLabel}
                />

                {/* Tabel Pratinjau Sesuai Kategori */}
                {selectedCategory === "Buku" ? (
                  <div className="overflow-x-auto mb-6">
                    <table className="w-full text-[10px] text-center border-collapse border border-black">
                      <thead>
                        <tr className="bg-yellow-200 text-black font-extrabold uppercase border-b border-black">
                          <th rowSpan={2} className="py-1 px-1 border border-black w-8">NO</th>
                          <th rowSpan={2} className="py-1 px-1 border border-black w-16">Tanggal</th>
                          <th rowSpan={2} className="py-1 px-2 border border-black text-left">Nama Pemesan</th>
                          <th rowSpan={2} className="py-1 px-2 border border-black text-left">Kabupaten/Kota</th>
                          <th colSpan={4} className="py-1 px-1 border border-black">KELAS</th>
                          <th rowSpan={2} className="py-1 px-1 border border-black w-10">JMLH</th>
                          <th rowSpan={2} className="py-1 px-1 border border-black w-12">KET</th>
                          <th colSpan={2} className="py-1 px-1 border border-black">KONTRIBUSI</th>
                        </tr>
                        <tr className="bg-yellow-200 text-black font-extrabold uppercase border-b border-black">
                          <th className="py-0.5 px-1 border border-black w-8">I</th>
                          <th className="py-0.5 px-1 border border-black w-8">II</th>
                          <th className="py-0.5 px-1 border border-black w-8">III</th>
                          <th className="py-0.5 px-1 border border-black w-8">IV</th>
                          <th className="py-0.5 px-1 border border-black w-20">KOPERASI</th>
                          <th className="py-0.5 px-1 border border-black w-16">DPW</th>
                        </tr>
                      </thead>
                      <tbody>
                        {searchedModulRows.map((r, i) => (
                          <tr key={r.id} className="border-b border-black/30">
                            <td className="py-1 px-1 border border-black/40 font-bold">{i + 1}</td>
                            <td className="py-1 px-1 border border-black/40">{formatTanggalSingkat(r.date)}</td>
                            <td className="py-1 px-2 border border-black/40 text-left font-bold">{r.name}</td>
                            <td className="py-1 px-2 border border-black/40 text-left font-semibold">{r.city}</td>
                            <td className="py-1 px-1 border border-black/40">{r.k1 || 0}</td>
                            <td className="py-1 px-1 border border-black/40">{r.k2 || 0}</td>
                            <td className="py-1 px-1 border border-black/40">{r.k3 || 0}</td>
                            <td className="py-1 px-1 border border-black/40">{r.k4 || 0}</td>
                            <td className="py-1 px-1 border border-black/40 font-black">{r.jmlh}</td>
                            <td className="py-1 px-1 border border-black/40 font-bold">{r.ket || "-"}</td>
                            <td className="py-1 px-1 border border-black/40 text-right">
                              {r.kontribusiKoperasi > 0 ? r.kontribusiKoperasi.toLocaleString("id-ID") : "-"}
                            </td>
                            <td className="py-1 px-1 border border-black/40 text-right">
                              {r.kontribusiDpw > 0 ? r.kontribusiDpw.toLocaleString("id-ID") : "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tbody className="border-t-2 border-black text-black font-semibold">
                        <tr className="bg-yellow-200 font-black border-b border-black">
                          <td colSpan={4} className="py-1.5 px-2 text-right uppercase border border-black">Jumlah</td>
                          <td className="py-1.5 px-1 border border-black">{totalModul.k1}</td>
                          <td className="py-1.5 px-1 border border-black">{totalModul.k2}</td>
                          <td className="py-1.5 px-1 border border-black">{totalModul.k3}</td>
                          <td className="py-1.5 px-1 border border-black">{totalModul.k4}</td>
                          <td className="py-1.5 px-1 border border-black font-black">{totalModul.jmlh}</td>
                          <td className="py-1.5 px-1 border border-black"></td>
                          <td className="py-1.5 px-1 text-right border border-black font-black">{totalModul.koperasi.toLocaleString("id-ID")}</td>
                          <td className="py-1.5 px-1 text-right border border-black font-black">{totalModul.dpw.toLocaleString("id-ID")}</td>
                        </tr>
                        <tr className="border-b border-black">
                          <td colSpan={4} className="py-1 px-2 text-right font-bold uppercase border border-black">Jumlah Modul yang dicetak</td>
                          <td className="py-1 px-1 border border-black font-bold">1000</td>
                          <td className="py-1 px-1 border border-black font-bold">1000</td>
                          <td className="py-1 px-1 border border-black font-bold">1000</td>
                          <td className="py-1 px-1 border border-black font-bold">1000</td>
                          <td className="py-1 px-1 border border-black font-black">4000</td>
                          <td colSpan={3} className="py-1 px-1 border border-black"></td>
                        </tr>
                        <tr className="border-b border-black">
                          <td colSpan={4} className="py-1 px-2 text-right font-bold uppercase border border-black">Sisa Modul</td>
                          <td className="py-1 px-1 border border-black font-bold">{1000 - totalModul.k1}</td>
                          <td className="py-1 px-1 border border-black font-bold">{1000 - totalModul.k2}</td>
                          <td className="py-1 px-1 border border-black font-bold">{1000 - totalModul.k3}</td>
                          <td className="py-1 px-1 border border-black font-bold">{1000 - totalModul.k4}</td>
                          <td className="py-1 px-1 border border-black font-black">{4000 - totalModul.jmlh}</td>
                          <td colSpan={3} className="py-1 px-1 border border-black"></td>
                        </tr>
                        <tr className="font-black border border-black">
                          <td colSpan={4} className="py-1.5 px-2 text-right uppercase border border-black">Modal yang belum kembali</td>
                          <td colSpan={8} className="py-1.5 px-2 border border-black font-black text-left">
                            Rp {((4000 - totalModul.jmlh) * 24000).toLocaleString("id-ID")}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="overflow-x-auto mb-6">
                    <table className="w-full text-[10px] text-left border-collapse border border-black">
                      <thead>
                        <tr className="bg-slate-200 text-black font-extrabold uppercase border-b border-black">
                          <th className="py-1.5 px-1 text-center border border-black w-8">NO</th>
                          <th className="py-1.5 px-1 text-center border border-black w-16">Tanggal</th>
                          <th className="py-1.5 px-2 border border-black">Nama Pemesan</th>
                          <th className="py-1.5 px-2 border border-black">Kabupaten/Kota</th>
                          <th className="py-1.5 px-2 border border-black">Rincian Barang & Ukuran</th>
                          <th className="py-1.5 px-1 text-center border border-black w-14">Jmlh</th>
                          <th className="py-1.5 px-2 text-right border border-black w-24">Total Nilai</th>
                          <th className="py-1.5 px-1 text-center border border-black w-16">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {searchedGenericRows.map((r, i) => (
                          <tr key={r.id} className="border-b border-black/30">
                            <td className="py-1 px-1 text-center border border-black/40 font-bold">{i + 1}</td>
                            <td className="py-1 px-1 text-center border border-black/40">{formatTanggalSingkat(r.date)}</td>
                            <td className="py-1 px-2 border border-black/40 font-bold">{r.name}</td>
                            <td className="py-1 px-2 border border-black/40 font-semibold">{r.city}</td>
                            <td className="py-1 px-2 border border-black/40">{r.itemDetails}</td>
                            <td className="py-1 px-1 text-center border border-black/40 font-bold">
                              {r.totalQty} {selectedCategory === "Seragam" ? "Stel" : "Pcs"}
                            </td>
                            <td className="py-1 px-2 text-right border border-black/40 font-extrabold">
                              {formatRupiah(r.totalAmount)}
                            </td>
                            <td className="py-1 px-1 text-center border border-black/40 font-semibold">
                              {r.paymentStatus}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tbody className="border-t-2 border-black font-extrabold bg-slate-100">
                        <tr>
                          <td colSpan={5} className="py-2 px-2 text-right uppercase border border-black">
                            TOTAL KESELURUHAN
                          </td>
                          <td className="py-2 px-1 text-center border border-black font-black">
                            {totalGeneric.totalQty} {selectedCategory === "Seragam" ? "Stel" : "Pcs"}
                          </td>
                          <td className="py-2 px-2 text-right border border-black font-black">
                            {formatRupiah(totalGeneric.totalAmount)}
                          </td>
                          <td className="py-2 px-1 text-center border border-black text-[9px]">
                            Lunas: {formatRupiah(totalGeneric.lunas)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                <ReportFooter />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── DEDICATED OFFICIAL PRINTABLE REPORT (MODEL A: MULTI-HALAMAN STANDAR PROFESIONAL) ─── */}
      <div className="hidden print:block text-black bg-white w-full">
        {/* Kop Surat Resmi Lengkap (Muncul di Halaman 1 di atas Tabel) */}
        <ReportHeader
          title={getDocumentTitle()}
          documentNumber={documentNumber}
          period={periodeLabel}
          className="mb-3"
        />

        {/* ─── TABEL CETAK MULTI-HALAMAN MODEL A ─── */}
        {selectedCategory === "Buku" ? (
          /* TABEL MODUL BUKU DENGAN RUNNING HEADER & RUNNING FOOTER */
          <table className="w-full text-[9.5px] text-center border-collapse border border-black">
            <thead>
              {/* Running Header Tipis 1 Baris di Atas Setiap Halaman */}
              <tr className="border-b border-black">
                <th colSpan={12} className="py-1 px-1 text-left text-[8.5px] font-semibold text-black uppercase tracking-wider">
                  KOPSYAH FKDT SUMBAR • {getDocumentTitle()} • {periodeLabel}
                </th>
              </tr>
              {/* Judul Kolom Tabel Resmi */}
              <tr className="bg-yellow-200 text-black font-extrabold uppercase border-b border-black">
                <th rowSpan={2} className="py-1 px-1 border border-black w-8">NO</th>
                <th rowSpan={2} className="py-1 px-1 border border-black w-16">Tanggal</th>
                <th rowSpan={2} className="py-1 px-2 border border-black text-left">Nama Pemesan</th>
                <th rowSpan={2} className="py-1 px-2 border border-black text-left">Kabupaten/Kota</th>
                <th colSpan={4} className="py-1 px-1 border border-black">KELAS</th>
                <th rowSpan={2} className="py-1 px-1 border border-black w-10">JMLH</th>
                <th rowSpan={2} className="py-1 px-1 border border-black w-12">KET</th>
                <th colSpan={2} className="py-1 px-1 border border-black">KONTRIBUSI</th>
              </tr>
              <tr className="bg-yellow-200 text-black font-extrabold uppercase border-b border-black">
                <th className="py-0.5 px-1 border border-black w-8">I</th>
                <th className="py-0.5 px-1 border border-black w-8">II</th>
                <th className="py-0.5 px-1 border border-black w-8">III</th>
                <th className="py-0.5 px-1 border border-black w-8">IV</th>
                <th className="py-0.5 px-1 border border-black w-20">KOPERASI</th>
                <th className="py-0.5 px-1 border border-black w-16">DPW</th>
              </tr>
            </thead>

            <tbody>
              {searchedModulRows.map((r, i) => (
                <tr key={r.id} className="border-b border-black/30">
                  <td className="py-1 px-1 border border-black/40 font-bold">{i + 1}</td>
                  <td className="py-1 px-1 border border-black/40">{formatTanggalSingkat(r.date)}</td>
                  <td className="py-1 px-2 border border-black/40 text-left font-bold">{r.name}</td>
                  <td className="py-1 px-2 border border-black/40 text-left font-semibold">{r.city}</td>
                  <td className="py-1 px-1 border border-black/40">{r.k1 || 0}</td>
                  <td className="py-1 px-1 border border-black/40">{r.k2 || 0}</td>
                  <td className="py-1 px-1 border border-black/40">{r.k3 || 0}</td>
                  <td className="py-1 px-1 border border-black/40">{r.k4 || 0}</td>
                  <td className="py-1 px-1 border border-black/40 font-black">{r.jmlh}</td>
                  <td className="py-1 px-1 border border-black/40 font-bold">{r.ket || "-"}</td>
                  <td className="py-1 px-1 border border-black/40 text-right">
                    {r.kontribusiKoperasi > 0 ? r.kontribusiKoperasi.toLocaleString("id-ID") : "-"}
                  </td>
                  <td className="py-1 px-1 border border-black/40 text-right">
                    {r.kontribusiDpw > 0 ? r.kontribusiDpw.toLocaleString("id-ID") : "-"}
                  </td>
                </tr>
              ))}
            </tbody>

            {/* Running Footer Berulang di Bawah Setiap Halaman Cetak */}
            <tfoot className="print-running-footer">
              <tr>
                <td colSpan={12} className="pt-2 text-[8px] text-black border-t border-black/40">
                  <div className="flex justify-between items-center font-medium">
                    <span>Dicetak melalui Sistem MyKopsyah • Dokumen Resmi Logistik & Keuangan</span>
                    <span>Koperasi Syariah FKDT Prov. Sumatera Barat</span>
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        ) : (
          /* TABEL SERAGAM, LAINNYA, ATAU SEMUA */
          <table className="w-full text-[9.5px] text-left border-collapse border border-black">
            <thead>
              {/* Running Header Tipis 1 Baris di Atas Setiap Halaman */}
              <tr className="border-b border-black">
                <th colSpan={8} className="py-1 px-1 text-left text-[8.5px] font-semibold text-black uppercase tracking-wider">
                  KOPSYAH FKDT SUMBAR • {getDocumentTitle()} • {periodeLabel}
                </th>
              </tr>
              {/* Judul Kolom Tabel Resmi */}
              <tr className="bg-slate-200 text-black font-extrabold uppercase border-b border-black">
                <th className="py-1 px-1 text-center border border-black w-8">NO</th>
                <th className="py-1 px-1 text-center border border-black w-16">Tanggal</th>
                <th className="py-1 px-2 border border-black">Nama Pemesan</th>
                <th className="py-1 px-2 border border-black">Kabupaten/Kota</th>
                <th className="py-1 px-2 border border-black">Rincian Barang & Ukuran</th>
                <th className="py-1 px-1 text-center border border-black w-14">Jmlh</th>
                <th className="py-1 px-2 text-right border border-black w-24">Total Nilai</th>
                <th className="py-1 px-1 text-center border border-black w-16">Status</th>
              </tr>
            </thead>

            <tbody>
              {searchedGenericRows.map((r, i) => (
                <tr key={r.id} className="border-b border-black/30">
                  <td className="py-1 px-1 text-center border border-black/40 font-bold">{i + 1}</td>
                  <td className="py-1 px-1 text-center border border-black/40">{formatTanggalSingkat(r.date)}</td>
                  <td className="py-1 px-2 border border-black/40 font-bold">{r.name}</td>
                  <td className="py-1 px-2 border border-black/40 font-semibold">{r.city}</td>
                  <td className="py-1 px-2 border border-black/40">{r.itemDetails}</td>
                  <td className="py-1 px-1 text-center border border-black/40 font-bold">
                    {r.totalQty} {selectedCategory === "Seragam" ? "Stel" : "Pcs"}
                  </td>
                  <td className="py-1 px-2 text-right border border-black/40 font-extrabold">
                    {formatRupiah(r.totalAmount)}
                  </td>
                  <td className="py-1 px-1 text-center border border-black/40 font-semibold">
                    {r.paymentStatus}
                  </td>
                </tr>
              ))}
            </tbody>

            {/* Running Footer Berulang di Bawah Setiap Halaman Cetak */}
            <tfoot className="print-running-footer">
              <tr>
                <td colSpan={8} className="pt-2 text-[8px] text-black border-t border-black/40">
                  <div className="flex justify-between items-center font-medium">
                    <span>Dicetak melalui Sistem MyKopsyah • Dokumen Resmi Logistik & Keuangan</span>
                    <span>Koperasi Syariah FKDT Prov. Sumatera Barat</span>
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        )}

        {/* ─── BLOK AKUMULASI PENUTUP & TANDA TANGAN (HANYA DI HALAMAN TERAKHIR) ─── */}
        <div className="mt-3 break-inside-avoid">
          {selectedCategory === "Buku" ? (
            <table className="w-full text-[9.5px] text-center border-collapse border border-black mb-4">
              <tbody>
                <tr className="bg-yellow-200 font-black border-b border-black">
                  <td colSpan={4} className="py-1 px-2 text-right uppercase border border-black">Jumlah</td>
                  <td className="py-1 px-1 border border-black w-8">{totalModul.k1}</td>
                  <td className="py-1 px-1 border border-black w-8">{totalModul.k2}</td>
                  <td className="py-1 px-1 border border-black w-8">{totalModul.k3}</td>
                  <td className="py-1 px-1 border border-black w-8">{totalModul.k4}</td>
                  <td className="py-1 px-1 border border-black font-black w-10">{totalModul.jmlh}</td>
                  <td className="py-1 px-1 border border-black w-12"></td>
                  <td className="py-1 px-1 text-right border border-black font-black w-20">{totalModul.koperasi.toLocaleString("id-ID")}</td>
                  <td className="py-1 px-1 text-right border border-black font-black w-16">{totalModul.dpw.toLocaleString("id-ID")}</td>
                </tr>
                <tr className="border-b border-black">
                  <td colSpan={4} className="py-1 px-2 text-right font-bold uppercase border border-black">Jumlah Modul yang dicetak</td>
                  <td className="py-1 px-1 border border-black font-bold">1000</td>
                  <td className="py-1 px-1 border border-black font-bold">1000</td>
                  <td className="py-1 px-1 border border-black font-bold">1000</td>
                  <td className="py-1 px-1 border border-black font-bold">1000</td>
                  <td className="py-1 px-1 border border-black font-black">4000</td>
                  <td colSpan={3} className="py-1 px-1 border border-black"></td>
                </tr>
                <tr className="border-b border-black">
                  <td colSpan={4} className="py-1 px-2 text-right font-bold uppercase border border-black">Sisa Modul</td>
                  <td className="py-1 px-1 border border-black font-bold">{1000 - totalModul.k1}</td>
                  <td className="py-1 px-1 border border-black font-bold">{1000 - totalModul.k2}</td>
                  <td className="py-1 px-1 border border-black font-bold">{1000 - totalModul.k3}</td>
                  <td className="py-1 px-1 border border-black font-bold">{1000 - totalModul.k4}</td>
                  <td className="py-1 px-1 border border-black font-black">{4000 - totalModul.jmlh}</td>
                  <td colSpan={3} className="py-1 px-1 border border-black"></td>
                </tr>
                <tr className="font-black border border-black">
                  <td colSpan={4} className="py-1 px-2 text-right uppercase border border-black">Modal yang belum kembali</td>
                  <td colSpan={8} className="py-1 px-2 border border-black font-black text-left">
                    Rp {((4000 - totalModul.jmlh) * 24000).toLocaleString("id-ID")}
                  </td>
                </tr>
              </tbody>
            </table>
          ) : (
            <div className="border border-black p-2 bg-slate-100 font-extrabold flex justify-between items-center text-xs mb-4">
              <span>TOTAL KESELURUHAN: {totalGeneric.totalQty} {selectedCategory === "Seragam" ? "Stel" : "Pcs"}</span>
              <span className="text-sm">Nilai Total: {formatRupiah(totalGeneric.totalAmount)}</span>
              <span>Lunas: {formatRupiah(totalGeneric.lunas)} | Belum: {formatRupiah(totalGeneric.belumLunas)}</span>
            </div>
          )}

          {/* Tanda Tangan Formal Pengawas & Pengurus (Di Halaman Terakhir Saja) */}
          <ReportFooter hideNote={true} className="mt-4" />
        </div>
      </div>
    </div>
  );
}
