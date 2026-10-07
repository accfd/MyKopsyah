/**
 * reseed.ts
 * Hapus semua produk lama & isi ulang database dengan data riil dari
 * Surat Edaran No. 001/KOP-SYAH/FKDT-SB/VI/2026
 *
 * Jalankan dengan: npx tsx reseed.ts
 */
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { sql } from "drizzle-orm";
import * as schema from "./src/db/schema";
import { INITIAL_PRODUCTS } from "./src/lib/initial-seed";

async function runReseed() {
  const url = process.env.DATABASE_URL;
  if (!url || !url.startsWith("postgres")) {
    console.error("❌ DATABASE_URL tidak ditemukan atau tidak valid.");
    process.exit(1);
  }

  console.log("🔌 Menghubungkan ke Neon PostgreSQL...");
  const sqlClient = neon(url);
  const db = drizzle(sqlClient, { schema });

  // ── 1. Hapus semua data lama (urutan: transaksi dulu, baru produk) ──
  console.log("🗑️  Menghapus data lama...");
  await db.delete(schema.stockEntries);
  await db.delete(schema.transactionItems);
  await db.delete(schema.transactions);
  await db.delete(schema.productVariants);
  await db.delete(schema.products);
  // Reset auto-increment sequences agar ID mulai dari 1 lagi
  await db.execute(sql`ALTER SEQUENCE products_id_seq RESTART WITH 1`);
  await db.execute(sql`ALTER SEQUENCE product_variants_id_seq RESTART WITH 1`);
  await db.execute(sql`ALTER SEQUENCE stock_entries_id_seq RESTART WITH 1`);
  console.log("✅ Data lama berhasil dihapus.");

  // ── 2. Isi ulang dengan data riil ──
  console.log("🌱 Mengisi data produk baru...");
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

    console.log(`  📦 ${insertedProd.name} (ID: ${insertedProd.id})`);

    for (const v of prod.variants) {
      const [insertedVar] = await db
        .insert(schema.productVariants)
        .values({
          productId: insertedProd.id,
          variantName: v.variantName,
          price: v.price,
          stockQuantity: v.stockQuantity,
          skuCode: v.skuCode || null,
        })
        .returning();

      // Catat sebagai stok awal (hanya jika > 0)
      if (v.stockQuantity > 0) {
        await db.insert(schema.stockEntries).values({
          variantId: insertedVar.id,
          quantityAdded: v.stockQuantity,
          supplierOrNotes: "Stok Awal — Edaran No. 001/KOP-SYAH/FKDT-SB/VI/2026",
        });
      }

      console.log(`     └─ ${v.variantName}: stok ${v.stockQuantity}, harga Rp ${v.price.toLocaleString("id-ID")}`);
    }
  }

  console.log("\n🎉 Reseed selesai! Database sudah berisi data riil.");
}

runReseed().catch((err) => {
  console.error("❌ Reseed gagal:", err);
  process.exit(1);
});
