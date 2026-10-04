# MASTER PROMPT: PEMBANGUNAN SISTEM MYKOPSYAH
> **Tujuan Dokumen:** Dokumen ini berisi instruksi lengkap (*Master Build Prompt*) yang dirancang khusus untuk diberikan kepada AI Coding Assistant (seperti Antigravity, Claude, atau GPT) guna mengeksekusi pembangunan seluruh kode aplikasi web **MyKopsyah** secara presisi, terstruktur, dan siap dideploy ke Vercel.

---

```markdown
# PROMPT UNTUK AI DEVELOPER: BANGUN SISTEM "MYKOPSYAH"

Bertindaklah sebagai Senior Full-Stack Web Developer dan Pakar UI/UX. Bangun sebuah aplikasi web produksi lengkap bernama **"MyKopsyah"** (Sistem Pengelolaan Stok dan Penjualan Koperasi Syariah) dari awal hingga siap dideploy ke platform gratis **Vercel** dengan database **Neon Serverless PostgreSQL**.

Gunakan acuan spesifikasi kebutuhan dari `PRD_MyKopsyah.md` dan panduan arsitektur/UI dari `DESIGN.md`.

---

## 1. ATURAN & BATASAN UTAMA (NON-NEGOTIABLE CONSTRAINTS)

1. **Target Pengguna Utama:** Admin Kopsyah yang berusia senior dan awam teknologi.
   * Gunakan Bahasa Indonesia yang ramah, jelas, dan akrab. **DILARANG** menggunakan istilah teknis bahasa Inggris (*Zero Jargon*). Gunakan istilah: *Barang Masuk, Catat Penjualan, Belum Lunas, Sudah Lunas, Belum Dikirim, Sudah Dikirim, Salin Link Stok, Salin Nota WA*.
   * Ukuran font dasar (*body text*) minimal **16px** (mencegah auto-zoom di browser HP).
   * Seluruh tombol sentuh berukuran lega (minimal **48px x 48px**).
2. **Kesesuaian Perangkat (Mobile-First):**
   * Di layar HP: Navigasi bawah (*Bottom Navigation Bar*) dengan tombol Kasir menonjol di tengah, serta bilah ringkasan total mengambang (*Sticky Bottom Bar*) saat transaksi.
   * Di layar Laptop: Bilah navigasi samping (*Sidebar*) yang rapi dan informatif.
3. **100% Gratis Operasional (Free-Tier Stack):**
   * Framework: **Next.js (App Router, React 19, TypeScript)**.
   * Database: **Neon Serverless PostgreSQL** via connection pooler (`@neondatabase/serverless`).
   * ORM: **Drizzle ORM** (ringan, cepat di serverless Vercel).
   * Styling: **Tailwind CSS** dengan tema warna **Hijau Emerald Syariah (`#047857`)** dan latar belakang bersih.
   * Icon: **Lucide React**.
4. **Batasan Fitur (Out of Scope):**
   * JANGAN membuat upload bukti transfer / gambar struk.
   * JANGAN membuat integrasi payment gateway.
   * JANGAN membuat kalkulator ongkos kirim ekspedisi.
   * JANGAN membuat sistem multi-admin/multi-role; gunakan proteksi **Single-Admin** berbasis PIN/Password sederhana dengan cookie sesi terenkripsi.

---

## 2. STRUKTUR DATABASE (DRIZZLE ORM + POSTGRESQL)

Buat skema Drizzle ORM lengkap mencakup 6 tabel berikut:

### 1. `products`
* `id`: `serial` / `uuid` (Primary Key)
* `name`: `varchar(255)` NOT NULL (contoh: "Baju Santri Putra", "Buku Santri Soleh", "Baju Dasar Batik Guru")
* `category`: `varchar(50)` NOT NULL ("Seragam", "Buku", "Aksesoris", "Kain")
* `has_variants`: `boolean` default true
* `unit`: `varchar(20)` default "Pcs" ("Pcs", "Stel", "Potong")
* `created_at`: `timestamp` default now()

### 2. `product_variants`
* `id`: `serial` / `uuid` (Primary Key)
* `product_id`: references `products(id)` on delete cascade
* `variant_name`: `varchar(100)` NOT NULL (contoh: "Ukuran 3", "Kelas 1 - Sem 1", "Standar")
* `price`: `integer` NOT NULL (harga jual Rupiah per unit)
* `stock_quantity`: `integer` default 0 (stok fisik aktif)
* `sku_code`: `varchar(50)` optional

### 3. `customers`
* `id`: `serial` / `uuid` (Primary Key)
* `customer_type`: `varchar(30)` default "Instansi" ("Instansi / Pesantren", "Perorangan")
* `institution_name`: `varchar(255)` optional
* `contact_person`: `varchar(150)` NOT NULL
* `phone_number`: `varchar(50)` NOT NULL
* `city`: `varchar(100)` NOT NULL (Kota / Kabupaten untuk laporan wilayah)
* `province`: `varchar(100)` optional
* `full_address`: `text` optional
* `created_at`: `timestamp` default now()

### 4. `transactions`
* `id`: `serial` / `uuid` (Primary Key)
* `invoice_number`: `varchar(50)` UNIQUE NOT NULL (format: `KP-YYMM-XXXX`)
* `customer_id`: references `customers(id)` optional
* `customer_name_snapshot`: `varchar(255)` NOT NULL
* `recipient_name`: `varchar(150)` NOT NULL
* `recipient_phone`: `varchar(50)` NOT NULL
* `city_snapshot`: `varchar(100)` NOT NULL
* `full_address_snapshot`: `text` optional
* `payment_status`: `varchar(30)` default "Belum Lunas" ("Belum Lunas", "Lunas")
* `shipping_status`: `varchar(30)` default "Belum Dikirim" ("Belum Dikirim", "Sudah Dikirim")
* `total_amount`: `integer` NOT NULL
* `notes`: `text` optional
* `created_at`: `timestamp` default now()

### 5. `transaction_items`
* `id`: `serial` / `uuid` (Primary Key)
* `transaction_id`: references `transactions(id)` on delete cascade
* `product_id`: references `products(id)`
* `variant_id`: references `product_variants(id)`
* `item_name_snapshot`: `varchar(255)` NOT NULL (nama barang & varian saat transaksi)
* `unit_price`: `integer` NOT NULL (snapshot harga jual saat nota dibuat)
* `quantity`: `integer` NOT NULL
* `subtotal`: `integer` NOT NULL

### 6. `stock_entries`
* `id`: `serial` / `uuid` (Primary Key)
* `variant_id`: references `product_variants(id)` on delete cascade
* `quantity_added`: `integer` NOT NULL
* `supplier_or_notes`: `text` optional
* `created_at`: `timestamp` default now()

---

## 3. LOGIKA BISNIS & INTEGRITAS DATA (SERVER ACTIONS)

1. **Pencatatan Penjualan Baru (`createTransaction`):**
   * Jalankan di dalam `db.transaction()` (ACID).
   * Validasi stok: Pastikan `stock_quantity >= quantity` untuk semua varian. Jika kurang, gagalkan dengan pesan error ramah.
   * Generate `invoice_number` otomatis unik.
   * Simpan data pembeli ke `customers` (atau hubungkan jika nomor telepon sudah ada).
   * Potong stok varian: `stock_quantity = stock_quantity - quantity`.
   * Simpan `transactions` dan seluruh baris `transaction_items` dengan harga snapshot.
2. **Pembatalan / Hapus Transaksi (`deleteTransaction`):**
   * Kembalikan stok: Tiap item di `transaction_items` mengembalikan `quantity` ke `product_variants.stock_quantity`.
   * Hapus transaksi secara aman.
3. **Pembaruan Status Kilat (`updatePaymentStatus` & `updateShippingStatus`):**
   * Toggle 1-klik antara "Belum Lunas" <-> "Lunas".
   * Toggle 1-klik antara "Belum Dikirim" <-> "Sudah Dikirim".
4. **Pencatatan Stok Masuk (`createStockEntry`):**
   * Tambahkan `quantity_added` ke `product_variants.stock_quantity`.
   * Simpan riwayat ke tabel `stock_entries`.

---

## 4. FITUR & SPESIFIKASI LAYAR APLIKASI

### 1. Layar Masuk Admin (`/login`)
* Formulir login sederhana: Input PIN / Kata Sandi Master.
* Verifikasi menggunakan Server Action, simpan sesi terenkripsi di HTTP-only cookie dengan durasi panjang (30 hari) agar admin tidak perlu login terus-menerus.

### 2. Dasbor Ringkas (`/dashboard`)
* **3 Kartu Ringkasan:**
  1. *Total Penjualan Bulan Ini* (Rp)
  2. *Pesanan Belum Lunas* (Jumlah nota & total piutang warna Amber)
  3. *Pesanan Belum Dikirim* (Jumlah nota paket warna Biru)
* **Banner Berbagi Link Stok:**
  * Tombol besar hijau: **"📋 Salin Link Stok WhatsApp"**. Sekali klik, menyalin link URL `/stok` ke clipboard dengan toast sukses *"Link stok disalin! Siap dikirim ke WA pelanggan"*.
* **Tabel Stok Menipis / Habis:**
  * Menampilkan barang dengan stok <= 5 pcs dengan tombol cepat **"+ Tambah Stok"**.

### 3. Halaman Kasir / Transaksi Baru (`/transaksi/baru`)
* Formulir Data Pembeli: Pilihan jenis pemesan (Instansi / Perorangan), Nama Pemesan/Instansi, Nama Penerima, Nomor WhatsApp, Kota/Kabupaten, dan Alamat.
* Selector Barang Multi-Item yang Fleksibel:
  * Dropdown/Pencarian Produk -> Pilih varian (Baju Santri: Ukuran 1-10; Buku: Kelas 1-4 & Semester 1-2; Batik Guru: tanpa ukuran).
  * Pengatur jumlah beli (+ / - stepper atau ketik langsung).
  * Tombol tambah baris produk lain.
  * Preview subtotal dan total belanja langsung terhitung seketika tanpa kalkulator.
* Status Switcher: Pilih Belum Lunas/Lunas & Belum Dikirim/Sudah Dikirim.
* Sticky Bottom Bar: Total besar dan tombol raksasa **"💾 SIMPAN TRANSAKSI"**.

### 4. Detail Nota Transaksi (`/transaksi/[id]`)
* Rincian nota belanja lengkap (No Nota, Tanggal, Nama Instansi, Penerima, Alamat, Daftar Barang, Total).
* Badge Status Bayar & Kirim dengan tombol ubah status 1-klik.
* **Tombol "📲 Salin Format WhatsApp":**
  * Menghasilkan teks nota rapi dengan format WhatsApp (bold bintang, garis pemisah) yang siap ditempel ke chat pembeli.
* **Tombol "🖨️ Cetak Struk Sederhana":**
  * Tampilan cetak bersih siap cetak printer thermal 58mm/80mm atau kertas nota pengiriman.

### 5. Manajemen Produk & Stok Masuk (`/produk`)
* Daftar seluruh barang dan variannya dengan sisa stok aktif.
* Tombol **"+ Input Stok Masuk"**: Modal cepat memilih produk, memilih varian, mengetik jumlah barang masuk, dan catatan asal konveksi/penerbit.
* Fitur edit harga jual varian sewaktu-waktu.

### 6. Halaman Publik Cek Stok (`/stok`)
* **Halaman terbuka untuk umum tanpa login.**
* Desain elegan, cepat, dan mobile-friendly.
* Kolom pencarian instan barang & filter kategori (Seragam, Buku, Aksesoris, Kain).
* Badge stok informatif:
  * Hijau: *Tersedia (Stok: X)*
  * Oranye: *Sisa Sedikit (Stok: X)*
  * Abu-abu/Merah: *Habis*
* Tombol kontak mengambang di bawah: **"💬 Hubungi Admin via WhatsApp"** yang membuka chat WA admin dengan pesan otomatis.

### 7. Laporan Rekap Wilayah (`/laporan/wilayah`)
* Tabel otomatis mengelompokkan penjualan berdasarkan **Kota / Kabupaten**.
* Kolom: Kota/Kabupaten, Jumlah Nota Transaksi, Total Item Terjual, Total Omset (Rp).

---

## 5. SEED DATA AWAL (INITIAL PRODUCTS)

Sediakan skrip seed (`seed.ts`) untuk memasukkan data awal produk nyata Kopsyah:
1. **Baju Santri (Putra):** Varian Ukuran 1 s/d 10 (Harga berbeda tiap jenjang ukuran, stok awal masing-masing 20 pcs).
2. **Baju Santriwati (Putri):** Varian Ukuran 1 s/d 10 (Harga berbeda tiap jenjang ukuran, stok awal masing-masing 20 pcs).
3. **Buku Santri Soleh:** Varian Kelas 1 (Sem 1 & Sem 2), Kelas 2 (Sem 1 & Sem 2), Kelas 3 (Sem 1 & Sem 2), Kelas 4 (Sem 1 & Sem 2) (Stok awal masing-masing 30 pcs).
4. **Peci Santri:** Varian Ukuran 4 s/d 9 (Stok awal masing-masing 15 pcs).
5. **Jilbab Santriwati:** Varian Ukuran S, M, L, XL (Stok awal masing-masing 15 pcs).
6. **Baju Dasar Batik Guru:** Non-varian / Standar (Stok awal 50 potong).

---

## 6. LANGKAH-LANGKAH EKSEKUSI PEMBANGUNAN

Lakukan pembangunan dengan urutan sistematis berikut:
1. Inisialisasi Next.js 15 App Router dengan TypeScript dan Tailwind CSS di repositori ini.
2. Pasang dependensi esensial: `drizzle-orm`, `@neondatabase/serverless`, `lucide-react`, `clsx`, `tailwind-merge`, `dotenv`.
3. Buat skema database Drizzle (`db/schema.ts`) dan koneksi client Neon (`db/index.ts`).
4. Jalankan migrasi / push skema ke database dan masukkan seed data produk awal.
5. Buat sistem sesi autentikasi Admin sederhana di middleware/cookies.
6. Buat tata letak (*layout*) responsif: Header atas, Bottom Bar untuk mobile, dan Sidebar untuk desktop dengan tema Hijau Emerald Syariah.
7. Implementasikan halaman Kasir (`/transaksi/baru`) dan Server Action penyimpanan pesanan + potong stok.
8. Implementasikan halaman Detail Nota (`/transaksi/[id]`) dengan fitur Salin WhatsApp dan Cetak.
9. Implementasikan halaman Katalog & Stok Masuk (`/produk`).
10. Implementasikan halaman Publik Cek Stok (`/stok`) dengan pencarian cepat.
11. Implementasikan halaman Laporan Wilayah (`/laporan/wilayah`) dan Dasbor Ringkas (`/dashboard`).
12. Lakukan build test (`npm run build`) untuk memastikan 100% bebas error lint dan TypeScript, siap deploy langsung ke Vercel!
```
