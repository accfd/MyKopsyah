"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingCart, Package, ReceiptText, MapPin } from "lucide-react";

export default function AdminBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: "Dasbor", href: "/dashboard", icon: LayoutDashboard },
    { label: "Stok Barang", href: "/produk", icon: Package },
    { label: "Kasir (+)", href: "/transaksi/baru", icon: ShoppingCart, highlight: true },
    { label: "Nota Penjualan", href: "/transaksi", icon: ReceiptText },
    { label: "Wilayah", href: "/laporan/wilayah", icon: MapPin },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-lg px-2 py-1.5 no-print">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;

          if (item.highlight) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center -mt-6 group focus:outline-none"
              >
                <div className="w-14 h-14 rounded-full bg-emerald-600 group-hover:bg-emerald-700 text-white flex items-center justify-center shadow-lg ring-4 ring-white transition-all transform active:scale-95">
                  <Icon className="w-7 h-7" />
                </div>
                <span className="text-[11px] font-bold text-emerald-800 mt-1">Kasir (+)</span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-1 px-2.5 rounded-lg transition-colors ${
                isActive ? "text-emerald-700 font-bold" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-emerald-700" : "text-slate-400"}`} />
              <span className="text-[11px] mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
