"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  ReceiptText,
  MapPin,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();

  const links = [
    { label: "Dasbor Utama", href: "/dashboard", icon: LayoutDashboard },
    { label: "Kasir (Transaksi Baru)", href: "/transaksi/baru", icon: ShoppingCart, highlight: true },
    { label: "Daftar Nota Penjualan", href: "/transaksi", icon: ReceiptText },
    { label: "Katalog & Stok Masuk", href: "/produk", icon: Package },
    { label: "Rekap Penjualan Wilayah", href: "/laporan/wilayah", icon: MapPin },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] p-4 no-print">
      <div className="space-y-1.5 flex-1">
        {links.map((link) => {
          const isActive =
            pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href));
          const Icon = link.icon;

          if (link.highlight) {
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm transition-all transform active:scale-98 my-2"
              >
                <Icon className="w-5 h-5 text-emerald-100" />
                <span>{link.label}</span>
              </Link>
            );
          }

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? "bg-emerald-50 text-emerald-800 font-bold border-l-4 border-emerald-600"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-emerald-700" : "text-slate-400"}`} />
              <span>{link.label}</span>
            </Link>
          );
        })}

        <div className="pt-4 mt-4 border-t border-slate-200">
          <Link
            href="/stok"
            target="_blank"
            className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium text-emerald-700 hover:bg-emerald-50 transition-colors border border-emerald-200"
          >
            <div className="flex items-center gap-2.5">
              <ExternalLink className="w-4 h-4 text-emerald-600" />
              <span>Buka Cek Stok Publik</span>
            </div>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold uppercase">
              Web
            </span>
          </Link>
        </div>
      </div>

      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>Sesi Admin Kopsyah Terlindungi</span>
      </div>
    </aside>
  );
}
