import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MyKopsyah - Sistem Stok & Penjualan Koperasi Syariah",
  description: "Aplikasi pengelolaan stok barang dan pencatatan transaksi penjualan Koperasi Syariah.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
