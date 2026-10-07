/**
 * seed-laporan.ts
 * Mengisi data riil dari:
 * "LAPORAN PENJUALAN MODUL SEMESTER 1 TAHUN 2026 PERIODE JULI-SEPTEMBER"
 *
 * 1. Modul dicetak: 1.000 eks per kelas (I, II, III, IV) -> total 4.000 eks
 * 2. 53 transaksi penjualan riil berdasarkan pemesan & kabupaten/kota
 * 3. Sisa stok riil:
 *    - Kelas I: 277
 *    - Kelas II: 299
 *    - Kelas III: 282
 *    - Kelas IV: 323
 *    Total Sisa: 1.181 eks
 */

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { sql, eq } from "drizzle-orm";
import * as schema from "./src/db/schema";
import { INITIAL_PRODUCTS } from "./src/lib/initial-seed";

interface ReportRow {
  no: number;
  date: string; // YYYY-MM-DD
  name: string;
  city: string;
  k1: number;
  k2: number;
  k3: number;
  k4: number;
  ket: string;
  kontribusiKoperasi: number;
  kontribusiDpw: number;
}

const REPORT_ROWS: ReportRow[] = [
  { no: 1, date: "2026-07-02", name: "Sri Wahyuni", city: "Dharmasraya", k1: 16, k2: 17, k3: 20, k4: 12, ket: "", kontribusiKoperasi: 97500, kontribusiDpw: 32500 },
  { no: 2, date: "2026-07-02", name: "Sri Wahyuni", city: "Dharmasraya", k1: 10, k2: 7, k3: 10, k4: 15, ket: "", kontribusiKoperasi: 63000, kontribusiDpw: 21000 },
  { no: 3, date: "2026-07-02", name: "MDT Alhidayah", city: "Lima Puluh Kota", k1: 1, k2: 1, k3: 1, k4: 1, ket: "", kontribusiKoperasi: 6000, kontribusiDpw: 2000 },
  { no: 4, date: "2026-07-02", name: "Muzimar", city: "Tanah Datar", k1: 21, k2: 36, k3: 16, k4: 19, ket: "", kontribusiKoperasi: 138000, kontribusiDpw: 46000 },
  { no: 5, date: "2026-07-12", name: "Mulia Sari", city: "Pasaman Barat", k1: 0, k2: 0, k3: 12, k4: 12, ket: "", kontribusiKoperasi: 36000, kontribusiDpw: 12000 },
  { no: 6, date: "2026-07-17", name: "Erhakiki", city: "Payakumbuh", k1: 20, k2: 0, k3: 0, k4: 0, ket: "", kontribusiKoperasi: 30000, kontribusiDpw: 10000 },
  { no: 7, date: "2026-07-17", name: "Muzimar", city: "Tanah Datar", k1: 15, k2: 17, k3: 19, k4: 10, ket: "", kontribusiKoperasi: 91500, kontribusiDpw: 30500 },
  { no: 8, date: "2026-07-17", name: "Sri Wahyuni", city: "Dharmasraya", k1: 6, k2: 4, k3: 4, k4: 4, ket: "", kontribusiKoperasi: 27000, kontribusiDpw: 9000 },
  { no: 9, date: "2026-07-17", name: "Muzimar", city: "Tanah Datar", k1: 1, k2: 1, k3: 4, k4: 1, ket: "", kontribusiKoperasi: 10500, kontribusiDpw: 3500 },
  { no: 10, date: "2026-07-17", name: "Abi Hasan", city: "Padang Pariaman", k1: 2, k2: 2, k3: 2, k4: 2, ket: "BB", kontribusiKoperasi: 0, kontribusiDpw: 0 },
  { no: 11, date: "2026-07-19", name: "Sri Wahyuni", city: "Dharmasraya", k1: 0, k2: 0, k3: 2, k4: 0, ket: "", kontribusiKoperasi: 3000, kontribusiDpw: 1000 },
  { no: 12, date: "2026-07-19", name: "Gusmanila Putri", city: "Kabupaten Solok", k1: 60, k2: 50, k3: 50, k4: 50, ket: "", kontribusiKoperasi: 315000, kontribusiDpw: 105000 },
  { no: 13, date: "2026-07-19", name: "Mulia Sari", city: "Pasaman Barat", k1: 11, k2: 13, k3: 13, k4: 5, ket: "", kontribusiKoperasi: 63000, kontribusiDpw: 21000 },
  { no: 14, date: "2026-07-19", name: "Ummi Nardiati", city: "Padang Pariaman", k1: 11, k2: 4, k3: 6, k4: 0, ket: "", kontribusiKoperasi: 315000 / 10, kontribusiDpw: 10500 }, // 31.500
  { no: 15, date: "2026-07-19", name: "Yetmawati", city: "Agam", k1: 61, k2: 76, k3: 101, k4: 79, ket: "", kontribusiKoperasi: 475500, kontribusiDpw: 158500 },
  { no: 16, date: "2026-07-20", name: "Sinta", city: "Lima Puluh Kota", k1: 12, k2: 12, k3: 12, k4: 12, ket: "", kontribusiKoperasi: 72000, kontribusiDpw: 24000 },
  { no: 17, date: "2026-07-20", name: "Hj. Sasra Rita", city: "Kota Padang", k1: 30, k2: 30, k3: 20, k4: 20, ket: "BB", kontribusiKoperasi: 0, kontribusiDpw: 0 },
  { no: 18, date: "2026-07-21", name: "Hj. Sasra Rita", city: "Kota Padang", k1: 10, k2: 10, k3: 25, k4: 30, ket: "BB", kontribusiKoperasi: 0, kontribusiDpw: 0 },
  { no: 19, date: "2026-07-27", name: "Titin", city: "Lima Puluh Kota", k1: 1, k2: 1, k3: 1, k4: 1, ket: "", kontribusiKoperasi: 6000, kontribusiDpw: 2000 },
  { no: 20, date: "2026-07-27", name: "Rinaldi", city: "Lima Puluh Kota", k1: 5, k2: 5, k3: 5, k4: 5, ket: "", kontribusiKoperasi: 30000, kontribusiDpw: 10000 },
  { no: 21, date: "2026-07-27", name: "Yenita Martini", city: "Lima Puluh Kota", k1: 4, k2: 8, k3: 10, k4: 7, ket: "", kontribusiKoperasi: 43500, kontribusiDpw: 14500 },
  { no: 22, date: "2026-07-28", name: "Aida Fitri", city: "Lima Puluh Kota", k1: 15, k2: 17, k3: 12, k4: 12, ket: "", kontribusiKoperasi: 84000, kontribusiDpw: 28000 },
  { no: 23, date: "2026-07-28", name: "Ade Rahmi", city: "Lima Puluh Kota", k1: 7, k2: 8, k3: 10, k4: 7, ket: "", kontribusiKoperasi: 48000, kontribusiDpw: 16000 },
  { no: 24, date: "2026-07-28", name: "Nasri", city: "Kota Pariaman", k1: 0, k2: 10, k3: 3, k4: 4, ket: "", kontribusiKoperasi: 25500, kontribusiDpw: 8500 },
  { no: 25, date: "2026-07-29", name: "Nasri", city: "Kota Pariaman", k1: 1, k2: 3, k3: 6, k4: 1, ket: "", kontribusiKoperasi: 16500, kontribusiDpw: 5500 },
  { no: 26, date: "2026-07-30", name: "Nasri", city: "Kota Pariaman", k1: 0, k2: 0, k3: 10, k4: 15, ket: "", kontribusiKoperasi: 37500, kontribusiDpw: 12500 },
  { no: 27, date: "2026-07-31", name: "Nasri", city: "Kota Pariaman", k1: 1, k2: 1, k3: 1, k4: 1, ket: "", kontribusiKoperasi: 6000, kontribusiDpw: 2000 },
  { no: 28, date: "2026-08-06", name: "Nasri", city: "Kota Pariaman", k1: 2, k2: 1, k3: 0, k4: 0, ket: "", kontribusiKoperasi: 4500, kontribusiDpw: 1500 },
  { no: 29, date: "2026-08-06", name: "Mulia Sari", city: "Pasaman Barat", k1: 0, k2: 0, k3: 17, k4: 19, ket: "", kontribusiKoperasi: 54000, kontribusiDpw: 18000 },
  { no: 30, date: "2026-08-07", name: "Mulia Sari", city: "Pasaman Barat", k1: 7, k2: 5, k3: 1, k4: 2, ket: "", kontribusiKoperasi: 22500, kontribusiDpw: 7500 },
  { no: 31, date: "2026-08-07", name: "Mulia Sari", city: "Pasaman Barat", k1: 1, k2: 1, k3: 1, k4: 1, ket: "", kontribusiKoperasi: 6000, kontribusiDpw: 2000 },
  { no: 32, date: "2026-08-07", name: "Mulia Sari", city: "Pasaman Barat", k1: 9, k2: 7, k3: 13, k4: 13, ket: "", kontribusiKoperasi: 63000, kontribusiDpw: 21000 },
  { no: 33, date: "2026-08-08", name: "Nopriadi", city: "Padang Pariaman", k1: 0, k2: 15, k3: 10, k4: 5, ket: "", kontribusiKoperasi: 45000, kontribusiDpw: 15000 },
  { no: 34, date: "2026-08-08", name: "Yetmawati", city: "Agam", k1: 19, k2: 17, k3: 10, k4: 16, ket: "", kontribusiKoperasi: 93000, kontribusiDpw: 31000 },
  { no: 35, date: "2026-08-08", name: "Erhakiki", city: "Payakumbuh", k1: 6, k2: 0, k3: 0, k4: 0, ket: "", kontribusiKoperasi: 9000, kontribusiDpw: 3000 },
  { no: 36, date: "2026-08-08", name: "Muharmaini", city: "Kota Padang", k1: 19, k2: 20, k3: 16, k4: 21, ket: "", kontribusiKoperasi: 114000, kontribusiDpw: 38000 },
  { no: 37, date: "2026-08-08", name: "Sri Wahyuni", city: "Dharmasraya", k1: 6, k2: 4, k3: 4, k4: 4, ket: "", kontribusiKoperasi: 27000, kontribusiDpw: 9000 },
  { no: 38, date: "2026-08-11", name: "Mustarib", city: "Kota Solok", k1: 100, k2: 100, k3: 100, k4: 100, ket: "BB", kontribusiKoperasi: 0, kontribusiDpw: 0 },
  { no: 39, date: "2026-08-11", name: "Dahlia", city: "Pasaman", k1: 50, k2: 50, k3: 50, k4: 50, ket: "BB 50%", kontribusiKoperasi: 0, kontribusiDpw: 0 },
  { no: 40, date: "2026-08-11", name: "Kamra", city: "Kabupaten Solok", k1: 23, k2: 31, k3: 23, k4: 20, ket: "", kontribusiKoperasi: 145500, kontribusiDpw: 48500 },
  { no: 41, date: "2026-08-12", name: "Gusmanila Putri", city: "Kabupaten Solok", k1: 17, k2: 7, k3: 9, k4: 8, ket: "", kontribusiKoperasi: 61500, kontribusiDpw: 20500 },
  { no: 42, date: "2026-08-12", name: "Gusmanila Putri", city: "Kabupaten Solok", k1: 10, k2: 10, k3: 20, k4: 10, ket: "", kontribusiKoperasi: 75000, kontribusiDpw: 25000 },
  { no: 43, date: "2026-08-12", name: "Nasri", city: "Kota Pariaman", k1: 10, k2: 9, k3: 5, k4: 6, ket: "", kontribusiKoperasi: 45000, kontribusiDpw: 15000 },
  { no: 44, date: "2026-08-12", name: "Nopriadi", city: "Padang Pariaman", k1: 33, k2: 0, k3: 0, k4: 0, ket: "", kontribusiKoperasi: 49500, kontribusiDpw: 16500 },
  { no: 45, date: "2026-08-12", name: "Sri Wahyuni", city: "Dharmasraya", k1: 10, k2: 7, k3: 10, k4: 0, ket: "", kontribusiKoperasi: 40500, kontribusiDpw: 13500 },
  { no: 46, date: "2026-08-12", name: "Nopriadi", city: "Padang Pariaman", k1: 4, k2: 13, k3: 10, k4: 26, ket: "", kontribusiKoperasi: 79500, kontribusiDpw: 26500 },
  { no: 47, date: "2026-08-12", name: "Nasri", city: "Kota Pariaman", k1: 5, k2: 9, k3: 5, k4: 6, ket: "", kontribusiKoperasi: 37500, kontribusiDpw: 12500 },
  { no: 48, date: "2026-08-12", name: "Nasri", city: "Kota Pariaman", k1: 5, k2: 0, k3: 0, k4: 0, ket: "", kontribusiKoperasi: 7500, kontribusiDpw: 2500 },
  { no: 49, date: "2026-08-12", name: "Zainal Hamdi", city: "Kota Padang", k1: 7, k2: 4, k3: 8, k4: 2, ket: "", kontribusiKoperasi: 31500, kontribusiDpw: 10500 },
  { no: 50, date: "2026-08-20", name: "Muzimar", city: "Tanah Datar", k1: 18, k2: 17, k3: 14, k4: 21, ket: "", kontribusiKoperasi: 10500, kontribusiDpw: 35000 },
  { no: 51, date: "2026-08-27", name: "Hj. Sasra Rita", city: "Kota Padang", k1: 10, k2: 15, k3: 0, k4: 0, ket: "BB", kontribusiKoperasi: 37500, kontribusiDpw: 12500 },
  { no: 52, date: "2026-09-20", name: "Zainal Hamdi", city: "Kota Padang", k1: 3, k2: 1, k3: 3, k4: 2, ket: "", kontribusiKoperasi: 13500, kontribusiDpw: 4500 },
  { no: 53, date: "2026-09-21", name: "Hijrayati", city: "Lima Puluh Kota", k1: 28, k2: 25, k3: 14, k4: 20, ket: "", kontribusiKoperasi: 130500, kontribusiDpw: 43500 },
];

async function runSeed() {
  const url = process.env.DATABASE_URL;
  if (!url || !url.startsWith("postgres")) {
    console.error("❌ DATABASE_URL tidak ditemukan.");
    process.exit(1);
  }

  console.log("🔌 Menghubungkan ke Neon PostgreSQL...");
  const sqlClient = neon(url);
  const db = drizzle(sqlClient, { schema });

  // 1. Bersihkan tabel lama
  console.log("🗑️  Membersihkan database...");
  await db.delete(schema.stockEntries);
  await db.delete(schema.transactionItems);
  await db.delete(schema.transactions);
  await db.delete(schema.productVariants);
  await db.delete(schema.products);

  await db.execute(sql`ALTER SEQUENCE products_id_seq RESTART WITH 1`);
  await db.execute(sql`ALTER SEQUENCE product_variants_id_seq RESTART WITH 1`);
  await db.execute(sql`ALTER SEQUENCE transactions_id_seq RESTART WITH 1`);
  await db.execute(sql`ALTER SEQUENCE transaction_items_id_seq RESTART WITH 1`);
  await db.execute(sql`ALTER SEQUENCE stock_entries_id_seq RESTART WITH 1`);

  // 2. Insert Produk & Varian
  console.log("🌱 Menanam data produk...");
  const insertedVariantsMap: Record<string, { id: number; productId: number; name: string }> = {};

  for (const prod of INITIAL_PRODUCTS) {
    const [insertedProd] = await db
      .insert(schema.products)
      .values({
        name: prod.name,
        category: prod.category,
        hasVariants: prod.hasVariants,
        unit: prod.unit,
      })
      .returning();

    for (const v of prod.variants) {
      // Untuk Modul Semester 1, stok cetak awal = 1000 per kelas
      let initialStock = v.stockQuantity;
      if (prod.name.includes("Semester 1")) {
        initialStock = 1000;
      }

      const [insertedVar] = await db
        .insert(schema.productVariants)
        .values({
          productId: insertedProd.id,
          variantName: v.variantName,
          price: v.price,
          stockQuantity: initialStock,
          skuCode: v.skuCode || null,
        })
        .returning();

      insertedVariantsMap[`${prod.name}:::${v.variantName}`] = {
        id: insertedVar.id,
        productId: insertedProd.id,
        name: `${prod.name} - ${v.variantName}`,
      };

      // Catat stok awal ke stock_entries
      if (initialStock > 0) {
        await db.insert(schema.stockEntries).values({
          variantId: insertedVar.id,
          quantityAdded: initialStock,
          supplierOrNotes: prod.name.includes("Semester 1")
            ? "Cetakan Perdana Modul Semester 1 (Percetakan)"
            : "Stok Fisik Awal Gudang",
          createdAt: new Date("2026-07-01T08:00:00Z"),
        });
      }
    }
  }

  console.log("✅ Produk berhasil ditanam.");

  // 3. Masukkan 53 Transaksi Penjualan Modul
  console.log("📝 Memasukkan 53 transaksi riil dari Laporan Penjualan Modul...");

  const modulS1Map = {
    k1: insertedVariantsMap["Modul Santri Shaleh & Pintar (Semester 1):::Kelas 1"],
    k2: insertedVariantsMap["Modul Santri Shaleh & Pintar (Semester 1):::Kelas 2"],
    k3: insertedVariantsMap["Modul Santri Shaleh & Pintar (Semester 1):::Kelas 3"],
    k4: insertedVariantsMap["Modul Santri Shaleh & Pintar (Semester 1):::Kelas 4"],
  };

  const soldTotals = { k1: 0, k2: 0, k3: 0, k4: 0 };

  for (const row of REPORT_ROWS) {
    const totalQty = row.k1 + row.k2 + row.k3 + row.k4;
    soldTotals.k1 += row.k1;
    soldTotals.k2 += row.k2;
    soldTotals.k3 += row.k3;
    soldTotals.k4 += row.k4;

    const totalAmount = totalQty * 24000; // Harga koperasi Rp 24.000/buku
    const isBelumLunas = row.ket.toUpperCase().includes("BB");
    const padNo = String(row.no).padStart(3, "0");
    const monthStr = row.date.slice(5, 7);
    const invoiceNumber = `INV-26${monthStr}-${padNo}`;

    const [trx] = await db
      .insert(schema.transactions)
      .values({
        invoiceNumber,
        customerNameSnapshot: row.name,
        recipientName: row.name,
        recipientPhone: "-",
        citySnapshot: row.city,
        fullAddressSnapshot: `${row.city}, Sumatera Barat`,
        paymentStatus: isBelumLunas ? "Belum Lunas" : "Lunas",
        shippingStatus: "Sudah Dikirim",
        totalAmount,
        notes: row.ket
          ? `Keterangan: ${row.ket} | Kontribusi: Koperasi Rp ${row.kontribusiKoperasi.toLocaleString("id-ID")}, DPW Rp ${row.kontribusiDpw.toLocaleString("id-ID")}`
          : `Kontribusi: Koperasi Rp ${row.kontribusiKoperasi.toLocaleString("id-ID")}, DPW Rp ${row.kontribusiDpw.toLocaleString("id-ID")}`,
        createdAt: new Date(`${row.date}T10:00:00Z`),
      })
      .returning();

    // Insert items untuk masing-masing kelas yang dipesan
    const itemsToInsert: { varInfo: typeof modulS1Map.k1; qty: number }[] = [
      { varInfo: modulS1Map.k1, qty: row.k1 },
      { varInfo: modulS1Map.k2, qty: row.k2 },
      { varInfo: modulS1Map.k3, qty: row.k3 },
      { varInfo: modulS1Map.k4, qty: row.k4 },
    ];

    for (const item of itemsToInsert) {
      if (item.qty > 0 && item.varInfo) {
        await db.insert(schema.transactionItems).values({
          transactionId: trx.id,
          productId: item.varInfo.productId,
          variantId: item.varInfo.id,
          itemNameSnapshot: item.varInfo.name,
          unitPrice: 24000,
          quantity: item.qty,
          subtotal: item.qty * 24000,
        });
      }
    }
  }

  // 4. Update stok akhir Modul Semester 1: 1000 - totalTerjual
  console.log("📉 Mengurangi stok fisik sesuai total penjualan...");
  await db
    .update(schema.productVariants)
    .set({ stockQuantity: sql`stock_quantity - ${soldTotals.k1}` })
    .where(eq(schema.productVariants.id, modulS1Map.k1.id));

  await db
    .update(schema.productVariants)
    .set({ stockQuantity: sql`stock_quantity - ${soldTotals.k2}` })
    .where(eq(schema.productVariants.id, modulS1Map.k2.id));

  await db
    .update(schema.productVariants)
    .set({ stockQuantity: sql`stock_quantity - ${soldTotals.k3}` })
    .where(eq(schema.productVariants.id, modulS1Map.k3.id));

  await db
    .update(schema.productVariants)
    .set({ stockQuantity: sql`stock_quantity - ${soldTotals.k4}` })
    .where(eq(schema.productVariants.id, modulS1Map.k4.id));

  console.log("\n==============================================");
  console.log("📊 REKAP HASIL SEED:");
  console.log(`- Kelas I  : Cetak 1.000, Terjual ${soldTotals.k1}, Sisa ${1000 - soldTotals.k1}`);
  console.log(`- Kelas II : Cetak 1.000, Terjual ${soldTotals.k2}, Sisa ${1000 - soldTotals.k2}`);
  console.log(`- Kelas III: Cetak 1.000, Terjual ${soldTotals.k3}, Sisa ${1000 - soldTotals.k3}`);
  console.log(`- Kelas IV : Cetak 1.000, Terjual ${soldTotals.k4}, Sisa ${1000 - soldTotals.k4}`);
  console.log(`- Total Modul Terjual: ${soldTotals.k1 + soldTotals.k2 + soldTotals.k3 + soldTotals.k4}`);
  console.log(`- Total Sisa Modul   : ${4000 - (soldTotals.k1 + soldTotals.k2 + soldTotals.k3 + soldTotals.k4)}`);
  console.log("==============================================");
  console.log("🎉 Berhasil menyinkronkan 53 transaksi & stok ke Neon PostgreSQL!");
}

runSeed().catch((err) => {
  console.error("❌ Seed laporan gagal:", err);
  process.exit(1);
});
