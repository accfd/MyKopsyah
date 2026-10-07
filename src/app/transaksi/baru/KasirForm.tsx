"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProductData } from "@/lib/data-service";
import { formatRupiah } from "@/lib/format";
import { submitTransactionAction } from "@/app/actions";
import {
  User,
  Phone,
  FileText,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle,
  Clock,
  Truck,
  PackageCheck,
  Search,
  ChevronDown,
  X,
  MapPin,
  MessageCircle,
  Keyboard,
} from "lucide-react";
import CityCombobox from "@/components/CityCombobox";

interface CartItem {
  productId: number;
  variantId: number;
  productName: string;
  variantName: string;
  unitPrice: number;
  quantity: number;
  maxStock: number;
  unit: string;
}

export interface PastCustomer {
  name: string;
  phone: string;
  city: string;
  address?: string | null;
}

interface SuccessTransactionState {
  transactionId: number;
  invoiceNumber: string;
  recipientName: string;
  recipientPhone: string;
  city: string;
  fullAddress?: string;
  totalAmount: number;
  paymentStatus: "Belum Lunas" | "Lunas";
  shippingStatus: "Belum Dikirim" | "Sudah Dikirim";
  notes?: string;
  items: Array<{
    name: string;
    price: number;
    qty: number;
    subtotal: number;
  }>;
}

export default function KasirForm({
  products,
  pastCustomers = [],
}: {
  products: ProductData[];
  pastCustomers?: PastCustomer[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Success Dialog State
  const [successData, setSuccessData] = useState<SuccessTransactionState | null>(null);

  // Customer state
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [city, setCity] = useState("");
  const [fullAddress, setFullAddress] = useState("");

  // Customer autocomplete state
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const customerDropdownRef = useRef<HTMLDivElement>(null);

  // Filtered past customers
  const filteredCustomers = recipientName.trim()
    ? pastCustomers.filter((c) =>
        c.name.toLowerCase().includes(recipientName.toLowerCase()) ||
        c.city.toLowerCase().includes(recipientName.toLowerCase()) ||
        c.phone.includes(recipientName)
      )
    : [];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        customerDropdownRef.current &&
        !customerDropdownRef.current.contains(e.target as Node)
      ) {
        setIsCustomerDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectPastCustomer = (c: PastCustomer) => {
    setRecipientName(c.name);
    if (c.phone) setRecipientPhone(c.phone);
    if (c.city) setCity(c.city);
    if (c.address) setFullAddress(c.address);
    setIsCustomerDropdownOpen(false);
  };

  // Transaction settings
  const [paymentStatus, setPaymentStatus] = useState<"Belum Lunas" | "Lunas">("Belum Lunas");
  const [shippingStatus, setShippingStatus] = useState<"Belum Dikirim" | "Sudah Dikirim">(
    "Belum Dikirim"
  );
  const [notes, setNotes] = useState("");

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);

  // Product Search & Selection state
  const [productSearch, setProductSearch] = useState("");
  const [isProductMenuOpen, setIsProductMenuOpen] = useState(false);
  const productMenuRef = useRef<HTMLDivElement>(null);

  const [selectedProductId, setSelectedProductId] = useState<number>(products[0]?.id || 0);
  const currentProduct = products.find((p) => p.id === selectedProductId) || products[0];

  const [selectedVariantId, setSelectedVariantId] = useState<number>(
    currentProduct?.variants[0]?.id || 0
  );
  const currentVariant =
    currentProduct?.variants.find((v) => v.id === selectedVariantId) || currentProduct?.variants[0];

  const [quantityInput, setQuantityInput] = useState<number>(1);

  // Filter products by keyword
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutsideProduct(e: MouseEvent) {
      if (
        productMenuRef.current &&
        !productMenuRef.current.contains(e.target as Node)
      ) {
        setIsProductMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutsideProduct);
    return () => document.removeEventListener("mousedown", handleClickOutsideProduct);
  }, []);

  // Input refs for keyboard navigation
  const nameInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const addressInputRef = useRef<HTMLInputElement>(null);
  const productSearchInputRef = useRef<HTMLInputElement>(null);
  const variantSelectRef = useRef<HTMLSelectElement>(null);
  const quantityInputRef = useRef<HTMLInputElement>(null);

  // Keyboard navigation highlights
  const [highlightedCustomerIndex, setHighlightedCustomerIndex] = useState(-1);
  const [highlightedProductIndex, setHighlightedProductIndex] = useState(-1);

  useEffect(() => {
    setHighlightedCustomerIndex(-1);
  }, [recipientName]);

  useEffect(() => {
    setHighlightedProductIndex(-1);
  }, [productSearch]);

  const handleSelectProduct = (prod: ProductData) => {
    setSelectedProductId(prod.id);
    if (prod.variants.length > 0) {
      setSelectedVariantId(prod.variants[0].id);
    }
    setProductSearch("");
    setIsProductMenuOpen(false);
    setHighlightedProductIndex(-1);
  };

  // Keyboard handler for recipient name input
  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" || e.key === "PageDown") {
      e.preventDefault();
      if (!isCustomerDropdownOpen) {
        setIsCustomerDropdownOpen(true);
      }
      if (filteredCustomers.length > 0) {
        setHighlightedCustomerIndex((prev) => (prev + 1) % Math.min(filteredCustomers.length, 8));
      }
    } else if (e.key === "ArrowUp" || e.key === "PageUp") {
      e.preventDefault();
      if (filteredCustomers.length > 0) {
        setHighlightedCustomerIndex((prev) => (prev - 1 + Math.min(filteredCustomers.length, 8)) % Math.min(filteredCustomers.length, 8));
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (
        isCustomerDropdownOpen &&
        highlightedCustomerIndex >= 0 &&
        filteredCustomers[highlightedCustomerIndex]
      ) {
        handleSelectPastCustomer(filteredCustomers[highlightedCustomerIndex]);
        setTimeout(() => productSearchInputRef.current?.focus(), 60);
      } else {
        setIsCustomerDropdownOpen(false);
        phoneInputRef.current?.focus();
      }
    } else if (e.key === "Escape") {
      setIsCustomerDropdownOpen(false);
      setHighlightedCustomerIndex(-1);
    }
  };

  // Keyboard handler for recipient phone input
  const handlePhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addressInputRef.current?.focus();
    }
  };

  // Keyboard handler for address input
  const handleAddressKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      productSearchInputRef.current?.focus();
    }
  };

  // Keyboard handler for product search input
  const handleProductSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" || e.key === "PageDown") {
      e.preventDefault();
      if (!isProductMenuOpen) {
        setIsProductMenuOpen(true);
      }
      if (filteredProducts.length > 0) {
        setHighlightedProductIndex((prev) => (prev + 1) % filteredProducts.length);
      }
    } else if (e.key === "ArrowUp" || e.key === "PageUp") {
      e.preventDefault();
      if (filteredProducts.length > 0) {
        setHighlightedProductIndex((prev) => (prev - 1 + filteredProducts.length) % filteredProducts.length);
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (
        isProductMenuOpen &&
        highlightedProductIndex >= 0 &&
        filteredProducts[highlightedProductIndex]
      ) {
        const chosen = filteredProducts[highlightedProductIndex];
        handleSelectProduct(chosen);
        if (chosen.variants.length > 1) {
          setTimeout(() => variantSelectRef.current?.focus(), 60);
        } else {
          setTimeout(() => {
            quantityInputRef.current?.focus();
            quantityInputRef.current?.select();
          }, 60);
        }
      } else if (currentProduct) {
        setIsProductMenuOpen(false);
        if (currentProduct.variants.length > 1) {
          variantSelectRef.current?.focus();
        } else {
          quantityInputRef.current?.focus();
          quantityInputRef.current?.select();
        }
      }
    } else if (e.key === "Escape") {
      setIsProductMenuOpen(false);
      setHighlightedProductIndex(-1);
    }
  };

  // Keyboard handler for variant select
  const handleVariantKeyDown = (e: React.KeyboardEvent<HTMLSelectElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      quantityInputRef.current?.focus();
      quantityInputRef.current?.select();
    }
  };

  // Keyboard handler for quantity input
  const handleQuantityKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddToCart();
      setTimeout(() => {
        productSearchInputRef.current?.focus();
        productSearchInputRef.current?.select();
      }, 60);
    }
  };

  // Add item to cart
  const handleAddToCart = () => {
    if (!currentProduct || !currentVariant) return;

    if (quantityInput <= 0) {
      alert("Jumlah pesanan harus minimal 1 pcs");
      return;
    }

    if (quantityInput > currentVariant.stockQuantity) {
      alert(
        `Stok tidak mencukupi! Sisa stok untuk ${currentProduct.name} - ${currentVariant.variantName} adalah ${currentVariant.stockQuantity} ${currentProduct.unit}.`
      );
      return;
    }

    // Check if already in cart
    const existingIndex = cart.findIndex((item) => item.variantId === currentVariant.id);
    if (existingIndex > -1) {
      const existing = cart[existingIndex];
      const newQty = existing.quantity + quantityInput;
      if (newQty > currentVariant.stockQuantity) {
        alert(
          `Total pesanan (${newQty}) melebihi sisa stok di gudang (${currentVariant.stockQuantity}).`
        );
        return;
      }
      const updatedCart = [...cart];
      updatedCart[existingIndex].quantity = newQty;
      setCart(updatedCart);
    } else {
      setCart([
        ...cart,
        {
          productId: currentProduct.id,
          variantId: currentVariant.id,
          productName: currentProduct.name,
          variantName: currentVariant.variantName,
          unitPrice: currentVariant.price,
          quantity: quantityInput,
          maxStock: currentVariant.stockQuantity,
          unit: currentProduct.unit,
        },
      ]);
    }

    // Reset qty input
    setQuantityInput(1);
  };

  const handleRemoveFromCart = (index: number) => {
    const updated = [...cart];
    updated.splice(index, 1);
    setCart(updated);
  };

  const handleUpdateQuantity = (index: number, newQty: number) => {
    if (newQty <= 0) return;
    const item = cart[index];
    if (newQty > item.maxStock) {
      alert(`Stok maksimal yang tersedia adalah ${item.maxStock}`);
      return;
    }
    const updated = [...cart];
    updated[index].quantity = newQty;
    setCart(updated);
  };

  const grandTotal = cart.reduce((acc, curr) => acc + curr.unitPrice * curr.quantity, 0);

  // Submit transaction
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!recipientName.trim()) {
      setErrorMessage("Silakan isi nama penerima pesanan.");
      return;
    }

    if (!recipientPhone.trim()) {
      setErrorMessage("Silakan isi nomor WhatsApp penerima.");
      return;
    }

    if (!city.trim()) {
      setErrorMessage("Silakan isi Kota / Kabupaten tujuan pengiriman.");
      return;
    }

    if (cart.length === 0) {
      setErrorMessage("Keranjang pesanan masih kosong! Tambahkan minimal 1 barang.");
      return;
    }

    const currentCartCopy = [...cart];
    const recName = recipientName.trim();
    const recPhone = recipientPhone.trim();
    const recCity = city.trim();
    const recAddress = fullAddress.trim();
    const curPayStatus = paymentStatus;
    const curShipStatus = shippingStatus;
    const curNotes = notes.trim();
    const curTotal = grandTotal;

    startTransition(async () => {
      const res = await submitTransactionAction({
        recipientName: recName,
        recipientPhone: recPhone,
        city: recCity,
        fullAddress: recAddress || undefined,
        paymentStatus: curPayStatus,
        shippingStatus: curShipStatus,
        notes: curNotes || undefined,
        items: currentCartCopy.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          itemName: `${item.productName} - ${item.variantName}`,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
        })),
      });

      if (!res.success) {
        setErrorMessage(res.error || "Gagal menyimpan transaksi");
      } else {
        // Tampilkan modal sukses dengan opsi kirim WhatsApp
        setSuccessData({
          transactionId: res.transactionId!,
          invoiceNumber: res.invoiceNumber || "",
          recipientName: recName,
          recipientPhone: recPhone,
          city: recCity,
          fullAddress: recAddress,
          totalAmount: curTotal,
          paymentStatus: curPayStatus,
          shippingStatus: curShipStatus,
          notes: curNotes,
          items: currentCartCopy.map((it) => ({
            name: `${it.productName} - ${it.variantName}`,
            price: it.unitPrice,
            qty: it.quantity,
            subtotal: it.unitPrice * it.quantity,
          })),
        });
      }
    });
  };

  // WhatsApp formatted string generator
  const getWhatsAppShareLink = () => {
    if (!successData) return "#";
    const dateFormatted = new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date());

    const itemsText = successData.items
      .map(
        (it, idx) =>
          `${idx + 1}. ${it.name}\n   ${it.qty} x ${formatRupiah(it.price)} = ${formatRupiah(it.subtotal)}`
      )
      .join("\n");

    const statusBayar = successData.paymentStatus === "Lunas" ? "✅ LUNAS" : "⏳ BELUM LUNAS";
    const statusKirim =
      successData.shippingStatus === "Sudah Dikirim" ? "📦 SUDAH DIKIRIM" : "🚚 BELUM DIKIRIM";

    const text = `*KOPERASI SYARIAH (MYKOPSYAH)*
*RINCIAN NOTA PESANAN*
---------------------------------------
*No. Nota:* ${successData.invoiceNumber}
*Tanggal:* ${dateFormatted}

*Pemesan / Penerima:* ${successData.recipientName} (${successData.recipientPhone})
*Tujuan:* ${successData.city}
${successData.fullAddress ? `*Alamat:* ${successData.fullAddress}\n` : ""}---------------------------------------
*Rincian Barang:*
${itemsText}
---------------------------------------
*TOTAL BELANJA:* ${formatRupiah(successData.totalAmount)}

*Status Pembayaran:* ${statusBayar}
*Status Pengiriman:* ${statusKirim}
${successData.notes ? `\n*Catatan:* ${successData.notes}` : ""}
---------------------------------------
_Jazakumullahu khairan atas kepercayaannya berbelanja di Kopsyah._ 🙏`;

    let cleanPhone = successData.recipientPhone.replace(/\D/g, "");
    if (cleanPhone.startsWith("0")) {
      cleanPhone = "62" + cleanPhone.slice(1);
    }

    return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`;
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        onKeyDown={(e) => {
          if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
            e.preventDefault();
            if (!isPending && cart.length > 0) {
              handleSubmit(e as any);
            }
          }
        }}
        className="space-y-6 sm:space-y-8 pb-36"
      >
        {/* Banner Navigasi Keyboard Cepat POS */}
        <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-2xl p-3 sm:px-4 sm:py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-emerald-900">
          <div className="flex items-center gap-2 font-bold">
            <Keyboard className="w-4 h-4 text-emerald-700" />
            <span>Mode Input Cepat (Keyboard Friendly):</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-emerald-800">
            <span><kbd className="px-1.5 py-0.5 bg-white border border-emerald-300 rounded font-mono font-bold shadow-2xs">↑ / ↓</kbd> Sorot Data</span>
            <span><kbd className="px-1.5 py-0.5 bg-white border border-emerald-300 rounded font-mono font-bold shadow-2xs">Enter</kbd> Pilih & Pindah Field</span>
            <span><kbd className="px-1.5 py-0.5 bg-white border border-emerald-300 rounded font-mono font-bold shadow-2xs">Ctrl + Enter</kbd> Simpan Transaksi</span>
          </div>
        </div>

        {errorMessage && (
          <div className="p-4 bg-rose-50 border-l-4 border-rose-600 rounded-r-xl text-rose-800 text-sm font-semibold flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Bagian 1: Data Pelanggan */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-5">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-700" />
            <span>1. Informasi Penerima & Tujuan Kirim</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nama Penerima with Autocomplete */}
            <div className="relative" ref={customerDropdownRef}>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5 flex items-center justify-between">
                <span>
                  Nama Penerima <span className="text-rose-500">*</span>
                </span>
                <span className="text-[10px] text-slate-400 font-normal hidden sm:inline">
                  [↑/↓ Sorot, Enter Pilih]
                </span>
              </label>
              <div className="relative">
                <input
                  ref={nameInputRef}
                  type="text"
                  value={recipientName}
                  onKeyDown={handleNameKeyDown}
                  onFocus={() => {
                    if (pastCustomers.length > 0) setIsCustomerDropdownOpen(true);
                  }}
                  onChange={(e) => {
                    setRecipientName(e.target.value);
                    setIsCustomerDropdownOpen(true);
                  }}
                  placeholder="Ketik nama atau pilih pemesan tersimpan..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-slate-900 font-medium"
                  required
                />
                {recipientName && (
                  <button
                    type="button"
                    onClick={() => {
                      setRecipientName("");
                      setIsCustomerDropdownOpen(false);
                      setHighlightedCustomerIndex(-1);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Suggestions Dropdown */}
              {isCustomerDropdownOpen && filteredCustomers.length > 0 && (
                <div className="absolute z-30 left-0 right-0 mt-1.5 max-h-56 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl divide-y divide-slate-100">
                  <div className="p-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 flex items-center justify-between">
                    <span>Data Pemesan Tersimpan</span>
                    <span className="text-[10px] font-normal text-slate-500">Tekan Enter utk pilih</span>
                  </div>
                  {filteredCustomers.slice(0, 8).map((c, idx) => {
                    const isHighlighted = highlightedCustomerIndex === idx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectPastCustomer(c)}
                        className={`w-full text-left p-3 transition-colors flex items-center justify-between group ${
                          isHighlighted
                            ? "bg-emerald-100 text-emerald-950 font-bold border-l-4 border-emerald-600"
                            : "hover:bg-emerald-50"
                        }`}
                      >
                        <div>
                          <div className={`font-semibold ${isHighlighted ? "text-emerald-950" : "text-slate-900 group-hover:text-emerald-800"}`}>
                            {c.name}
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {c.city}
                            </span>
                            {c.phone && <span>• {c.phone}</span>}
                          </div>
                        </div>
                        <span className={`text-xs font-semibold text-emerald-700 ${isHighlighted ? "opacity-100" : "opacity-0 group-hover:opacity-100"} transition-opacity`}>
                          Pilih
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
              <p className="text-xs text-slate-500 mt-1">
                Ketik nama pengurus/ponpes. Gunakan panah atau Enter untuk memilih otomatis.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                Nomor WhatsApp Penerima <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  ref={phoneInputRef}
                  type="tel"
                  value={recipientPhone}
                  onKeyDown={handlePhoneKeyDown}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="w-full px-4 py-3 pl-11 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-slate-900 font-medium"
                  required
                />
                <Phone className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="sm:col-span-2">
              <CityCombobox value={city} onChange={setCity} required />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                Alamat Lengkap Pengiriman
              </label>
              <input
                ref={addressInputRef}
                type="text"
                value={fullAddress}
                onKeyDown={handleAddressKeyDown}
                onChange={(e) => setFullAddress(e.target.value)}
                placeholder="Jalan, RT/RW, Dusun, Kecamatan (Tekan Enter menuju Barang)"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-slate-900 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Bagian 2: Keranjang Belanja */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-4">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-700" />
            <span>2. Pilih Barang & Varian Ukuran</span>
          </h3>

          {/* Input Pemilih Barang */}
          <div className="bg-slate-50 p-3.5 sm:p-4 rounded-xl border border-slate-200 space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
              {/* Searchable Produk Combobox */}
              <div className="lg:col-span-5 relative" ref={productMenuRef}>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center justify-between">
                  <span>Pilih Produk</span>
                  <span className="text-[10px] text-slate-400 font-normal hidden sm:inline">
                    [↑/↓ Sorot, Enter Pilih]
                  </span>
                </label>
                <div className="relative">
                  <input
                    ref={productSearchInputRef}
                    type="text"
                    value={isProductMenuOpen ? productSearch : (currentProduct ? currentProduct.name : "")}
                    onKeyDown={handleProductSearchKeyDown}
                    onFocus={() => {
                      setIsProductMenuOpen(true);
                      setProductSearch("");
                    }}
                    onChange={(e) => {
                      setProductSearch(e.target.value);
                      setIsProductMenuOpen(true);
                    }}
                    placeholder="Ketik nama produk (cth: batik, modul)..."
                    className="w-full px-3.5 py-3 pl-10 pr-10 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-600"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setIsProductMenuOpen((v) => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                  >
                    <ChevronDown className={`w-4 h-4 transition-transform ${isProductMenuOpen ? "rotate-180" : ""}`} />
                  </button>
                </div>

                {/* Product Search Results Dropdown */}
                {isProductMenuOpen && (
                  <div className="absolute z-20 left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl divide-y divide-slate-100">
                    {filteredProducts.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-500">
                        Tidak ada produk dengan kata kunci "{productSearch}"
                      </div>
                    ) : (
                      filteredProducts.map((p, idx) => {
                        const isSelected = p.id === selectedProductId;
                        const isHighlighted = highlightedProductIndex === idx;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => handleSelectProduct(p)}
                            className={`w-full text-left p-3 transition-colors flex items-center justify-between ${
                              isHighlighted
                                ? "bg-emerald-100 text-emerald-950 font-bold border-l-4 border-emerald-600"
                                : isSelected
                                ? "bg-emerald-50/70 font-bold hover:bg-emerald-50"
                                : "hover:bg-emerald-50"
                            }`}
                          >
                            <div>
                              <div className="text-sm font-semibold text-slate-900">{p.name}</div>
                              <div className="text-xs text-slate-500 mt-0.5">{p.category} • {p.variants.length} Varian</div>
                            </div>
                            {(isSelected || isHighlighted) && <CheckCircle2 className="w-4 h-4 text-emerald-700" />}
                          </button>
                        );
                      })
                    )}
                  </div>
                )}
              </div>

              {/* Varian / Ukuran / Kelas (Clean text only, no embedded price) */}
              <div className="lg:col-span-4">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Varian / Ukuran / Kelas
                </label>
                <select
                  ref={variantSelectRef}
                  value={selectedVariantId}
                  onKeyDown={handleVariantKeyDown}
                  onChange={(e) => setSelectedVariantId(Number(e.target.value))}
                  disabled={!currentProduct || currentProduct.variants.length === 0}
                  className="w-full px-3.5 py-3 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-600 disabled:bg-slate-100 disabled:opacity-60"
                >
                  {currentProduct?.variants.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.variantName}
                    </option>
                  ))}
                </select>

                {/* Clean Badge for Price & Remaining Stock */}
                {currentVariant && (
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      {formatRupiah(currentVariant.price)}
                    </span>
                    <span
                      className={`font-semibold px-2 py-0.5 rounded-md border ${
                        currentVariant.stockQuantity > 0
                          ? "text-slate-700 bg-slate-100 border-slate-200"
                          : "text-rose-700 bg-rose-50 border-rose-200"
                      }`}
                    >
                      Stok: {currentVariant.stockQuantity} {currentProduct?.unit}
                    </span>
                  </div>
                )}
              </div>

              {/* Jumlah & Tombol Tambah */}
              <div className="lg:col-span-3 flex items-end gap-2">
                <div className="w-24">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center justify-between">
                    <span>Jumlah</span>
                    <span className="text-[10px] text-slate-400 font-normal">[Enter]</span>
                  </label>
                  <input
                    ref={quantityInputRef}
                    type="number"
                    min={1}
                    max={currentVariant?.stockQuantity || 1}
                    value={quantityInput}
                    onKeyDown={handleQuantityKeyDown}
                    onChange={(e) => setQuantityInput(Number(e.target.value))}
                    className="w-full px-3 py-3 bg-white border border-slate-300 rounded-xl text-center font-bold text-slate-900 focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!currentVariant || currentVariant.stockQuantity <= 0}
                  className="flex-1 py-3 px-4 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 cursor-pointer"
                  title="Tekan Enter pada Jumlah atau klik tombol ini untuk memasukkan ke keranjang"
                >
                  <Plus className="w-5 h-5" />
                  <span>Masukkan</span>
                </button>
              </div>
            </div>
          </div>

          {/* Tabel Keranjang */}
          {cart.length === 0 ? (
            <div className="p-6 sm:p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-500 text-sm">
              Keranjang belanja masih kosong. Pilih barang di atas dan klik tombol{" "}
              <strong>"Masukkan"</strong>.
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Nama Barang</th>
                    <th className="py-3 px-4 text-center">Harga Satuan</th>
                    <th className="py-3 px-4 text-center w-32">Jumlah</th>
                    <th className="py-3 px-4 text-right">Subtotal</th>
                    <th className="py-3 px-3 text-center w-12">Hapus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cart.map((item, index) => (
                    <tr key={index} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        <div>{item.productName}</div>
                        <span className="text-xs text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                          {item.variantName}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center text-slate-700">
                        {formatRupiah(item.unitPrice)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(index, item.quantity - 1)}
                            className="w-7 h-7 bg-slate-200 hover:bg-slate-300 rounded-lg font-bold text-slate-700"
                          >
                            -
                          </button>
                          <span className="w-8 font-bold text-center">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(index, item.quantity + 1)}
                            className="w-7 h-7 bg-slate-200 hover:bg-slate-300 rounded-lg font-bold text-slate-700"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-slate-900">
                        {formatRupiah(item.unitPrice * item.quantity)}
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveFromCart(index)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Bagian 3: Status Bayar, Kirim & Catatan */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-4">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-700" />
            <span>3. Status Pembayaran & Pengiriman</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Status Bayar (Icons instead of emojis) */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                Status Pembayaran
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentStatus("Belum Lunas")}
                  className={`py-3 px-4 rounded-xl border text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                    paymentStatus === "Belum Lunas"
                      ? "bg-amber-500 text-white border-amber-600 shadow-sm"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span>Belum Lunas</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentStatus("Lunas")}
                  className={`py-3 px-4 rounded-xl border text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                    paymentStatus === "Lunas"
                      ? "bg-emerald-600 text-white border-emerald-700 shadow-sm"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Lunas</span>
                </button>
              </div>
            </div>

            {/* Status Kirim (Icons instead of emojis) */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                Status Pengiriman
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setShippingStatus("Belum Dikirim")}
                  className={`py-3 px-4 rounded-xl border text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                    shippingStatus === "Belum Dikirim"
                      ? "bg-slate-700 text-white border-slate-800 shadow-sm"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <Truck className="w-4 h-4" />
                  <span>Belum Dikirim</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShippingStatus("Sudah Dikirim")}
                  className={`py-3 px-4 rounded-xl border text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                    shippingStatus === "Sudah Dikirim"
                      ? "bg-sky-600 text-white border-sky-700 shadow-sm"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <PackageCheck className="w-4 h-4" />
                  <span>Sudah Dikirim</span>
                </button>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-slate-800 mb-1">
                Catatan Pesanan (Opsional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Titip ke Ustadz Ahmad, kirim pakai ekspedisi J&T"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-slate-900 font-medium"
              />
            </div>
          </div>
        </div>

        {/* ── Sticky Bottom Bar Checkout ── */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t-2 border-emerald-600 shadow-2xl p-3 sm:px-6 sm:py-3.5 no-print">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* Bagian Kiri: Total Tagihan Nota & Macam Barang */}
            <div className="flex items-center justify-between sm:justify-start gap-4">
              <div>
                <p className="text-[10px] sm:text-xs uppercase font-bold text-slate-500 leading-tight">
                  Total Tagihan Nota
                </p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-black text-emerald-800 tracking-tight leading-tight">
                  {formatRupiah(grandTotal)}
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                {cart.length} macam barang
              </span>
            </div>

            {/* Bagian Kanan: Tombol SIMPAN TRANSAKSI */}
            <button
              type="submit"
              disabled={isPending || cart.length === 0}
              className="w-full sm:w-auto px-7 py-3 sm:py-3.5 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] text-white text-sm sm:text-base font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shrink-0"
            >
              {isPending ? (
                <span>Menyimpan Nota...</span>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>SIMPAN TRANSAKSI</span>
                  <span className="hidden sm:inline-block text-[11px] font-mono font-medium bg-emerald-800/80 px-2 py-0.5 rounded-md text-emerald-100">
                    Ctrl+Enter
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* ── Modal Pop-up Sukses Transaksi & Opsi Kirim WhatsApp ── */}
      {successData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 no-print">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-5 animate-in zoom-in-95 duration-200">
            {/* Icon & Title */}
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-slate-900">Transaksi Berhasil Disimpan!</h3>
              <p className="text-xs text-slate-500">
                Nota penjualan telah tercatat di database dan stok gudang otomatis terpotong.
              </p>
            </div>

            {/* Rincian Singkat Nota */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-sm">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200/80">
                <span className="text-xs font-semibold text-slate-500 uppercase">No. Nota</span>
                <span className="font-bold text-slate-900 font-mono text-base">{successData.invoiceNumber}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Penerima:</span>
                <span className="font-semibold text-slate-900">{successData.recipientName} ({successData.city})</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Total Tagihan:</span>
                <span className="font-extrabold text-emerald-800 text-sm">{formatRupiah(successData.totalAmount)}</span>
              </div>
              <div className="flex justify-between items-center text-xs pt-1">
                <span className="text-slate-500">Status Bayar:</span>
                <span
                  className={`px-2 py-0.5 rounded font-bold ${
                    successData.paymentStatus === "Lunas"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {successData.paymentStatus}
                </span>
              </div>
            </div>

            {/* Tombol Aksi: Kirim WA & Detail */}
            <div className="space-y-2.5 pt-1">
              <a
                href={getWhatsAppShareLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Kirim Rincian Nota ke WhatsApp</span>
              </a>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => router.push(`/transaksi/${successData.transactionId}`)}
                  className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5"
                >
                  <FileText className="w-4 h-4 text-slate-600" />
                  <span>Detail & Cetak</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSuccessData(null);
                    setCart([]);
                    setRecipientName("");
                    setRecipientPhone("");
                    setCity("");
                    setFullAddress("");
                    setNotes("");
                  }}
                  className="py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold rounded-xl text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4 text-emerald-700" />
                  <span>Transaksi Baru</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
