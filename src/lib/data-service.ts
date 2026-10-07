import { db, schema, isDbConfigured } from "@/db";
import { eq, desc, sql } from "drizzle-orm";
import { INITIAL_PRODUCTS } from "./initial-seed";
import fs from "fs";
import path from "path";

export interface VariantData {
  id: number;
  productId: number;
  variantName: string;
  price: number;
  stockQuantity: number;
  skuCode?: string | null;
}

export interface ProductData {
  id: number;
  name: string;
  category: string;
  hasVariants: boolean;
  unit: string;
  variants: VariantData[];
}

export interface CustomerData {
  id: number;
  customerType: string;
  institutionName?: string | null;
  contactPerson: string;
  phoneNumber: string;
  city: string;
  province?: string | null;
  fullAddress?: string | null;
}

export interface TransactionItemData {
  id: number;
  transactionId: number;
  productId: number;
  variantId: number;
  itemNameSnapshot: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface TransactionData {
  id: number;
  invoiceNumber: string;
  customerId?: number | null;
  customerNameSnapshot: string;
  recipientName: string;
  recipientPhone: string;
  citySnapshot: string;
  fullAddressSnapshot?: string | null;
  paymentStatus: "Belum Lunas" | "Lunas";
  shippingStatus: "Belum Dikirim" | "Sudah Dikirim";
  totalAmount: number;
  notes?: string | null;
  createdAt: string;
  items: TransactionItemData[];
}

export interface StockEntryData {
  id: number;
  variantId: number;
  productName: string;
  variantName: string;
  quantityAdded: number;
  supplierOrNotes?: string | null;
  createdAt: string;
}

// Local File Store for instant local dev & fallback
const STORE_DIR = path.join(process.cwd(), "data");
const STORE_FILE = path.join(STORE_DIR, "store.json");

interface LocalStoreState {
  products: ProductData[];
  customers: CustomerData[];
  transactions: TransactionData[];
  stockEntries: StockEntryData[];
  nextIds: {
    product: number;
    variant: number;
    customer: number;
    transaction: number;
    transactionItem: number;
    stockEntry: number;
  };
}

function getInitialLocalStore(): LocalStoreState {
  let prodId = 1;
  let varId = 1;

  const seededProducts: ProductData[] = INITIAL_PRODUCTS.map((p) => {
    const currentProdId = prodId++;
    const vars: VariantData[] = p.variants.map((v) => ({
      id: varId++,
      productId: currentProdId,
      variantName: v.variantName,
      price: v.price,
      stockQuantity: v.stockQuantity,
      skuCode: v.skuCode || null,
    }));

    return {
      id: currentProdId,
      name: p.name,
      category: p.category,
      hasVariants: p.hasVariants,
      unit: p.unit,
      variants: vars,
    };
  });

  return {
    products: seededProducts,
    customers: [
      {
        id: 1,
        customerType: "Instansi / Pesantren",
        institutionName: "Ponpes Al-Hidayah",
        contactPerson: "Ust. Rahmat Hidayat",
        phoneNumber: "081234567890",
        city: "Kab. Sleman",
        province: "D.I. Yogyakarta",
        fullAddress: "Jl. Kaliurang KM 12, Besi, Sukoharjo, Ngaglik",
      },
      {
        id: 2,
        customerType: "Perorangan",
        institutionName: null,
        contactPerson: "Hj. Siti Aisyah",
        phoneNumber: "085678901234",
        city: "Kota Solo",
        province: "Jawa Tengah",
        fullAddress: "Pasar Kliwon No. 45",
      },
    ],
    transactions: [
      {
        id: 1,
        invoiceNumber: "KP-2610-0001",
        customerId: 1,
        customerNameSnapshot: "Ponpes Al-Hidayah (Ust. Rahmat)",
        recipientName: "Ust. Rahmat Hidayat",
        recipientPhone: "081234567890",
        citySnapshot: "Kab. Sleman",
        fullAddressSnapshot: "Jl. Kaliurang KM 12, Besi, Sleman, DIY",
        paymentStatus: "Belum Lunas",
        shippingStatus: "Belum Dikirim",
        totalAmount: 980000,
        notes: "Mohon dipacking rapi dengan kardus tebal",
        createdAt: new Date().toISOString(),
        items: [
          {
            id: 1,
            transactionId: 1,
            productId: 1,
            variantId: 4,
            itemNameSnapshot: "Baju Santri (Putra) - Ukuran 4",
            unitPrice: 85000,
            quantity: 8,
            subtotal: 680000,
          },
          {
            id: 2,
            transactionId: 1,
            productId: 4,
            variantId: 22,
            itemNameSnapshot: "Peci Santri - Ukuran 6",
            unitPrice: 45000,
            quantity: 6,
            subtotal: 270000,
          },
          {
            id: 3,
            transactionId: 1,
            productId: 3,
            variantId: 15,
            itemNameSnapshot: "Buku Santri Soleh - Kelas 2 - Semester 1",
            unitPrice: 35000,
            quantity: 1,
            subtotal: 35000,
          },
        ],
      },
    ],
    stockEntries: [
      {
        id: 1,
        variantId: 1,
        productName: "Baju Santri (Putra)",
        variantName: "Ukuran 1",
        quantityAdded: 20,
        supplierOrNotes: "Stok Masuk Awal (Konveksi Mas Dani)",
        createdAt: new Date().toISOString(),
      },
    ],
    nextIds: {
      product: prodId,
      variant: varId,
      customer: 3,
      transaction: 2,
      transactionItem: 4,
      stockEntry: 2,
    },
  };
}

function readLocalStore(): LocalStoreState {
  try {
    if (!fs.existsSync(STORE_DIR)) {
      fs.mkdirSync(STORE_DIR, { recursive: true });
    }
    if (!fs.existsSync(STORE_FILE)) {
      const initial = getInitialLocalStore();
      fs.writeFileSync(STORE_FILE, JSON.stringify(initial, null, 2), "utf-8");
      return initial;
    }
    const raw = fs.readFileSync(STORE_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (e) {
    console.error("Error reading local store, using fallback", e);
    return getInitialLocalStore();
  }
}

function writeLocalStore(state: LocalStoreState) {
  try {
    if (!fs.existsSync(STORE_DIR)) {
      fs.mkdirSync(STORE_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(state, null, 2), "utf-8");
  } catch (e) {
    console.error("Error writing to local store", e);
  }
}

// DATA SERVICES
export async function getProductsWithVariants(): Promise<ProductData[]> {
  if (isDbConfigured) {
    try {
      const allProds = await db.select().from(schema.produk);
      const allVars = await db.select().from(schema.varianProduk);

      return allProds.map((prod) => ({
        id: prod.id,
        name: prod.nama,
        category: prod.kategori,
        hasVariants: true,
        unit: prod.satuan,
        variants: allVars
          .filter((v) => v.produkId === prod.id)
          .map((v) => ({
            id: v.id,
            productId: v.produkId,
            variantName: v.namaVarian,
            price: v.harga,
            stockQuantity: v.jumlahStok,
            skuCode: v.kodeSku,
          })),
      }));
    } catch (err) {
      console.warn("Neon DB query failed, falling back to local store:", err);
    }
  }

  const store = readLocalStore();
  return store.products;
}

export async function updateVariantPrice(variantId: number, newPrice: number): Promise<boolean> {
  if (isDbConfigured) {
    try {
      await db
        .update(schema.varianProduk)
        .set({ harga: newPrice })
        .where(eq(schema.varianProduk.id, variantId));
      return true;
    } catch (e) {
      console.warn("Neon update price failed:", e);
    }
  }

  const store = readLocalStore();
  for (const prod of store.products) {
    const v = prod.variants.find((v) => v.id === variantId);
    if (v) {
      v.price = newPrice;
      writeLocalStore(store);
      return true;
    }
  }
  return false;
}

export async function addStockEntry(
  variantId: number,
  quantityAdded: number,
  supplierOrNotes?: string
): Promise<{ success: boolean; error?: string }> {
  if (quantityAdded <= 0) {
    return { success: false, error: "Jumlah barang masuk harus lebih dari 0" };
  }

  if (isDbConfigured) {
    try {
      await db.insert(schema.riwayatStok).values({
        varianId: variantId,
        jumlahMasuk: quantityAdded,
        keterangan: supplierOrNotes || null,
      });

      await db
        .update(schema.varianProduk)
        .set({
          jumlahStok: sql`${schema.varianProduk.jumlahStok} + ${quantityAdded}`,
        })
        .where(eq(schema.varianProduk.id, variantId));

      return { success: true };
    } catch (e: any) {
      console.warn("Neon stock entry failed:", e);
      return { success: false, error: e.message };
    }
  }

  const store = readLocalStore();
  let foundVar: VariantData | null = null;
  let foundProd: ProductData | null = null;

  for (const p of store.products) {
    const v = p.variants.find((item) => item.id === variantId);
    if (v) {
      foundVar = v;
      foundProd = p;
      break;
    }
  }

  if (!foundVar || !foundProd) {
    return { success: false, error: "Varian produk tidak ditemukan" };
  }

  foundVar.stockQuantity += quantityAdded;
  store.stockEntries.unshift({
    id: store.nextIds.stockEntry++,
    variantId,
    productName: foundProd.name,
    variantName: foundVar.variantName,
    quantityAdded,
    supplierOrNotes: supplierOrNotes || "Barang Masuk",
    createdAt: new Date().toISOString(),
  });

  writeLocalStore(store);
  return { success: true };
}

export interface BatchStockItem {
  variantId: number;
  quantityAdded: number;
}

export async function addBatchStockEntries(
  items: BatchStockItem[],
  supplierOrNotes?: string
): Promise<{ success: boolean; error?: string }> {
  const validItems = items.filter((it) => it.quantityAdded > 0);
  if (validItems.length === 0) {
    return { success: false, error: "Jumlah barang masuk harus lebih dari 0" };
  }

  if (isDbConfigured) {
    try {
      for (const it of validItems) {
        await db.insert(schema.riwayatStok).values({
          varianId: it.variantId,
          jumlahMasuk: it.quantityAdded,
          keterangan: supplierOrNotes || null,
        });

        await db
          .update(schema.varianProduk)
          .set({
            jumlahStok: sql`${schema.varianProduk.jumlahStok} + ${it.quantityAdded}`,
          })
          .where(eq(schema.varianProduk.id, it.variantId));
      }
      return { success: true };
    } catch (e: any) {
      console.warn("Neon batch stock entry failed:", e);
      return { success: false, error: e.message };
    }
  }

  const store = readLocalStore();
  for (const it of validItems) {
    let foundVar: VariantData | null = null;
    let foundProd: ProductData | null = null;

    for (const p of store.products) {
      const v = p.variants.find((item) => item.id === it.variantId);
      if (v) {
        foundVar = v;
        foundProd = p;
        break;
      }
    }

    if (foundVar && foundProd) {
      foundVar.stockQuantity += it.quantityAdded;
      store.stockEntries.unshift({
        id: store.nextIds.stockEntry++,
        variantId: it.variantId,
        productName: foundProd.name,
        variantName: foundVar.variantName,
        quantityAdded: it.quantityAdded,
        supplierOrNotes: supplierOrNotes || "Barang Masuk",
        createdAt: new Date().toISOString(),
      });
    }
  }

  writeLocalStore(store);
  return { success: true };
}

export interface CreateProductInput {
  name: string;
  category: "Seragam" | "Buku" | "Aksesoris";
  unit: string;
  variants: {
    variantName: string;
    price: number;
    initialStock: number;
    skuCode?: string;
  }[];
}

export async function createProduct(
  input: CreateProductInput
): Promise<{ success: boolean; productId?: number; error?: string }> {
  if (!input.name || input.name.trim().length === 0) {
    return { success: false, error: "Nama produk wajib diisi" };
  }
  if (!input.variants || input.variants.length === 0) {
    return { success: false, error: "Minimal harus ada 1 varian produk" };
  }

  const cleanName = input.name.trim();
  const cleanCategory = input.category;
  const cleanUnit = input.unit.trim() || "Pcs";

  if (isDbConfigured) {
    try {
      const [newProd] = await db
        .insert(schema.produk)
        .values({
          nama: cleanName,
          kategori: cleanCategory,
          satuan: cleanUnit,
        })
        .returning({ id: schema.produk.id });

      for (const v of input.variants) {
        const [newVar] = await db
          .insert(schema.varianProduk)
          .values({
            produkId: newProd.id,
            namaVarian: v.variantName.trim(),
            harga: Math.max(0, v.price),
            jumlahStok: Math.max(0, v.initialStock),
            kodeSku: v.skuCode?.trim() || null,
          })
          .returning({ id: schema.varianProduk.id });

        if (v.initialStock > 0) {
          await db.insert(schema.riwayatStok).values({
            varianId: newVar.id,
            jumlahMasuk: v.initialStock,
            keterangan: "Stok Awal Produk Baru",
          });
        }
      }

      return { success: true, productId: newProd.id };
    } catch (e: any) {
      console.warn("Neon create product failed:", e);
      return { success: false, error: e.message };
    }
  }

  const store = readLocalStore();
  const newProdId = store.nextIds.product++;
  const createdVariants: VariantData[] = [];

  for (const v of input.variants) {
    const newVarId = store.nextIds.variant++;
    createdVariants.push({
      id: newVarId,
      productId: newProdId,
      variantName: v.variantName.trim(),
      price: Math.max(0, v.price),
      stockQuantity: Math.max(0, v.initialStock),
      skuCode: v.skuCode?.trim() || undefined,
    });

    if (v.initialStock > 0) {
      store.stockEntries.unshift({
        id: store.nextIds.stockEntry++,
        variantId: newVarId,
        productName: cleanName,
        variantName: v.variantName.trim(),
        quantityAdded: v.initialStock,
        supplierOrNotes: "Stok Awal Produk Baru",
        createdAt: new Date().toISOString(),
      });
    }
  }

  store.products.push({
    id: newProdId,
    name: cleanName,
    category: cleanCategory,
    hasVariants: true,
    unit: cleanUnit,
    variants: createdVariants,
  });

  writeLocalStore(store);
  return { success: true, productId: newProdId };
}

export async function getProductById(productId: number): Promise<ProductData | null> {
  const products = await getProductsWithVariants();
  return products.find((p) => p.id === productId) || null;
}

export interface UpdateProductInput {
  name: string;
  category: "Seragam" | "Buku" | "Aksesoris";
  unit: string;
  variants: Array<{
    id?: number;
    variantName: string;
    price: number;
    stockQuantity: number;
    skuCode?: string;
  }>;
}

export async function updateProduct(
  productId: number,
  input: UpdateProductInput
): Promise<{ success: boolean; error?: string }> {
  if (!input.name || input.name.trim().length === 0) {
    return { success: false, error: "Nama produk wajib diisi" };
  }
  if (!input.variants || input.variants.length === 0) {
    return { success: false, error: "Minimal harus ada 1 varian produk" };
  }

  const cleanName = input.name.trim();
  const cleanCategory = input.category;
  const cleanUnit = input.unit.trim() || "Pcs";

  if (isDbConfigured) {
    try {
      await db
        .update(schema.produk)
        .set({
          nama: cleanName,
          kategori: cleanCategory,
          satuan: cleanUnit,
        })
        .where(eq(schema.produk.id, productId));

      for (const v of input.variants) {
        if (v.id) {
          // Update existing variant
          await db
            .update(schema.varianProduk)
            .set({
              namaVarian: v.variantName.trim(),
              harga: Math.max(0, v.price),
              jumlahStok: Math.max(0, v.stockQuantity),
              kodeSku: v.skuCode?.trim() || null,
            })
            .where(eq(schema.varianProduk.id, v.id));
        } else {
          // Insert new variant
          await db.insert(schema.varianProduk).values({
            produkId: productId,
            namaVarian: v.variantName.trim(),
            harga: Math.max(0, v.price),
            jumlahStok: Math.max(0, v.stockQuantity),
            kodeSku: v.skuCode?.trim() || null,
          });
        }
      }
      return { success: true };
    } catch (e: any) {
      console.warn("Neon update product failed:", e);
      return { success: false, error: e.message };
    }
  }

  const store = readLocalStore();
  const prodIndex = store.products.findIndex((p) => p.id === productId);
  if (prodIndex === -1) {
    return { success: false, error: "Produk tidak ditemukan" };
  }

  const targetProd = store.products[prodIndex];
  targetProd.name = cleanName;
  targetProd.category = cleanCategory;
  targetProd.unit = cleanUnit;

  const updatedVariants: VariantData[] = [];
  for (const v of input.variants) {
    if (v.id) {
      const existing = targetProd.variants.find((item) => item.id === v.id);
      if (existing) {
        existing.variantName = v.variantName.trim();
        existing.price = Math.max(0, v.price);
        existing.stockQuantity = Math.max(0, v.stockQuantity);
        existing.skuCode = v.skuCode?.trim() || undefined;
        updatedVariants.push(existing);
      } else {
        const newId = store.nextIds.variant++;
        updatedVariants.push({
          id: newId,
          productId,
          variantName: v.variantName.trim(),
          price: Math.max(0, v.price),
          stockQuantity: Math.max(0, v.stockQuantity),
          skuCode: v.skuCode?.trim() || undefined,
        });
      }
    } else {
      const newId = store.nextIds.variant++;
      updatedVariants.push({
        id: newId,
        productId,
        variantName: v.variantName.trim(),
        price: Math.max(0, v.price),
        stockQuantity: Math.max(0, v.stockQuantity),
        skuCode: v.skuCode?.trim() || undefined,
      });
    }
  }

  targetProd.variants = updatedVariants;
  writeLocalStore(store);
  return { success: true };
}

export interface StockAdjustmentItem {
  variantId: number;
  mode: "TAMBAH" | "SET_FISIK";
  quantity: number; // TAMBAH: delta to add (> 0), SET_FISIK: target final stock (>= 0)
}

export async function processStockAdjustment(
  items: StockAdjustmentItem[],
  supplierOrNotes?: string
): Promise<{ success: boolean; error?: string }> {
  if (!items || items.length === 0) {
    return { success: false, error: "Pilih minimal 1 varian untuk diperbarui." };
  }

  if (isDbConfigured) {
    try {
      for (const item of items) {
        const [currVar] = await db
          .select()
          .from(schema.varianProduk)
          .where(eq(schema.varianProduk.id, item.variantId))
          .limit(1);

        if (!currVar) continue;

        let delta = 0;
        let newStock = currVar.jumlahStok;

        if (item.mode === "TAMBAH") {
          delta = Math.max(0, item.quantity);
          newStock = currVar.jumlahStok + delta;
        } else {
          newStock = Math.max(0, item.quantity);
          delta = newStock - currVar.jumlahStok;
        }

        if (delta !== 0 || item.mode === "SET_FISIK") {
          await db
            .update(schema.varianProduk)
            .set({ jumlahStok: newStock })
            .where(eq(schema.varianProduk.id, item.variantId));

          await db.insert(schema.riwayatStok).values({
            varianId: item.variantId,
            jumlahMasuk: delta,
            keterangan:
              supplierOrNotes ||
              (item.mode === "SET_FISIK" ? "Penyesuaian Fisik (Opname)" : "Stok Masuk"),
          });
        }
      }
      return { success: true };
    } catch (e: any) {
      console.warn("Neon process stock adjustment failed:", e);
      return { success: false, error: e.message };
    }
  }

  const store = readLocalStore();
  for (const item of items) {
    let foundVar: VariantData | null = null;
    let foundProd: ProductData | null = null;

    for (const p of store.products) {
      const v = p.variants.find((vIt) => vIt.id === item.variantId);
      if (v) {
        foundVar = v;
        foundProd = p;
        break;
      }
    }

    if (!foundVar || !foundProd) continue;

    let delta = 0;
    if (item.mode === "TAMBAH") {
      delta = Math.max(0, item.quantity);
      foundVar.stockQuantity += delta;
    } else {
      const targetStock = Math.max(0, item.quantity);
      delta = targetStock - foundVar.stockQuantity;
      foundVar.stockQuantity = targetStock;
    }

    if (delta !== 0 || item.mode === "SET_FISIK") {
      store.stockEntries.unshift({
        id: store.nextIds.stockEntry++,
        variantId: item.variantId,
        productName: foundProd.name,
        variantName: foundVar.variantName,
        quantityAdded: delta,
        supplierOrNotes:
          supplierOrNotes ||
          (item.mode === "SET_FISIK" ? "Penyesuaian Fisik (Opname)" : "Stok Masuk"),
        createdAt: new Date().toISOString(),
      });
    }
  }

  writeLocalStore(store);
  return { success: true };
}

export interface StockBatchData {
  batchId: string;
  batchKey: string;
  createdAt: string;
  supplierOrNotes: string;
  totalQuantity: number;
  totalVariants: number;
  entries: StockEntryData[];
}

export function groupStockEntriesIntoBatches(entries: StockEntryData[]): StockBatchData[] {
  const map = new Map<string, StockEntryData[]>();

  for (const entry of entries) {
    const timeKey = entry.createdAt ? entry.createdAt.slice(0, 16) : "unknown";
    const notesKey = (entry.supplierOrNotes || "Barang Masuk").trim().toLowerCase();
    const groupKey = `${timeKey}_${notesKey}`;

    if (!map.has(groupKey)) {
      map.set(groupKey, []);
    }
    map.get(groupKey)!.push(entry);
  }

  const batches: StockBatchData[] = [];
  let index = 1;

  for (const [key, groupEntries] of map.entries()) {
    const first = groupEntries[0];
    const d = new Date(first.createdAt);
    const yy = isNaN(d.getTime()) ? "26" : String(d.getFullYear()).slice(-2);
    const mm = isNaN(d.getTime()) ? "07" : String(d.getMonth() + 1).padStart(2, "0");
    const idNum = String(index).padStart(4, "0");
    const batchId = `BM-${yy}${mm}-${idNum}`;

    batches.push({
      batchId,
      batchKey: encodeURIComponent(key),
      createdAt: first.createdAt,
      supplierOrNotes: first.supplierOrNotes || "Penerimaan Barang",
      totalQuantity: groupEntries.reduce((sum, it) => sum + it.quantityAdded, 0),
      totalVariants: groupEntries.length,
      entries: groupEntries,
    });
    index++;
  }

  return batches;
}

export async function getStockBatchById(batchId: string): Promise<StockBatchData | null> {
  const entries = await getStockEntries(500);
  const batches = groupStockEntriesIntoBatches(entries);
  return batches.find((b) => b.batchId.toUpperCase() === batchId.toUpperCase()) || null;
}

export async function getStockEntries(limit = 200): Promise<StockEntryData[]> {
  if (isDbConfigured) {
    try {
      const entries = await db
        .select({
          id: schema.riwayatStok.id,
          variantId: schema.riwayatStok.varianId,
          productName: schema.produk.nama,
          variantName: schema.varianProduk.namaVarian,
          quantityAdded: schema.riwayatStok.jumlahMasuk,
          supplierOrNotes: schema.riwayatStok.keterangan,
          createdAt: schema.riwayatStok.dibuatPada,
        })
        .from(schema.riwayatStok)
        .innerJoin(
          schema.varianProduk,
          eq(schema.riwayatStok.varianId, schema.varianProduk.id)
        )
        .innerJoin(schema.produk, eq(schema.varianProduk.produkId, schema.produk.id))
        .orderBy(desc(schema.riwayatStok.dibuatPada))
        .limit(limit);

      return entries.map((e) => ({
        ...e,
        createdAt: e.createdAt.toISOString(),
      }));
    } catch (err) {
      console.warn("Neon query stock entries failed:", err);
    }
  }

  const store = readLocalStore();
  return store.stockEntries.slice(0, limit);
}

export async function getTransactions(): Promise<TransactionData[]> {
  if (isDbConfigured) {
    try {
      const txs = await db
        .select()
        .from(schema.transaksi)
        .orderBy(desc(schema.transaksi.dibuatPada));
      const items = await db.select().from(schema.itemTransaksi);

      return txs.map((tx) => ({
        id: tx.id,
        invoiceNumber: tx.nomorNota,
        customerId: tx.pelangganId,
        customerNameSnapshot: tx.namaPenerima,
        recipientName: tx.namaPenerima,
        recipientPhone: tx.teleponPenerima,
        citySnapshot: tx.kotaTujuan,
        fullAddressSnapshot: tx.alamatTujuan,
        paymentStatus: tx.statusPembayaran as "Belum Lunas" | "Lunas",
        shippingStatus: tx.statusPengiriman as "Belum Dikirim" | "Sudah Dikirim",
        totalAmount: tx.totalTagihan,
        notes: tx.catatan,
        createdAt: tx.dibuatPada.toISOString(),
        items: items
          .filter((it) => it.transaksiId === tx.id)
          .map((it) => ({
            id: it.id,
            transactionId: it.transaksiId,
            productId: it.produkId || 0,
            variantId: it.varianId || 0,
            itemNameSnapshot: it.namaItem,
            unitPrice: it.hargaSatuan,
            quantity: it.jumlah,
            subtotal: it.subtotal,
          })),
      }));
    } catch (e) {
      console.warn("Neon get transactions failed:", e);
    }
  }

  const store = readLocalStore();
  return store.transactions;
}

export async function getTransactionById(id: number): Promise<TransactionData | null> {
  const all = await getTransactions();
  return all.find((t) => t.id === id) || null;
}

export interface CreateTransactionInput {
  recipientName: string;
  recipientPhone: string;
  city: string;
  fullAddress?: string;
  paymentStatus: "Belum Lunas" | "Lunas";
  shippingStatus: "Belum Dikirim" | "Sudah Dikirim";
  notes?: string;
  items: {
    productId: number;
    variantId: number;
    itemName: string;
    unitPrice: number;
    quantity: number;
  }[];
}

export async function createTransaction(
  input: CreateTransactionInput
): Promise<{ success: boolean; invoiceNumber?: string; transactionId?: number; error?: string }> {
  if (!input.items || input.items.length === 0) {
    return { success: false, error: "Pesanan harus memiliki minimal 1 item" };
  }

  const now = new Date();
  const yearMonth = `${now.getFullYear().toString().slice(-2)}${(now.getMonth() + 1)
    .toString()
    .padStart(2, "0")}`;

  let totalAmount = 0;
  for (const it of input.items) {
    totalAmount += it.unitPrice * it.quantity;
  }

  // --- PATH A: Neon DB configured → use Neon as source of truth ---
  if (isDbConfigured) {
    // Validate stock from Neon
    for (const item of input.items) {
      const [variant] = await db
        .select({ stockQuantity: schema.varianProduk.jumlahStok })
        .from(schema.varianProduk)
        .where(eq(schema.varianProduk.id, item.variantId))
        .limit(1);

      const stockAvailable = variant?.stockQuantity ?? 0;
      if (item.quantity > stockAvailable) {
        return {
          success: false,
          error: `Stok untuk "${item.itemName}" tidak mencukupi (sisa ${stockAvailable}, diminta ${item.quantity})`,
        };
      }
    }

    try {
      // Upsert / Link Pelanggan
      let linkedCustomerId: number | null = null;
      const cleanCustomerName = input.recipientName.trim();
      if (cleanCustomerName) {
        const [existingCust] = await db
          .select({ id: schema.pelanggan.id })
          .from(schema.pelanggan)
          .where(sql`LOWER(TRIM(${schema.pelanggan.nama})) = LOWER(TRIM(${cleanCustomerName}))`)
          .limit(1);

        if (existingCust) {
          linkedCustomerId = existingCust.id;
        } else {
          const isInstansi =
            cleanCustomerName.toLowerCase().includes("ponpes") ||
            cleanCustomerName.toLowerCase().includes("pesantren") ||
            cleanCustomerName.toLowerCase().includes("yayasan") ||
            cleanCustomerName.toLowerCase().includes("sekolah");
          const [newCust] = await db
            .insert(schema.pelanggan)
            .values({
              nama: cleanCustomerName,
              noTelepon: input.recipientPhone,
              kota: input.city,
              alamatLengkap: input.fullAddress || null,
              tipePelanggan: isInstansi ? "Instansi / Pesantren" : "Perorangan / Wali Santri",
            })
            .returning({ id: schema.pelanggan.id });
          linkedCustomerId = newCust.id;
        }
      }

      // Count existing transactions to generate invoice number
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(schema.transaksi);
      const seq = Number(count) + 1;
      const invoiceNumber = `KP-${yearMonth}-${seq.toString().padStart(4, "0")}`;

      const [insertedTx] = await db
        .insert(schema.transaksi)
        .values({
          nomorNota: invoiceNumber,
          pelangganId: linkedCustomerId,
          namaPenerima: input.recipientName,
          teleponPenerima: input.recipientPhone,
          kotaTujuan: input.city,
          alamatTujuan: input.fullAddress || null,
          statusPembayaran: input.paymentStatus,
          statusPengiriman: input.shippingStatus,
          totalTagihan: totalAmount,
          catatan: input.notes || null,
        })
        .returning();

      const neonTxId = insertedTx.id;

      for (const item of input.items) {
        await db.insert(schema.itemTransaksi).values({
          transaksiId: insertedTx.id,
          produkId: item.productId,
          varianId: item.variantId,
          namaItem: item.itemName,
          hargaSatuan: item.unitPrice,
          jumlah: item.quantity,
          subtotal: item.unitPrice * item.quantity,
        });

        await db
          .update(schema.varianProduk)
          .set({
            jumlahStok: sql`${schema.varianProduk.jumlahStok} - ${item.quantity}`,
          })
          .where(eq(schema.varianProduk.id, item.variantId));
      }

      return { success: true, invoiceNumber, transactionId: neonTxId };
    } catch (err: any) {
      console.error("Neon createTransaction failed:", err);
      return { success: false, error: err.message || "Gagal menyimpan ke database" };
    }
  }

  // --- PATH B: No DB → use local file store ---
  const store = readLocalStore();

  // Validate stock from local store
  for (const item of input.items) {
    let stockAvailable = 0;
    for (const p of store.products) {
      const v = p.variants.find((va) => va.id === item.variantId);
      if (v) { stockAvailable = v.stockQuantity; break; }
    }
    if (item.quantity > stockAvailable) {
      return {
        success: false,
        error: `Stok untuk "${item.itemName}" tidak mencukupi (sisa ${stockAvailable}, diminta ${item.quantity})`,
      };
    }
  }

  // Deduct stock in local store
  for (const item of input.items) {
    for (const p of store.products) {
      const v = p.variants.find((va) => va.id === item.variantId);
      if (v) { v.stockQuantity -= item.quantity; break; }
    }
  }

  const txId = store.nextIds.transaction++;
  const invoiceNumber = `KP-${yearMonth}-${txId.toString().padStart(4, "0")}`;

  const transactionItemsData: TransactionItemData[] = input.items.map((it) => {
    const subtotal = it.unitPrice * it.quantity;
    return {
      id: store.nextIds.transactionItem++,
      transactionId: txId,
      productId: it.productId,
      variantId: it.variantId,
      itemNameSnapshot: it.itemName,
      unitPrice: it.unitPrice,
      quantity: it.quantity,
      subtotal,
    };
  });

  const newTx: TransactionData = {
    id: txId,
    invoiceNumber,
    customerNameSnapshot: input.recipientName,
    recipientName: input.recipientName,
    recipientPhone: input.recipientPhone,
    citySnapshot: input.city,
    fullAddressSnapshot: input.fullAddress || "",
    paymentStatus: input.paymentStatus,
    shippingStatus: input.shippingStatus,
    totalAmount,
    notes: input.notes || "",
    createdAt: now.toISOString(),
    items: transactionItemsData,
  };

  store.transactions.unshift(newTx);
  writeLocalStore(store);

  return { success: true, invoiceNumber, transactionId: txId };
}

export async function updateTransactionStatus(
  transactionId: number,
  updates: { paymentStatus?: "Belum Lunas" | "Lunas"; shippingStatus?: "Belum Dikirim" | "Sudah Dikirim" }
): Promise<boolean> {
  const store = readLocalStore();
  const tx = store.transactions.find((t) => t.id === transactionId);
  if (tx) {
    if (updates.paymentStatus) tx.paymentStatus = updates.paymentStatus;
    if (updates.shippingStatus) tx.shippingStatus = updates.shippingStatus;
    writeLocalStore(store);
  }

  if (isDbConfigured) {
    try {
      const dbUpdates: any = {};
      if (updates.paymentStatus) dbUpdates.statusPembayaran = updates.paymentStatus;
      if (updates.shippingStatus) dbUpdates.statusPengiriman = updates.shippingStatus;
      await db
        .update(schema.transaksi)
        .set(dbUpdates)
        .where(eq(schema.transaksi.id, transactionId));
    } catch (e) {
      console.warn("Neon update transaction status failed:", e);
    }
  }

  return true;
}

export async function deleteTransaction(transactionId: number): Promise<{ success: boolean; error?: string }> {
  const store = readLocalStore();
  const txIndex = store.transactions.findIndex((t) => t.id === transactionId);
  if (txIndex === -1) {
    return { success: false, error: "Nota transaksi tidak ditemukan" };
  }

  const tx = store.transactions[txIndex];

  // Cegah penghapusan jika sudah Lunas dan Sudah Dikirim (Terkunci)
  if (tx.paymentStatus === "Lunas" && tx.shippingStatus === "Sudah Dikirim") {
    return {
      success: false,
      error: "Nota transaksi telah Lunas dan Selesai Dikirim sehingga berstatus arsip resmi dan tidak dapat dihapus demi integritas pembukuan.",
    };
  }

  // Rollback stock
  for (const item of tx.items) {
    for (const p of store.products) {
      const v = p.variants.find((va) => va.id === item.variantId);
      if (v) {
        v.stockQuantity += item.quantity;
        break;
      }
    }
  }

  store.transactions.splice(txIndex, 1);
  writeLocalStore(store);

  if (isDbConfigured) {
    try {
      for (const item of tx.items) {
        await db
          .update(schema.varianProduk)
          .set({
            jumlahStok: sql`${schema.varianProduk.jumlahStok} + ${item.quantity}`,
          })
          .where(eq(schema.varianProduk.id, item.variantId));
      }
      await db.delete(schema.transaksi).where(eq(schema.transaksi.id, transactionId));
    } catch (e: any) {
      console.warn("Neon delete transaction rollback failed:", e);
    }
  }

  return { success: true };
}

export interface PelangganData {
  id: number;
  tipePelanggan: string;
  nama: string;
  noTelepon: string;
  kota: string;
  provinsi?: string | null;
  alamatLengkap?: string | null;
  dibuatPada: string;
}

export async function getPelanggan(): Promise<PelangganData[]> {
  if (isDbConfigured) {
    try {
      const records = await db
        .select()
        .from(schema.pelanggan)
        .orderBy(desc(schema.pelanggan.dibuatPada));
      return records.map((p) => ({
        id: p.id,
        tipePelanggan: p.tipePelanggan,
        nama: p.nama,
        noTelepon: p.noTelepon,
        kota: p.kota,
        provinsi: p.provinsi,
        alamatLengkap: p.alamatLengkap,
        dibuatPada: p.dibuatPada.toISOString(),
      }));
    } catch (e) {
      console.warn("Neon getPelanggan failed:", e);
    }
  }

  const store = readLocalStore();
  return store.customers.map((c) => ({
    id: c.id,
    tipePelanggan: c.customerType,
    nama: c.contactPerson,
    noTelepon: c.phoneNumber,
    kota: c.city,
    provinsi: c.province,
    alamatLengkap: c.fullAddress,
    dibuatPada: new Date().toISOString(),
  }));
}

export const getCustomers = getPelanggan;

export interface CreatePelangganInput {
  nama: string;
  tipePelanggan?: string;
  noTelepon: string;
  kota: string;
  provinsi?: string;
  alamatLengkap?: string;
}

export async function createPelanggan(
  input: CreatePelangganInput
): Promise<{ success: boolean; pelangganId?: number; error?: string }> {
  if (!input.nama || !input.nama.trim()) {
    return { success: false, error: "Nama pelanggan wajib diisi" };
  }
  if (!input.noTelepon || !input.noTelepon.trim()) {
    return { success: false, error: "Nomor telepon/WhatsApp wajib diisi" };
  }
  if (!input.kota || !input.kota.trim()) {
    return { success: false, error: "Kota / Kabupaten asal wajib dipilih" };
  }

  const cleanNama = input.nama.trim();
  const cleanPhone = input.noTelepon.trim();
  const cleanKota = input.kota.trim();
  const cleanTipe = input.tipePelanggan?.trim() || "Perorangan / Wali Santri";
  const cleanAlamat = input.alamatLengkap?.trim() || null;
  const cleanProv = input.provinsi?.trim() || "Sumatera Barat";

  if (isDbConfigured) {
    try {
      const [inserted] = await db
        .insert(schema.pelanggan)
        .values({
          nama: cleanNama,
          tipePelanggan: cleanTipe,
          noTelepon: cleanPhone,
          kota: cleanKota,
          provinsi: cleanProv,
          alamatLengkap: cleanAlamat,
        })
        .returning({ id: schema.pelanggan.id });
      return { success: true, pelangganId: inserted.id };
    } catch (e: any) {
      console.warn("Neon createPelanggan failed:", e);
      return { success: false, error: e.message };
    }
  }

  const store = readLocalStore();
  const newId = store.nextIds.customer++;
  store.customers.unshift({
    id: newId,
    customerType: cleanTipe,
    institutionName: cleanTipe.includes("Instansi") ? cleanNama : null,
    contactPerson: cleanNama,
    phoneNumber: cleanPhone,
    city: cleanKota,
    province: cleanProv,
    fullAddress: cleanAlamat,
  });
  writeLocalStore(store);
  return { success: true, pelangganId: newId };
}

export async function updatePelanggan(
  id: number,
  input: Partial<CreatePelangganInput>
): Promise<{ success: boolean; error?: string }> {
  if (isDbConfigured) {
    try {
      const updates: any = {};
      if (input.nama !== undefined) updates.nama = input.nama.trim();
      if (input.tipePelanggan !== undefined) updates.tipePelanggan = input.tipePelanggan.trim();
      if (input.noTelepon !== undefined) updates.noTelepon = input.noTelepon.trim();
      if (input.kota !== undefined) updates.kota = input.kota.trim();
      if (input.provinsi !== undefined) updates.provinsi = input.provinsi.trim();
      if (input.alamatLengkap !== undefined) updates.alamatLengkap = input.alamatLengkap.trim();

      await db.update(schema.pelanggan).set(updates).where(eq(schema.pelanggan.id, id));
      return { success: true };
    } catch (e: any) {
      console.warn("Neon updatePelanggan failed:", e);
      return { success: false, error: e.message };
    }
  }

  const store = readLocalStore();
  const target = store.customers.find((c) => c.id === id);
  if (target) {
    if (input.nama) { target.contactPerson = input.nama; target.institutionName = input.nama; }
    if (input.noTelepon) target.phoneNumber = input.noTelepon;
    if (input.kota) target.city = input.kota;
    if (input.alamatLengkap) target.fullAddress = input.alamatLengkap;
    if (input.tipePelanggan) target.customerType = input.tipePelanggan;
    writeLocalStore(store);
    return { success: true };
  }
  return { success: false, error: "Pelanggan tidak ditemukan" };
}

export async function deletePelanggan(id: number): Promise<{ success: boolean; error?: string }> {
  if (isDbConfigured) {
    try {
      await db.delete(schema.pelanggan).where(eq(schema.pelanggan.id, id));
      return { success: true };
    } catch (e: any) {
      console.warn("Neon deletePelanggan failed:", e);
      return { success: false, error: e.message };
    }
  }

  const store = readLocalStore();
  const index = store.customers.findIndex((c) => c.id === id);
  if (index !== -1) {
    store.customers.splice(index, 1);
    writeLocalStore(store);
    return { success: true };
  }
  return { success: false, error: "Pelanggan tidak ditemukan" };
}

export async function getRegionalReport() {
  const txs = await getTransactions();

  const map = new Map<
    string,
    {
      city: string;
      transactionCount: number;
      totalItemsSold: number;
      totalRevenue: number;
      pendingPaymentCount: number;
    }
  >();

  for (const tx of txs) {
    const city = tx.citySnapshot.trim() || "Tidak Diketahui";
    const existing = map.get(city) || {
      city,
      transactionCount: 0,
      totalItemsSold: 0,
      totalRevenue: 0,
      pendingPaymentCount: 0,
    };

    existing.transactionCount += 1;
    existing.totalRevenue += tx.totalAmount;
    if (tx.paymentStatus === "Belum Lunas") {
      existing.pendingPaymentCount += 1;
    }
    for (const item of tx.items) {
      existing.totalItemsSold += item.quantity;
    }

    map.set(city, existing);
  }

  return Array.from(map.values()).sort((a, b) => b.totalRevenue - a.totalRevenue);
}
