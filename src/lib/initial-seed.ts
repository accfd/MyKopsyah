export interface InitialProductSeed {
  name: string;
  category: "Seragam" | "Buku" | "Aksesoris";
  hasVariants: boolean;
  unit: string;
  variants: {
    variantName: string;
    price: number;
    stockQuantity: number;
    skuCode?: string;
  }[];
}

// Data resmi berdasarkan Surat Edaran No. 001/KOP-SYAH/FKDT-SB/VI/2026
// Koperasi Syariah FKDT Provinsi Sumatera Barat
export const INITIAL_PRODUCTS: InitialProductSeed[] = [
  // ── A. Batik Guru ─────────────────────────────────────────────
  {
    name: "Batik Guru MDT (Nasional)",
    category: "Seragam",
    hasVariants: false,
    unit: "Potong",
    variants: [
      { variantName: "Standar", price: 115000, stockQuantity: 39, skuCode: "BTK-GR" },
    ],
  },

  // ── B. Batik Santri MDTA ──────────────────────────────────────
  // Harga ke Koperasi: Size 2-3 = 125.000 | Size 4-6 = 130.000 | Size 7-9 = 140.000 | Size 10+ = 150.000
  {
    name: "Batik Santri MDTA (Putra)",
    category: "Seragam",
    hasVariants: true,
    unit: "Stel",
    variants: [
      { variantName: "Size 2",  price: 125000, stockQuantity: 15,  skuCode: "BSP-02" },
      { variantName: "Size 3",  price: 125000, stockQuantity: 71,  skuCode: "BSP-03" },
      { variantName: "Size 4",  price: 130000, stockQuantity: 80,  skuCode: "BSP-04" },
      { variantName: "Size 5",  price: 130000, stockQuantity: 13,  skuCode: "BSP-05" },
      { variantName: "Size 6",  price: 130000, stockQuantity: 0,   skuCode: "BSP-06" },
      { variantName: "Size 7",  price: 140000, stockQuantity: 0,   skuCode: "BSP-07" },
      { variantName: "Size 8",  price: 140000, stockQuantity: 0,   skuCode: "BSP-08" },
      { variantName: "Size 9",  price: 140000, stockQuantity: 2,   skuCode: "BSP-09" },
      { variantName: "Size 10", price: 150000, stockQuantity: 9,   skuCode: "BSP-10" },
      { variantName: "Size 12", price: 150000, stockQuantity: 1,   skuCode: "BSP-12" },
    ],
  },
  {
    name: "Batik Santriwati MDTA (Putri)",
    category: "Seragam",
    hasVariants: true,
    unit: "Stel",
    variants: [
      { variantName: "Size 2",  price: 125000, stockQuantity: 40,  skuCode: "BSW-02" },
      { variantName: "Size 3",  price: 125000, stockQuantity: 92,  skuCode: "BSW-03" },
      { variantName: "Size 4",  price: 130000, stockQuantity: 18,  skuCode: "BSW-04" },
      { variantName: "Size 5",  price: 130000, stockQuantity: 36,  skuCode: "BSW-05" },
      { variantName: "Size 6",  price: 130000, stockQuantity: 0,   skuCode: "BSW-06" },
      { variantName: "Size 7",  price: 140000, stockQuantity: 0,   skuCode: "BSW-07" },
      { variantName: "Size 8",  price: 140000, stockQuantity: 2,   skuCode: "BSW-08" },
      { variantName: "Size 9",  price: 140000, stockQuantity: 0,   skuCode: "BSW-09" },
      { variantName: "Size 10", price: 150000, stockQuantity: 0,   skuCode: "BSW-10" },
      { variantName: "Size 12", price: 150000, stockQuantity: 0,   skuCode: "BSW-12" },
    ],
  },

  // ── C. Modul Santri Shaleh dan Pintar (8 Buku Fisik) ─────────
  // Harga ke Koperasi: Rp 24.000 / buku
  {
    name: "Modul Santri Shaleh & Pintar (Semester 1)",
    category: "Buku",
    hasVariants: true,
    unit: "Eks",
    variants: [
      { variantName: "Kelas 1", price: 24000, stockQuantity: 0, skuCode: "MOD-S1-K1" },
      { variantName: "Kelas 2", price: 24000, stockQuantity: 0, skuCode: "MOD-S1-K2" },
      { variantName: "Kelas 3", price: 24000, stockQuantity: 0, skuCode: "MOD-S1-K3" },
      { variantName: "Kelas 4", price: 24000, stockQuantity: 0, skuCode: "MOD-S1-K4" },
    ],
  },
  {
    name: "Modul Santri Shaleh & Pintar (Semester 2)",
    category: "Buku",
    hasVariants: true,
    unit: "Eks",
    variants: [
      { variantName: "Kelas 1", price: 24000, stockQuantity: 0, skuCode: "MOD-S2-K1" },
      { variantName: "Kelas 2", price: 24000, stockQuantity: 0, skuCode: "MOD-S2-K2" },
      { variantName: "Kelas 3", price: 24000, stockQuantity: 0, skuCode: "MOD-S2-K3" },
      { variantName: "Kelas 4", price: 24000, stockQuantity: 0, skuCode: "MOD-S2-K4" },
    ],
  },
];
