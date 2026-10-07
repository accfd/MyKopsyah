import { pgTable, text, varchar, integer, timestamp, serial } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// 1. Tabel Produk
export const produk = pgTable("produk", {
  id: serial("id").primaryKey(),
  nama: varchar("nama", { length: 255 }).notNull(),
  kategori: varchar("kategori", { length: 50 }).notNull(), // Seragam, Buku, Aksesoris
  satuan: varchar("satuan", { length: 20 }).default("Pcs").notNull(),
  dibuatPada: timestamp("dibuat_pada").defaultNow().notNull(),
});

// 2. Tabel Varian Produk (Ukuran, Jilid, dll)
export const varianProduk = pgTable("varian_produk", {
  id: serial("id").primaryKey(),
  produkId: integer("produk_id").references(() => produk.id, { onDelete: "cascade" }).notNull(),
  namaVarian: varchar("nama_varian", { length: 100 }).notNull(),
  harga: integer("harga").notNull(),
  jumlahStok: integer("jumlah_stok").default(0).notNull(),
  kodeSku: varchar("kode_sku", { length: 50 }),
});

// 3. Tabel Pelanggan (Master Data Pembeli / Pesantren)
export const pelanggan = pgTable("pelanggan", {
  id: serial("id").primaryKey(),
  tipePelanggan: varchar("tipe_pelanggan", { length: 50 }).default("Perorangan / Wali Santri").notNull(),
  nama: varchar("nama", { length: 150 }).notNull(),
  noTelepon: varchar("no_telepon", { length: 50 }).notNull(),
  kota: varchar("kota", { length: 100 }).notNull(),
  provinsi: varchar("provinsi", { length: 100 }),
  alamatLengkap: text("alamat_lengkap"),
  dibuatPada: timestamp("dibuat_pada").defaultNow().notNull(),
});

// 4. Tabel Transaksi (Nota Penjualan Kasir)
export const transaksi = pgTable("transaksi", {
  id: serial("id").primaryKey(),
  nomorNota: varchar("nomor_nota", { length: 50 }).unique().notNull(),
  pelangganId: integer("pelanggan_id").references(() => pelanggan.id, { onDelete: "set null" }),
  namaPenerima: varchar("nama_penerima", { length: 150 }).notNull(),
  teleponPenerima: varchar("telepon_penerima", { length: 50 }).notNull(),
  kotaTujuan: varchar("kota_tujuan", { length: 100 }).notNull(),
  alamatTujuan: text("alamat_tujuan"),
  statusPembayaran: varchar("status_pembayaran", { length: 30 }).default("Belum Lunas").notNull(), // Belum Lunas, Lunas
  statusPengiriman: varchar("status_pengiriman", { length: 30 }).default("Belum Dikirim").notNull(), // Belum Dikirim, Sudah Dikirim
  totalTagihan: integer("total_tagihan").notNull(),
  catatan: text("catatan"),
  dibuatPada: timestamp("dibuat_pada").defaultNow().notNull(),
});

// 5. Tabel Item Transaksi (Rincian Barang per Nota)
export const itemTransaksi = pgTable("item_transaksi", {
  id: serial("id").primaryKey(),
  transaksiId: integer("transaksi_id").references(() => transaksi.id, { onDelete: "cascade" }).notNull(),
  produkId: integer("produk_id").references(() => produk.id),
  varianId: integer("varian_id").references(() => varianProduk.id),
  namaItem: varchar("nama_item", { length: 255 }).notNull(),
  hargaSatuan: integer("harga_satuan").notNull(),
  jumlah: integer("jumlah").notNull(),
  subtotal: integer("subtotal").notNull(),
});

// 6. Tabel Riwayat Stok (Penerimaan Stok Masuk Gudang)
export const riwayatStok = pgTable("riwayat_stok", {
  id: serial("id").primaryKey(),
  varianId: integer("varian_id").references(() => varianProduk.id, { onDelete: "cascade" }).notNull(),
  jumlahMasuk: integer("jumlah_masuk").notNull(),
  keterangan: text("keterangan"), // Berisi sumber atau nomor Berita Acara Penerimaan (BM-XXXX)
  dibuatPada: timestamp("dibuat_pada").defaultNow().notNull(),
});

// Relasi Antar Tabel
export const produkRelations = relations(produk, ({ many }) => ({
  varian: many(varianProduk),
}));

export const varianProdukRelations = relations(varianProduk, ({ one, many }) => ({
  produk: one(produk, {
    fields: [varianProduk.produkId],
    references: [produk.id],
  }),
  riwayatStok: many(riwayatStok),
  itemTransaksi: many(itemTransaksi),
}));

export const pelangganRelations = relations(pelanggan, ({ many }) => ({
  transaksi: many(transaksi),
}));

export const transaksiRelations = relations(transaksi, ({ one, many }) => ({
  pelanggan: one(pelanggan, {
    fields: [transaksi.pelangganId],
    references: [pelanggan.id],
  }),
  items: many(itemTransaksi),
}));

export const itemTransaksiRelations = relations(itemTransaksi, ({ one }) => ({
  transaksi: one(transaksi, {
    fields: [itemTransaksi.transaksiId],
    references: [transaksi.id],
  }),
  produk: one(produk, {
    fields: [itemTransaksi.produkId],
    references: [produk.id],
  }),
  varian: one(varianProduk, {
    fields: [itemTransaksi.varianId],
    references: [varianProduk.id],
  }),
}));

export const riwayatStokRelations = relations(riwayatStok, ({ one }) => ({
  varian: one(varianProduk, {
    fields: [riwayatStok.varianId],
    references: [varianProduk.id],
  }),
}));

// Backward compatibility alias (agar modul lain tetap aman)
export const products = produk;
export const productVariants = varianProduk;
export const customers = pelanggan;
export const transactions = transaksi;
export const transactionItems = itemTransaksi;
export const stockEntries = riwayatStok;
