# Referensi Edaran Kopsyah FKDT Sumbar
**Nomor:** 001/KOP-SYAH/FKDT-SB/VI/2026  
**Tanggal:** 24 Juni 2026

---

## A. Batik Guru MDT Nasional
- **Harga ke Koperasi (DPC bayar ke DPW):** Rp 115.000
- **Breakdown harga:**
  - Pengelolaan Koperasi: Rp 5.000
  - Kas DPW: Rp 5.000
  - Kontribusi DPC FKDT: Rp 5.000
  - Sisa (modal/harga beli): Rp 100.000

---

## B. Seragam Batik Santri MDTA (belum termasuk peci/jilbab)

| No | Ukuran   | Harga ke MDT/Santri |
|----|----------|---------------------|
| 1  | Size 2-3 | Rp 125.000          |
| 2  | Size 4-6 | Rp 130.000          |
| 3  | Size 7-9 | Rp 140.000          |
| 4  | Size 10+ | Rp 150.000          |

- **Breakdown harga:**
  - Pengelolaan Koperasi: Rp 2.000
  - Kas DPW: Rp 3.000
  - Kontribusi DPC FKDT: Rp 5.000

---

## C. Modul Santri Shaleh dan Pintar

> **⚠️ PENTING:** Edaran hanya menyebut Semester 1 secara eksplisit, tapi ada Semester 2 juga (konfirmasi dari user: 8 buku total, 4 kelas × 2 semester).

- **Harga ke MDT/Santri (harga jual akhir):** Rp 27.000
- **Harga ke Koperasi (DPC bayar ke DPW):** Rp 24.000
- **Breakdown harga Rp 27.000:**
  - Pengelolaan Koperasi (DPW): Rp 1.500
  - Kas DPW: Rp 500
  - Pengelolaan Kabupaten/Kota (DPC): Rp 3.000
  - Harga modal ke Koperasi: Rp 24.000 ← **ini yang dicatat di sistem sebagai harga**

### Struktur Produk Buku (yang benar):
- **8 varian** total: Kelas I, II, III, IV × Semester 1 dan Semester 2
- Setiap kelas per semester = buku BERBEDA (isi berbeda, stok berbeda)
- Harga semua kelas SAMA = Rp 24.000 (harga ke koperasi)
- Stok per kelas per semester = ~1000 buku (berdasarkan laporan)

### Kontribusi dari laporan penjualan:
- Per buku terjual → Koperasi dapat Rp 1.500, DPW dapat Rp 500
- Total kontribusi per buku = Rp 2.000
- Sisanya (Rp 22.000) = modal yang harus dikembalikan ke koperasi
- "Modal yang belum kembali" = buku sudah tersebar tapi kontribusi belum dibayar

### Alur transaksi buku (model laporan):
- Satu transaksi = satu pemesan (DPC/kepala/guru/ortu)
- Satu transaksi bisa include Kelas I + II + III + IV dengan jumlah berbeda
- Laporan direkap PER BULAN
- Output laporan: tanggal, nama pemesan, kota, jumlah per kelas, total, keterangan BB (Belum Bayar?), kontribusi koperasi, kontribusi DPW

---

## Catatan Sistem (Seed yang Perlu Diperbarui)

### ❌ Seed SALAH (sekarang):
```
Produk: "Modul Santri Shaleh dan Pintar"
  Variant: "Semester 1" — Rp 27.000
  Variant: "Semester 2" — Rp 27.000
```

### ✅ Seed yang BENAR:
```
Produk: "Modul Santri Shaleh dan Pintar - Semester 1"
  Variant: "Kelas I"   — Rp 24.000
  Variant: "Kelas II"  — Rp 24.000
  Variant: "Kelas III" — Rp 24.000
  Variant: "Kelas IV"  — Rp 24.000

Produk: "Modul Santri Shaleh dan Pintar - Semester 2"
  Variant: "Kelas I"   — Rp 24.000
  Variant: "Kelas II"  — Rp 24.000
  Variant: "Kelas III" — Rp 24.000
  Variant: "Kelas IV"  — Rp 24.000
```
