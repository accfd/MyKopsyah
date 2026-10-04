# RANCANGAN DESAIN UI/UX & ARSITEKTUR TEKNOLOGI
## Sistem Informasi Stok & Penjualan "MyKopsyah"

**Dokumen:** `DESIGN.md`  
**Status:** Final Draft Architecture & Design Blueprint  
**Basis Acuan:** `PRD_MyKopsyah.md`  
**Target Deployment:** Vercel (Free Hobby Tier) + Neon Serverless PostgreSQL (Free Tier)

---

## 1. Prinsip Desain & Filosofi UI/UX

Sistem MyKopsyah dirancang dengan mengedepankan **Senior-Friendly & Zero-Friction** bagi Admin Kopsyah yang berusia senior dan awam teknologi, sekaligus menyajikan tampilan publik yang cepat, bersih, dan modern bagi para pelanggan/instansi mitra.

### 4 Pilar Utama Desain:
1. **Zero Jargon (Bahasa Indonesia Ramah & Sehari-hari):**
   * Tidak ada istilah teknis bahasa Inggris seperti *Inventory Inflow, Aging Receivables, SKU Generator, Checkout*.
   * Menggunakan istilah yang akrab: **Barang Masuk, Catat Penjualan, Belum Lunas, Sudah Lunas, Belum Dikirim, Sudah Dikirim, Salin Link Stok, Salin Nota WA**.
2. **Sentuhan Ramah Pengguna Senior (High Ergonomics & Contrast):**
   * Ukuran teks dasar (*body text*) minimal **16px** di ponsel agar nyaman dibaca tanpa kacamata.
   * Ukuran area sentuh (*touch target*) tombol minimal **48px x 48px**.
   * Menghindari menu tersembunyi yang rumit (*nested hamburger menus*); fungsi esensial selalu terlihat dalam 1–2 kali sentuhan.
3. **Mobile-First Responsive Layout:**
   * Di ponsel: Menggunakan navigasi bawah (*Bottom Navigation Bar*) yang mudah dijangkau ibu jari, ditambah bilah ringkasan total mengambang (*Sticky Bottom Bar*) saat transaksi.
   * Di laptop/komputer: Otomatis berubah menjadi antarmuka dasbor dengan bilah samping (*Sidebar*) yang leluasa.
4. **Keamanan Transaksi & Kecepatan Responsif:**
   * Perhitungan subtotal dan total harga 100% instan (*instant client-side preview*).
   * Validasi stok sebelum nota disimpan untuk mencegah minus.

---

## 2. Pilihan Arsitektur & Teknologi (100% Siap Deploy di Vercel)

Kombinasi teknologi dipilih secara presisi agar **100% gratis secara operasional**, tidak memerlukan pengelolaan server fisik, dan bekerja optimal di infrastruktur serverless Vercel:

```mermaid
flowchart LR
    A[Browser HP/Laptop Admin & Pelanggan] -->|HTTPS Requests| B[Vercel Serverless Platform]
    subgraph Vercel
        B --> C[Next.js App Router]
        C --> D[Server Actions & API Routes]
    end
    D -->|Pooling Connection over WebSocket/HTTPS| E[(Neon Serverless PostgreSQL)]
```

### Rincian Tech Stack:

| Lapisan | Pilihan Teknologi | Alasan Pemilihan & Keunggulan |
|---|---|---|
| **Framework Utama** | **Next.js (App Router, React 19, TypeScript)** | First-class citizen di Vercel; performa Server-Side Rendering (SSR) super cepat, mendukung Server Actions tanpa perlu setup REST API terpisah, dan SEO-friendly untuk halaman publik. |
| **Styling & UI Kit** | **Tailwind CSS + Lucide React Icons** | Desain clean, responsif fleksibel tanpa bloating file CSS; icon representatif berukuran jelas; mendukung utility-first class yang mudah dirawat. |
| **Database Cloud** | **Neon Serverless PostgreSQL (Free Tier)** | 100% kompatibel dengan Vercel, free tier berkapasitas besar, mendukung koneksi serverless pooling (`@neondatabase/serverless`) bebas kendala kehabisan koneksi (*connection exhaustion*), dan *zero maintenance*. |
| **ORM / Database Layer** | **Drizzle ORM** (atau Prisma) | Sangat ringan, ukuran bundel kecil (cepat di serverless Vercel), *type-safe*, serta migrasi skema database yang cepat dan andal. |
| **Autentikasi Admin** | **Encrypted Session Cookie (Jose / Iron-Session)** | Single-Admin dengan kata sandi / PIN master. Tidak membutuhkan layanan auth pihak ketiga yang berbayar; sesi tersimpan aman di cookie browser (tidak gampang logout sendiri). |
| **Komponen Interaktif** | **Headless UI / Radix Primitives** | Aksesibilitas tinggi, modal dialog cepat, dropdown pemilihan varian yang nyaman disentuh di layar sentuh ponsel. |

---

## 3. Sistem Desain Visual (Tema Hijau Emerald Syariah)

Nuansa visual mencerminkan identitas Koperasi Syariah yang amanah, sejuk, islami, dan profesional dengan palet warna bernilai kontras tinggi:

### 3.1 Palet Warna

| Elemen | Kode Warna | Contoh Penggunaan |
|---|---|---|
| **Primary (Emerald 700)** | `#047857` | Header utama, tombol aksi primer ("Simpan Penjualan", "Simpan Stok"), status "Lunas" |
| **Primary Hover (Emerald 800)** | `#065f46` | Efek hover / saat tombol ditekan |
| **Primary Light (Emerald 50)** | `#ecfdf5` | Latar belakang kartu highlight, banner informasi, badge status sukses |
| **Secondary Accent (Amber 500)**| `#f59e0b` | Status "Belum Lunas", peringatan "Stok Menipis" |
| **Alert/Danger (Rose 600)** | `#e11d48` | Status "Stok Habis", tombol "Hapus Transaksi", pembatalan |
| **Info / Shipping (Sky 600)** | `#0284c7` | Status "Sudah Dikirim" |
| **Neutral Background** | `#f8fafc` (Slate 50) | Warna latar belakang seluruh halaman aplikasi (bersih, teduh, tidak menyilaukan) |
| **Surface / Card Background** | `#ffffff` (Pure White)| Kartu data, modal popup, tabel |
| **Text Primary** | `#0f172a` (Slate 900) | Teks judul, angka harga, nama produk (kontras maksimal) |
| **Text Muted** | `#475569` (Slate 600) | Keterangan tambahan, catatan tanggal, placeholder |

### 3.2 Tipografi
* **Font Family:** `Plus Jakarta Sans` atau `Inter` (Font Google bebas lisensi, sans-serif modern dengan tingkat keterbacaan angka dan huruf tinggi).
* **Skala Ukuran Teks:**
  * **H1 / Judul Halaman:** 24px – 28px (Bold)
  * **H2 / Subjudul / Nama Produk:** 18px – 20px (Semi-Bold)
  * **Body / Teks Input:** 16px (Regular/Medium) — *Mencegah auto-zoom di browser Safari/Chrome iOS*
  * **Caption / Label Kecil:** 13px – 14px (Medium)

---

## 4. Arsitektur Halaman & Navigasi

Sistem terdiri dari **2 area utama**: Area Pengelola (Admin Protected) dan Halaman Publik (Public Read-Only).

```
/
├── (admin)/
│   ├── /login                     -> Layar Masuk Admin (PIN / Sandi)
│   ├── /dashboard                 -> Dasbor Ringkasan KPI & Stok Kritis
│   ├── /transaksi                 -> Riwayat Penjualan & Filter Piutang
│   ├── /transaksi/baru            -> Halaman Kasir / Catat Pesanan Baru
│   ├── /transaksi/[id]            -> Detail Nota, Tombol Cetak & WA
│   ├── /produk                    -> Katalog Barang & Form Stok Masuk
│   └── /laporan/wilayah           -> Rekapitulasi Penjualan per Kota/Kabupaten
└── /stok                          -> Halaman Publik Cek Stok (Bebas Login)
```

### Pola Navigasi Responsif:
* **Pada Layar HP (Mobile View):**
  * **Bilah Bawah (*Bottom Navigation Bar*):** 4 menu utama: `[Dasbor]`, `[Kasir (+)]`, `[Stok Barang]`, `[Nota Penjualan]`. Tombol `[Kasir]` diberi aksen menonjol di tengah untuk akses tercepat.
  * **Top Header:** Nama sistem "MyKopsyah", Tombol "Salin Link Stok" cepat, dan Tombol Keluar (Logout).
* **Pada Layar Laptop (Desktop View):**
  * **Bilah Samping Kiri (*Sidebar*):** Menu lengkap dengan icon + label teks lebar, informasi status database Neon aktif, dan tombol pintas.

---

## 5. Spesifikasi Rinci Layar Utama (Screen Specs)

### 5.1 Layar 1: Dasbor Ringkas (`/dashboard`)
* **Tujuan:** Memberi gambaran kilat 3 hal paling penting bagi admin dalam 3 detik pertama.
* **Komponen:**
  1. **3 Kartu Metrik Utama:**
     * *Total Penjualan Bulan Ini* (Rp)
     * *Pesanan Belum Lunas* (Jumlah nota & total nominal piutang dengan aksen warna Amber)
     * *Pesanan Belum Dikirim* (Jumlah nota dengan aksen warna Biru)
  2. **Banner Cepat "Bagi Link Stok ke Pelanggan":**
     * Teks link publik `/stok` dengan tombol besar hijau bertuliskan **"📋 Salin Link Stok WhatsApp"**. Sekali klik langsung memunculkan notifikasi *"Link berhasil disalin! Tinggal tempel di chat WA"*.
  3. **Peringatan Stok Kritis (Urgent Attention):**
     * Daftar barang yang stoknya di bawah 5 pcs atau habis, lengkap dengan tombol langsung **"+ Tambah Stok"**.

---

### 5.2 Layar 2: Kasir / Catat Transaksi Baru (`/transaksi/baru`)
* **Tujuan:** Menginput pesanan multi-barang dari instansi/santri tanpa ribet dan tanpa kalkulator.
* **Alur Antarmuka:**
  1. **Bagian 1: Data Pelanggan**
     * Switch pilihan: `[ ] Instansi / Pondok` atau `[ ] Perorangan`.
     * Input Nama Instansi (jika instansi) & Nama Penerima Paket.
     * Input Nomor WhatsApp (dengan format otomatis `08...`).
     * Dropdown / Input Kota/Kabupaten (penting untuk rekap wilayah) dan Alamat Lengkap.
  2. **Bagian 2: Keranjang Belanja (Pilihan Barang)**
     * Tombol pencarian barang yang responsif.
     * Pemilihan barang dengan varian berjenjang yang interaktif:
       * *Contoh 1 (Baju Santri):* Pilih Baju Santri Putra -> Muncul baris pilihan ukuran (No 3, No 4, No 5, dst) -> Ketik jumlah -> Harga & subtotal otomatis muncul.
       * *Contoh 2 (Buku Santri Soleh):* Pilih Kelas (1, 2, 3, 4) -> Pilih Semester (1 atau 2) -> Ketik jumlah.
       * *Contoh 3 (Batik Guru):* Langsung input jumlah potong kain (tanpa varian).
     * Tombol **"+ Tambah Barang Lain"** yang lega dan jelas.
  3. **Bagian 3: Status Pembayaran & Pengiriman**
     * Tombol pilihan cepat (Segmented Toggle):
       * Status Bayar: `[ Belum Lunas ]` vs `[ Lunas ]`
       * Status Kirim: `[ Belum Dikirim ]` vs `[ Sudah Dikirim ]`
     * Kolom catatan khusus (misal: "Titip di satpam ponpes", "Kirim via J&T").
  4. **Bilah Bawah Mengambang (*Sticky Checkout Bar*):**
     * Total Belanja otomatis terpampang besar: **Rp 1.450.000**.
     * Tombol Aksi Primer: **"💾 SIMPAN TRANSAKSI"** (berwarna Emerald penuh).
     * Saat disimpan: Stok otomatis dipotong dari database Neon.

---

### 5.3 Layar 3: Detail Nota Transaksi (`/transaksi/[id]`)
* **Tujuan:** Memeriksa detail nota, mengubah status, mencetak struk, atau membagikan rincian nota ke WhatsApp pembeli.
* **Fitur Utama:**
  1. **Status Switcher Cepat:**
     * Tombol 1-klik untuk mengubah `Belum Lunas` menjadi `Lunas` saat uang transfer diterima.
     * Tombol 1-klik untuk mengubah `Belum Dikirim` menjadi `Sudah Dikirim` saat paket jalan.
  2. **Tombol "📲 Salin Format WhatsApp" (Rekomendasi Terpilih):**
     * Sekali klik, menghasilkan teks siap tempel ke chat WhatsApp pelanggan dengan format rapi:
       ```
       *KOPERASI SYARIAH (MYKOPSYAH)*
       No. Nota: KP-202610-001
       Tanggal: 05/10/2026
       
       Kepada: Ponpes Al-Ikhlas (Ust. Fuadi)
       Tujuan: Kab. Sleman, D.I. Yogyakarta
       --------------------------------
       1. Baju Santri Putra (Ukuran 5) x 10 = Rp 850.000
       2. Buku Santri Soleh Kls 1 Sem 1 x 10 = Rp 300.000
       --------------------------------
       *TOTAL: Rp 1.150.000*
       *Status: BELUM LUNAS*
       
       Terima kasih atas pesanannya! 🙏
       ```
  3. **Tombol "🖨️ Cetak Struk Sederhana":**
     * Membuka tampilan cetak bersih (print-friendly CSS) ukuran kertas thermal 58mm/80mm atau kertas A4 untuk dilampirkan ke dalam kardus paket pengiriman.

---

### 5.4 Layar 4: Manajemen Produk & Stok Masuk (`/produk`)
* **Tujuan:** Melihat daftar semua produk, mengubah harga jual, dan menambah stok masuk.
* **Komponen:**
  1. Tab Kategori: `[Semua]`, `[Seragam]`, `[Buku]`, `[Aksesoris]`, `[Kain]`.
  2. Tombol Besar: **"+ Input Stok Masuk"**:
     * Membuka form modal sederhana: Pilih Produk -> Pilih Ukuran/Varian -> Masukkan Jumlah Masuk -> Masukkan Sumber/Catatan (misal: "Konveksi Mas Dani") -> Klik Simpan.
     * Stok master otomatis bertambah dan riwayat tersimpan di `StockEntry`.
  3. Tabel Daftar Varian & Stok:
     * Menampilkan nama produk, varian, harga jual, dan sisa stok fisik saat ini.
     * Kolom aksi: tombol edit harga cepat.

---

### 5.5 Layar 5: Halaman Publik Cek Stok (`/stok`)
* **Tujuan:** Pelanggan atau pengurus instansi dapat mengecek ketersediaan barang secara mandiri lewat link yang dibagikan admin via WhatsApp.
* **Karakteristik Tampilan:**
  * **Bebas Login:** Siapapun yang memiliki link bisa membuka langsung.
  * **Cepat & Ringan:** Didesain seringan mungkin agar cepat terbuka di handphone dengan jaringan lambat.
  * **Fitur Pencarian Cepat:** Kolom ketik "Cari seragam, buku, ukuran..." yang menyaring daftar seketika (*instant filter*).
  * **Label Ketersediaan Jelas:**
    * Hijau: **"Tersedia (Stok: 24)"**
    * Oranye: **"Sisa Sedikit (Stok: 3)"**
    * Abu-abu/Merah: **"Habis"**
  * **Footer Kontak Admin:** Tombol mengambang di bawah: **"💬 Hubungi Admin via WhatsApp"** yang langsung membuka aplikasi WhatsApp dengan pesan pembuka otomatis.

---

### 5.6 Layar 6: Laporan & Rekap Wilayah (`/laporan/wilayah`)
* **Tujuan:** Memenuhi kebutuhan PRD untuk melihat sebaran penjualan per Kota/Kabupaten.
* **Komponen:**
  * Tabel ringkasan yang dikelompokkan berdasarkan **Kota/Kabupaten**.
  * Kolom: *Nama Kota/Kabupaten*, *Total Transaksi*, *Total Pcs Barang Terjual*, *Total Nilai Belanja (Rp)*.
  * Filter rentang tanggal (Bulan Ini / Semua Waktu).
  * Tombol unduh / cetak rekapitulasi sederhana.

---

## 6. Alur Data & Mekanisme Database Transaksi

Untuk memastikan data stok tidak selisih dan database tetap konsisten:

1. **Pengurangan Stok Otomatis:**
   * Saat transaksi disimpan melalui Next.js Server Action, eksekusi dilakukan dalam satu `DB Transaction` (ACID).
   * Tiap item pesanan memotong `stock_quantity` pada tabel `ProductVariant`.
   * Jika stok tidak mencukupi, sistem memberikan pesan peringatan jelas tanpa merusak data.
2. **Snapshot Harga (Price Snapshotting):**
   * Tabel `TransactionItem` menyimpan salinan harga (`unit_price`) saat nota dibuat.
   * Jika admin di kemudian hari menaikkan harga master baju santri, nilai nota masa lalu tetap akurat.
3. **Pembatalan / Hapus Transaksi (Stock Rollback):**
   * Jika nota transaksi dibatalkan atau dihapus, sistem secara otomatis mengembalikan jumlah barang ke `stock_quantity` masing-masing varian.

---

## 7. Panduan Setup & Deployment ke Vercel

### Konfigurasi Variabel Lingkungan (`.env`):
Aplikasi ini hanya membutuhkan 3 variabel lingkungan utama:
```env
# Koneksi Neon Serverless PostgreSQL
DATABASE_URL="postgres://user:password@ep-sample-pooler.us-east-2.aws.neon.tech/mykopsyah?sslmode=require"

# Kunci PIN / Sandi Admin Sederhana
ADMIN_SECRET_PIN="123456"

# Kunci Enkripsi Cookie Sesi
SESSION_SECRET="kopsyah-super-secret-key-32-chars-long"
```

### Langkah Deployment ke Vercel:
1. Hubungkan repositori GitHub `accfd/MyKopsyah` ke dashboard [Vercel](https://vercel.com).
2. Tambahkan variabel lingkungan `DATABASE_URL`, `ADMIN_SECRET_PIN`, dan `SESSION_SECRET` di menu *Settings > Environment Variables*.
3. Vercel akan otomatis mendeteksi Next.js dan melakukan proses *build & deploy* secara otomatis.
4. Setiap pembaruan kode di GitHub (`git push origin main`) akan memicu auto-deploy dalam hitungan detik.

---

## 8. Ringkasan Kesiapan Pembangunan

Rancangan di atas telah menjawab seluruh kebutuhan PRD:
* ✅ **Platform & Hosting:** Next.js + Neon PostgreSQL, 100% gratis di Vercel.
* ✅ **Kesesuaian Pengguna:** Senior-friendly, bahasa ramah, font besar, mobile-first bottom nav.
* ✅ **Fitur Unggulan:** Kasir multi-barang dengan varian lengkap, link cek stok publik `/stok`, salin nota rapi ke WhatsApp, cetak struk, dan rekap wilayah.
* ✅ **Integritas Data:** Snapshot harga dan rollback stok aman.
