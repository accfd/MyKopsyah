import { pgTable, text, varchar, integer, boolean, timestamp, serial } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(), // Seragam, Buku, Aksesoris
  hasVariants: boolean("has_variants").default(true).notNull(),
  unit: varchar("unit", { length: 20 }).default("Pcs").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const productVariants = pgTable("product_variants", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id, { onDelete: "cascade" }).notNull(),
  variantName: varchar("variant_name", { length: 100 }).notNull(),
  price: integer("price").notNull(),
  stockQuantity: integer("stock_quantity").default(0).notNull(),
  skuCode: varchar("sku_code", { length: 50 }),
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  customerType: varchar("customer_type", { length: 30 }).default("Instansi").notNull(), // Instansi / Pesantren, Perorangan
  institutionName: varchar("institution_name", { length: 255 }),
  contactPerson: varchar("contact_person", { length: 150 }).notNull(),
  phoneNumber: varchar("phone_number", { length: 50 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  province: varchar("province", { length: 100 }),
  fullAddress: text("full_address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  invoiceNumber: varchar("invoice_number", { length: 50 }).unique().notNull(),
  customerId: integer("customer_id").references(() => customers.id),
  customerNameSnapshot: varchar("customer_name_snapshot", { length: 255 }).notNull(),
  recipientName: varchar("recipient_name", { length: 150 }).notNull(),
  recipientPhone: varchar("recipient_phone", { length: 50 }).notNull(),
  citySnapshot: varchar("city_snapshot", { length: 100 }).notNull(),
  fullAddressSnapshot: text("full_address_snapshot"),
  paymentStatus: varchar("payment_status", { length: 30 }).default("Belum Lunas").notNull(), // Belum Lunas, Lunas
  shippingStatus: varchar("shipping_status", { length: 30 }).default("Belum Dikirim").notNull(), // Belum Dikirim, Sudah Dikirim
  totalAmount: integer("total_amount").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const transactionItems = pgTable("transaction_items", {
  id: serial("id").primaryKey(),
  transactionId: integer("transaction_id").references(() => transactions.id, { onDelete: "cascade" }).notNull(),
  productId: integer("product_id").references(() => products.id),
  variantId: integer("variant_id").references(() => productVariants.id),
  itemNameSnapshot: varchar("item_name_snapshot", { length: 255 }).notNull(),
  unitPrice: integer("unit_price").notNull(),
  quantity: integer("quantity").notNull(),
  subtotal: integer("subtotal").notNull(),
});

export const stockEntries = pgTable("stock_entries", {
  id: serial("id").primaryKey(),
  variantId: integer("variant_id").references(() => productVariants.id, { onDelete: "cascade" }).notNull(),
  quantityAdded: integer("quantity_added").notNull(),
  supplierOrNotes: text("supplier_or_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const productsRelations = relations(products, ({ many }) => ({
  variants: many(productVariants),
}));

export const productVariantsRelations = relations(productVariants, ({ one, many }) => ({
  product: one(products, {
    fields: [productVariants.productId],
    references: [products.id],
  }),
  stockEntries: many(stockEntries),
  transactionItems: many(transactionItems),
}));

export const transactionsRelations = relations(transactions, ({ one, many }) => ({
  customer: one(customers, {
    fields: [transactions.customerId],
    references: [customers.id],
  }),
  items: many(transactionItems),
}));

export const transactionItemsRelations = relations(transactionItems, ({ one }) => ({
  transaction: one(transactions, {
    fields: [transactionItems.transactionId],
    references: [transactions.id],
  }),
  product: one(products, {
    fields: [transactionItems.productId],
    references: [products.id],
  }),
  variant: one(productVariants, {
    fields: [transactionItems.variantId],
    references: [productVariants.id],
  }),
}));

export const stockEntriesRelations = relations(stockEntries, ({ one }) => ({
  variant: one(productVariants, {
    fields: [stockEntries.variantId],
    references: [productVariants.id],
  }),
}));
