"use client";

import { useState } from "react";
import { Link2, Check, Share2 } from "lucide-react";

export default function CopyStockLinkBtn({
  className = "",
  variant = "primary",
}: {
  className?: string;
  variant?: "primary" | "secondary" | "header";
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const url = typeof window !== "undefined" ? `${window.location.origin}/stok` : "/stok";
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  if (variant === "header") {
    return (
      <button
        onClick={handleCopy}
        type="button"
        title="Salin Link Stok Publik untuk Pelanggan"
        className={`flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 active:scale-95 rounded-lg transition-all ${className}`}
      >
        {copied ? <Check className="w-4 h-4 text-emerald-700" /> : <Share2 className="w-4 h-4" />}
        <span>{copied ? "Link Disalin!" : "Bagi Link Stok"}</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleCopy}
      type="button"
      className={`flex items-center justify-center gap-2 px-5 py-3.5 text-base font-bold text-white bg-emerald-700 hover:bg-emerald-800 active:scale-98 rounded-xl shadow-md transition-all ${className}`}
    >
      {copied ? <Check className="w-5 h-5 text-white" /> : <Link2 className="w-5 h-5" />}
      <span>{copied ? "✅ Tautan Stok Berhasil Disalin!" : "📋 Salin Link Stok untuk WhatsApp"}</span>
    </button>
  );
}
