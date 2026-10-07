"use client";

import Link from "next/link";
import Image from "next/image";
import { Settings, PanelLeft, Menu } from "lucide-react";

interface AdminNavbarProps {
  onToggleSidebar?: () => void;
  onToggleMobileMenu?: () => void;
}

export default function AdminNavbar({ onToggleSidebar, onToggleMobileMenu }: AdminNavbarProps) {
  return (
    <header className="sticky top-0 z-40 bg-emerald-800 text-white shadow-md no-print">
      <div className="w-full px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile hamburger menu */}
          {onToggleMobileMenu && (
            <button
              type="button"
              onClick={onToggleMobileMenu}
              title="Menu Navigasi"
              className="md:hidden p-2 text-emerald-200 hover:text-white hover:bg-emerald-700/70 rounded-xl transition-all"
            >
              <Menu className="w-6 h-6" />
            </button>
          )}

          {/* Desktop sidebar toggle button */}
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              title="Buka / Tutup Sidebar"
              className="hidden md:flex p-2 text-emerald-200 hover:text-white hover:bg-emerald-700/70 rounded-xl transition-all"
            >
              <PanelLeft className="w-5 h-5" />
            </button>
          )}

          <Link href="/dashboard" className="flex items-center gap-2.5 sm:gap-3 group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white p-1 flex items-center justify-center shadow-md overflow-hidden shrink-0 border border-emerald-700/50 group-hover:scale-105 transition-transform">
              <Image
                src="/logo-kopsyah.png"
                alt="Logo Koperasi Indonesia"
                width={40}
                height={40}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white leading-tight">MyKopsyah</h1>
              <p className="text-[11px] sm:text-xs text-emerald-200 font-medium">Stok & Penjualan Kopsyah</p>
            </div>
          </Link>
        </div>

        <Link
          href="/pengaturan"
          title="Pengaturan"
          className="p-2 text-emerald-200 hover:text-white hover:bg-emerald-700/60 rounded-lg transition-all"
        >
          <Settings className="w-5 h-5" />
        </Link>
      </div>
    </header>
  );
}
