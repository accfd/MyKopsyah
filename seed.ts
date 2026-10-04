import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./src/db/schema";
import { INITIAL_PRODUCTS } from "./src/lib/initial-seed";

async function runSeed() {
  const url = process.env.DATABASE_URL;
  if (!url || !url.startsWith("postgres")) {
    console.log("DATABASE_URL is not set or invalid. Skipping remote Neon seed.");
    return;
  }

  console.log("Connecting to Neon PostgreSQL...");
  const sqlClient = neon(url);
  const db = drizzle(sqlClient, { schema });

  console.log("Seeding products and variants...");
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

      // Seed initial stock entry
      await db.insert(schema.stockEntries).values({
        variantId: insertedVar.id,
        quantityAdded: v.stockQuantity,
        supplierOrNotes: "Stok Awal Sistem",
      });
    }
  }

  console.log("Seed completed successfully!");
}

runSeed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
