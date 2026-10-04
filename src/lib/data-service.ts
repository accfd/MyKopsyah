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
      const allProds = await db.select().from(schema.products);
      const allVars = await db.select().from(schema.productVariants);

      return allProds.map((prod) => ({
        id: prod.id,
        name: prod.name,
        category: prod.category,
        hasVariants: prod.hasVariants,
        unit: prod.unit,
        variants: allVars
          .filter((v) => v.productId === prod.id)
          .map((v) => ({
            id: v.id,
            productId: v.productId,
            variantName: v.variantName,
            price: v.price,
            stockQuantity: v.stockQuantity,
            skuCode: v.skuCode,
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
        .update(schema.productVariants)
        .set({ price: newPrice })
        .where(eq(schema.productVariants.id, variantId));
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
      await db.insert(schema.stockEntries).values({
        variantId,
        quantityAdded,
        supplierOrNotes: supplierOrNotes || null,
      });

      await db
        .update(schema.productVariants)
        .set({
          stockQuantity: sql`${schema.productVariants.stockQuantity} + ${quantityAdded}`,
        })
        .where(eq(schema.productVariants.id, variantId));

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

export async function getStockEntries(limit = 20): Promise<StockEntryData[]> {
  if (isDbConfigured) {
    try {
      const entries = await db
        .select({
          id: schema.stockEntries.id,
          variantId: schema.stockEntries.variantId,
          productName: schema.products.name,
          variantName: schema.productVariants.variantName,
          quantityAdded: schema.stockEntries.quantityAdded,
          supplierOrNotes: schema.stockEntries.supplierOrNotes,
          createdAt: schema.stockEntries.createdAt,
        })
        .from(schema.stockEntries)
        .innerJoin(
          schema.productVariants,
          eq(schema.stockEntries.variantId, schema.productVariants.id)
        )
        .innerJoin(schema.products, eq(schema.productVariants.productId, schema.products.id))
        .orderBy(desc(schema.stockEntries.createdAt))
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
        .from(schema.transactions)
        .orderBy(desc(schema.transactions.createdAt));
      const items = await db.select().from(schema.transactionItems);

      return txs.map((tx) => ({
        id: tx.id,
        invoiceNumber: tx.invoiceNumber,
        customerId: tx.customerId,
        customerNameSnapshot: tx.customerNameSnapshot,
        recipientName: tx.recipientName,
        recipientPhone: tx.recipientPhone,
        citySnapshot: tx.citySnapshot,
        fullAddressSnapshot: tx.fullAddressSnapshot,
        paymentStatus: tx.paymentStatus as "Belum Lunas" | "Lunas",
        shippingStatus: tx.shippingStatus as "Belum Dikirim" | "Sudah Dikirim",
        totalAmount: tx.totalAmount,
        notes: tx.notes,
        createdAt: tx.createdAt.toISOString(),
        items: items
          .filter((it) => it.transactionId === tx.id)
          .map((it) => ({
            id: it.id,
            transactionId: it.transactionId,
            productId: it.productId || 0,
            variantId: it.variantId || 0,
            itemNameSnapshot: it.itemNameSnapshot,
            unitPrice: it.unitPrice,
            quantity: it.quantity,
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

  const store = readLocalStore();

  // Validate stock
  for (const item of input.items) {
    let stockAvailable = 0;
    for (const p of store.products) {
      const v = p.variants.find((va) => va.id === item.variantId);
      if (v) {
        stockAvailable = v.stockQuantity;
        break;
      }
    }
    if (item.quantity > stockAvailable) {
      return {
        success: false,
        error: `Stok untuk "${item.itemName}" tidak mencukupi (sisa ${stockAvailable}, diminta ${item.quantity})`,
      };
    }
  }

  // Deduct stock in store
  for (const item of input.items) {
    for (const p of store.products) {
      const v = p.variants.find((va) => va.id === item.variantId);
      if (v) {
        v.stockQuantity -= item.quantity;
        break;
      }
    }
  }

  const txId = store.nextIds.transaction++;
  const invoiceNumber = `KP-${yearMonth}-${txId.toString().padStart(4, "0")}`;

  const customerName = input.recipientName;

  let totalAmount = 0;
  const transactionItemsData: TransactionItemData[] = input.items.map((it) => {
    const subtotal = it.unitPrice * it.quantity;
    totalAmount += subtotal;
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
    customerNameSnapshot: customerName,
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

  // Sync to Neon if configured
  if (isDbConfigured) {
    try {
      await db.transaction(async (trx) => {
        const [insertedTx] = await trx
          .insert(schema.transactions)
          .values({
            invoiceNumber,
            customerNameSnapshot: customerName,
            recipientName: input.recipientName,
            recipientPhone: input.recipientPhone,
            citySnapshot: input.city,
            fullAddressSnapshot: input.fullAddress || null,
            paymentStatus: input.paymentStatus,
            shippingStatus: input.shippingStatus,
            totalAmount,
            notes: input.notes || null,
          })
          .returning();

        for (const item of input.items) {
          await trx.insert(schema.transactionItems).values({
            transactionId: insertedTx.id,
            productId: item.productId,
            variantId: item.variantId,
            itemNameSnapshot: item.itemName,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            subtotal: item.unitPrice * item.quantity,
          });

          await trx
            .update(schema.productVariants)
            .set({
              stockQuantity: sql`${schema.productVariants.stockQuantity} - ${item.quantity}`,
            })
            .where(eq(schema.productVariants.id, item.variantId));
        }
      });
    } catch (err) {
      console.warn("Neon transaction insert error:", err);
    }
  }

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
      await db
        .update(schema.transactions)
        .set(updates)
        .where(eq(schema.transactions.id, transactionId));
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
          .update(schema.productVariants)
          .set({
            stockQuantity: sql`${schema.productVariants.stockQuantity} + ${item.quantity}`,
          })
          .where(eq(schema.productVariants.id, item.variantId));
      }
      await db.delete(schema.transactions).where(eq(schema.transactions.id, transactionId));
    } catch (e: any) {
      console.warn("Neon delete transaction rollback failed:", e);
    }
  }

  return { success: true };
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
