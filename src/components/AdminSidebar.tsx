"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  History,
  ReceiptText,
  MapPin,
  Settings,
  Users,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

interface AdminSidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  animateToggle?: boolean;
}

export default function AdminSidebar({
  collapsed = false,
  onToggle,
  animateToggle = false,
}: AdminSidebarProps) {
  const pathname = usePathname();

  const links = [
    { label: "Dasbor Utama", href: "/dashboard", icon: LayoutDashboard },
    { label: "Kasir Penjualan", href: "/transaksi/baru", icon: ShoppingCart, highlight: true },
    { label: "Daftar Transaksi", href: "/transaksi", icon: ReceiptText },
    { label: "Data Pelanggan", href: "/pelanggan", icon: Users },
    { label: "Katalog Produk", href: "/produk", icon: Package },
    { label: "Riwayat Stok Masuk", href: "/riwayat-stok", icon: History },
    { label: "Rekap Wilayah", href: "/laporan/wilayah", icon: MapPin },
  ];

  const isSettingsActive = pathname.startsWith("/pengaturan");

  return (
    <aside
      className={`hidden md:flex flex-col bg-white border-r border-slate-200 sticky top-16 h-[calc(100vh-4rem)] p-3 ${
        animateToggle ? "transition-all duration-300 ease-in-out" : ""
      } no-print overflow-y-auto select-none ${
        collapsed ? "w-20 items-center" : "w-64"
      }`}
    >
      <div className="space-y-1.5 flex-1 w-full">
        {links.map((link) => {
          const isActive =
            pathname === link.href ||
            (link.href !== "/dashboard" &&
              !link.href.includes("?") &&
              pathname.startsWith(link.href) &&
              link.href !== "/produk") ||
            (link.href === "/produk" && pathname === "/produk");

          const Icon = link.icon;

          if (link.highlight) {
            return (
              <Link
                key={link.label}
                href={link.href}
                title={collapsed ? link.label : undefined}
                className={`flex items-center gap-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm transition-all transform active:scale-98 my-2 ${
                  collapsed ? "justify-center p-3" : "px-4 py-3"
                }`}
              >
                <Icon className="w-5 h-5 text-emerald-100 shrink-0" />
                {!collapsed && <span className="truncate">{link.label}</span>}
              </Link>
            );
          }

          return (
            <Link
              key={link.label}
              href={link.href}
              title={collapsed ? link.label : undefined}
              className={`flex items-center gap-3 rounded-xl text-sm font-medium transition-colors ${
                collapsed ? "justify-center p-3" : "px-4 py-3"
              } ${
                isActive
                  ? collapsed
                    ? "bg-emerald-50 text-emerald-800 font-bold border-2 border-emerald-600"
                    : "bg-emerald-50 text-emerald-800 font-bold border-l-4 border-emerald-600"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Icon
                className={`w-5 h-5 shrink-0 ${
                  isActive ? "text-emerald-700" : "text-slate-400"
                }`}
              />
              {!collapsed && <span className="truncate">{link.label}</span>}
            </Link>
          );
        })}
      </div>

      {/* ─── BAGIAN BAWAH SIDEBAR: PENGATURAN & TOMBOL TUTUP ─── */}
      <div className="mt-auto pt-3 border-t border-slate-200 w-full space-y-1">
        <Link
          href="/pengaturan"
          title={collapsed ? "Pengaturan" : undefined}
          className={`flex items-center gap-3 rounded-xl text-sm font-medium transition-colors ${
            collapsed ? "justify-center p-3" : "px-4 py-2.5"
          } ${
            isSettingsActive
              ? collapsed
                ? "bg-emerald-50 text-emerald-800 font-bold border-2 border-emerald-600"
                : "bg-emerald-50 text-emerald-800 font-bold border-l-4 border-emerald-600"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <Settings
            className={`w-5 h-5 shrink-0 ${
              isSettingsActive ? "text-emerald-700" : "text-slate-400"
            }`}
          />
          {!collapsed && <span className="truncate">Pengaturan</span>}
        </Link>

        {/* Collapse Toggle Footer Button */}
        {onToggle && (
          <button
            type="button"
            onClick={onToggle}
            title={collapsed ? "Perluas Sidebar" : "Tutup / Perkecil Sidebar"}
            className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors ${
              collapsed ? "justify-center" : "px-3"
            }`}
          >
            {collapsed ? (
              <PanelLeftOpen className="w-5 h-5 text-emerald-700 shrink-0" />
            ) : (
              <>
                <PanelLeftClose className="w-5 h-5 text-slate-500 shrink-0" />
                <span>Tutup Sidebar</span>
              </>
            )}
          </button>
        )}
      </div>
    </aside>
  );
}
