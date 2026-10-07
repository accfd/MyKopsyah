"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  ReceiptText,
  History,
  MapPin,
  Settings,
  X,
  ChevronRight,
} from "lucide-react";

interface AdminMobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminMobileDrawer({ isOpen, onClose }: AdminMobileDrawerProps) {
  const pathname = usePathname();

  // Otomatis tutup drawer jika rute halaman berpindah
  useEffect(() => {
    onClose();
  }, [pathname]);

  // Kunci scroll halaman utama saat drawer terbuka agar mulus & tidak bergeser
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const links = [
    { label: "Dasbor Utama", href: "/dashboard", icon: LayoutDashboard },
    { label: "Kasir Penjualan", href: "/transaksi/baru", icon: ShoppingCart, highlight: true },
    { label: "Daftar Transaksi", href: "/transaksi", icon: ReceiptText },
    { label: "Katalog Produk", href: "/produk", icon: Package },
    { label: "Riwayat Stok Masuk", href: "/riwayat-stok", icon: History },
    { label: "Rekap Wilayah", href: "/laporan/wilayah", icon: MapPin },
  ];

  const isSettingsActive = pathname.startsWith("/pengaturan");

  return (
    <div
      className={`fixed inset-0 z-50 md:hidden no-print transition-all duration-300 ${
        isOpen ? "pointer-events-auto visible" : "pointer-events-none invisible"
      }`}
    >
      {/* Backdrop redup dengan animasi opacity halus */}
      <div
        className={`fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300 ease-in-out ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Panel Laci dengan kurva pergerakan (easing) khas mobile app */}
      <div
        className={`fixed inset-y-0 left-0 w-[82%] max-w-xs bg-white shadow-2xl flex flex-col z-10 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header Drawer */}
        <div className="p-4 bg-emerald-800 text-white flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shadow-md overflow-hidden shrink-0 border border-emerald-700/50">
              <Image
                src="/logo-kopsyah.png"
                alt="Logo Koperasi"
                width={36}
                height={36}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="font-bold text-base leading-tight">MyKopsyah</div>
              <div className="text-[11px] text-emerald-200 font-medium">Stok & Penjualan Kopsyah</div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-emerald-200 hover:text-white hover:bg-emerald-700/60 active:scale-95 rounded-lg transition-all"
            title="Tutup Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Daftar Navigasi */}
        <div className="p-3 flex-1 overflow-y-auto space-y-1.5">
          {links.map((link) => {
            const isActive =
              pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href));
            const Icon = link.icon;

            if (link.highlight) {
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-600 active:bg-emerald-700 text-white font-bold shadow-md my-2 transform active:scale-[0.98] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-emerald-100" />
                    <span>{link.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-emerald-200" />
                </Link>
              );
            }

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={`flex items-center justify-between p-3 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] ${
                  isActive
                    ? "bg-emerald-50 text-emerald-800 border-l-4 border-emerald-600 font-bold shadow-xs"
                    : "text-slate-700 hover:bg-slate-100 active:bg-slate-150"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-5 h-5 ${
                      isActive ? "text-emerald-700" : "text-slate-400"
                    }`}
                  />
                  <span>{link.label}</span>
                </div>
                {isActive && <div className="w-2 h-2 rounded-full bg-emerald-600" />}
              </Link>
            );
          })}
        </div>

        {/* ─── PENGATURAN DI BAGIAN BAWAH DRAWER ─── */}
        <div className="p-3 border-t border-slate-200 bg-white">
          <Link
            href="/pengaturan"
            onClick={onClose}
            className={`flex items-center justify-between p-3 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] ${
              isSettingsActive
                ? "bg-emerald-50 text-emerald-800 border-l-4 border-emerald-600 font-bold shadow-xs"
                : "text-slate-700 hover:bg-slate-100 active:bg-slate-150"
            }`}
          >
            <div className="flex items-center gap-3">
              <Settings
                className={`w-5 h-5 ${
                  isSettingsActive ? "text-emerald-700" : "text-slate-400"
                }`}
              />
              <span>Pengaturan</span>
            </div>
            {isSettingsActive && <div className="w-2 h-2 rounded-full bg-emerald-600" />}
          </Link>
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-100 bg-slate-50 text-xs text-slate-500 text-center font-medium">
          Koperasi Syariah FKDT Prov. Sumbar
        </div>
      </div>
    </div>
  );
}
