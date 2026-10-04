export interface InitialProductSeed {
  name: string;
  category: "Seragam" | "Buku" | "Aksesoris" | "Kain";
  hasVariants: boolean;
  unit: string;
  variants: {
    variantName: string;
    price: number;
    stockQuantity: number;
    skuCode?: string;
  }[];
}

export const INITIAL_PRODUCTS: InitialProductSeed[] = [
  {
    name: "Baju Santri (Putra)",
    category: "Seragam",
    hasVariants: true,
    unit: "Stel",
    variants: [
      { variantName: "Ukuran 1", price: 75000, stockQuantity: 20, skuCode: "BSP-01" },
      { variantName: "Ukuran 2", price: 78000, stockQuantity: 20, skuCode: "BSP-02" },
      { variantName: "Ukuran 3", price: 82000, stockQuantity: 20, skuCode: "BSP-03" },
      { variantName: "Ukuran 4", price: 85000, stockQuantity: 20, skuCode: "BSP-04" },
      { variantName: "Ukuran 5", price: 89000, stockQuantity: 20, skuCode: "BSP-05" },
      { variantName: "Ukuran 6", price: 93000, stockQuantity: 20, skuCode: "BSP-06" },
      { variantName: "Ukuran 7", price: 98000, stockQuantity: 20, skuCode: "BSP-07" },
      { variantName: "Ukuran 8", price: 103000, stockQuantity: 20, skuCode: "BSP-08" },
      { variantName: "Ukuran 9", price: 110000, stockQuantity: 20, skuCode: "BSP-09" },
      { variantName: "Ukuran 10", price: 120000, stockQuantity: 20, skuCode: "BSP-10" },
    ],
  },
  {
    name: "Baju Santriwati (Putri)",
    category: "Seragam",
    hasVariants: true,
    unit: "Stel",
    variants: [
      { variantName: "Ukuran 1", price: 80000, stockQuantity: 20, skuCode: "BSW-01" },
      { variantName: "Ukuran 2", price: 83000, stockQuantity: 20, skuCode: "BSW-02" },
      { variantName: "Ukuran 3", price: 87000, stockQuantity: 20, skuCode: "BSW-03" },
      { variantName: "Ukuran 4", price: 90000, stockQuantity: 20, skuCode: "BSW-04" },
      { variantName: "Ukuran 5", price: 95000, stockQuantity: 20, skuCode: "BSW-05" },
      { variantName: "Ukuran 6", price: 99000, stockQuantity: 20, skuCode: "BSW-06" },
      { variantName: "Ukuran 7", price: 105000, stockQuantity: 20, skuCode: "BSW-07" },
      { variantName: "Ukuran 8", price: 110000, stockQuantity: 20, skuCode: "BSW-08" },
      { variantName: "Ukuran 9", price: 118000, stockQuantity: 20, skuCode: "BSW-09" },
      { variantName: "Ukuran 10", price: 125000, stockQuantity: 20, skuCode: "BSW-10" },
    ],
  },
  {
    name: "Buku Santri Soleh",
    category: "Buku",
    hasVariants: true,
    unit: "Pcs",
    variants: [
      { variantName: "Kelas 1 - Semester 1", price: 35000, stockQuantity: 30, skuCode: "BSS-1-1" },
      { variantName: "Kelas 1 - Semester 2", price: 35000, stockQuantity: 30, skuCode: "BSS-1-2" },
      { variantName: "Kelas 2 - Semester 1", price: 35000, stockQuantity: 30, skuCode: "BSS-2-1" },
      { variantName: "Kelas 2 - Semester 2", price: 35000, stockQuantity: 30, skuCode: "BSS-2-2" },
      { variantName: "Kelas 3 - Semester 1", price: 35000, stockQuantity: 30, skuCode: "BSS-3-1" },
      { variantName: "Kelas 3 - Semester 2", price: 35000, stockQuantity: 30, skuCode: "BSS-3-2" },
      { variantName: "Kelas 4 - Semester 1", price: 35000, stockQuantity: 30, skuCode: "BSS-4-1" },
      { variantName: "Kelas 4 - Semester 2", price: 35000, stockQuantity: 30, skuCode: "BSS-4-2" },
    ],
  },
  {
    name: "Peci Santri",
    category: "Aksesoris",
    hasVariants: true,
    unit: "Pcs",
    variants: [
      { variantName: "Ukuran 4", price: 45000, stockQuantity: 15, skuCode: "PCI-04" },
      { variantName: "Ukuran 5", price: 45000, stockQuantity: 15, skuCode: "PCI-05" },
      { variantName: "Ukuran 6", price: 45000, stockQuantity: 15, skuCode: "PCI-06" },
      { variantName: "Ukuran 7", price: 45000, stockQuantity: 15, skuCode: "PCI-07" },
      { variantName: "Ukuran 8", price: 45000, stockQuantity: 15, skuCode: "PCI-08" },
      { variantName: "Ukuran 9", price: 45000, stockQuantity: 15, skuCode: "PCI-09" },
    ],
  },
  {
    name: "Jilbab Santriwati",
    category: "Aksesoris",
    hasVariants: true,
    unit: "Pcs",
    variants: [
      { variantName: "Ukuran S", price: 55000, stockQuantity: 15, skuCode: "JLB-S" },
      { variantName: "Ukuran M", price: 58000, stockQuantity: 15, skuCode: "JLB-M" },
      { variantName: "Ukuran L", price: 62000, stockQuantity: 15, skuCode: "JLB-L" },
      { variantName: "Ukuran XL", price: 65000, stockQuantity: 15, skuCode: "JLB-XL" },
    ],
  },
  {
    name: "Baju Dasar Batik Guru",
    category: "Kain",
    hasVariants: false,
    unit: "Potong",
    variants: [
      { variantName: "Standar (2.5 Meter)", price: 135000, stockQuantity: 50, skuCode: "BTK-GR" },
    ],
  },
];
