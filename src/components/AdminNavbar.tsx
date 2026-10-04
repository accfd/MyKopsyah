"use client";

import Link from "next/link";
import { LogOut, Store } from "lucide-react";
import CopyStockLinkBtn from "./CopyStockLinkBtn";
import { logoutAction } from "@/app/actions";

export default function AdminNavbar() {
  return (
    <header className="sticky top-0 z-40 bg-emerald-800 text-white shadow-md no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-inner">
            <Store className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white leading-tight">MyKopsyah</h1>
            <p className="text-xs text-emerald-200 font-medium">Stok & Penjualan Kopsyah</p>
          </div>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <CopyStockLinkBtn variant="header" />
          <form action={logoutAction}>
            <button
              type="submit"
              title="Keluar dari Sistem Admin"
              onClick={(e) => {
                if (!confirm("Apakah Anda yakin ingin keluar?")) {
                  e.preventDefault();
                }
              }}
              className="p-2 text-emerald-200 hover:text-white hover:bg-emerald-700/60 rounded-lg transition-all"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
