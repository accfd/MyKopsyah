import React from "react";

interface ReportHeaderProps {
  title: string;
  documentNumber?: string;
  period?: string;
  className?: string;
}

export default function ReportHeader({
  title,
  documentNumber,
  period,
  className = "",
}: ReportHeaderProps) {
  return (
    <div className={`w-full ${className}`}>
      {/* ─── KOP SURAT RESMI KOPSYAH FKDT SUMBAR (RATA KIRI DENGAN LOGO) ─── */}
      <div className="border-b-[2.5px] border-black pb-2 mb-0.5">
        <div className="flex items-center gap-4">
          {/* Logo Koperasi Syariah */}
          <div className="w-16 h-16 shrink-0 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-kopsyah.png"
              alt="Logo Koperasi Indonesia"
              className="w-16 h-16 object-contain"
            />
          </div>

          {/* Teks Lembaga Rata Kiri */}
          <div className="flex-1 text-left">
            <h2 className="text-[12px] sm:text-[13px] font-extrabold uppercase tracking-wide leading-tight text-slate-900 print:text-black">
              Koperasi Syariah Forum Komunikasi Diniyah Takmiliyah
            </h2>
            <h1 className="text-[13px] sm:text-[15px] font-black uppercase tracking-wider text-emerald-900 print:text-black leading-tight mt-0.5">
              (KOPSYAH FKDT) PROVINSI SUMATERA BARAT
            </h1>
            <p className="text-[9.5px] leading-tight text-slate-800 print:text-black mt-1">
              Alamat: Jln. Madani III Blok D No 24 Kecamatan Nanggalo Kota Padang (25144)
            </p>
            <p className="text-[9px] leading-tight text-slate-700 print:text-black mt-0.5">
              Kontak Resmi & WhatsApp: 0812-6741-7939 / 0852-6300-6009
            </p>
          </div>
        </div>
      </div>
      {/* Garis Ganda Penutup Kop */}
      <div className="border-b border-black mb-4" />

      {/* ─── JUDUL DOKUMEN & PENOMORAN RESMI ─── */}
      <div className="text-center mb-5">
        <h3 className="text-sm sm:text-base font-black uppercase tracking-wide underline decoration-2">
          {title}
        </h3>
        {documentNumber && (
          <p className="text-[11px] font-bold text-slate-700 print:text-black mt-0.5 tracking-wider font-mono">
            {documentNumber}
          </p>
        )}
        {period && (
          <p className="text-xs font-bold text-slate-800 print:text-black mt-0.5">
            {period}
          </p>
        )}
      </div>
    </div>
  );
}
