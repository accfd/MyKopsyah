import React from "react";

interface ReportFooterProps {
  leftTitle?: string;
  leftRole?: string;
  leftName?: string;
  rightCity?: string;
  rightRole?: string;
  rightName?: string;
  className?: string;
}

export default function ReportFooter({
  leftTitle = "Mengetahui,",
  leftRole = "Pengawas KOPSYAH FKDT",
  leftName = "( ........................................ )",
  rightCity = "Padang",
  rightRole = "Pengurus KOPSYAH FKDT Prov. Sumbar",
  rightName = "( ........................................ )",
  className = "",
}: ReportFooterProps) {
  const printDateStr = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className={`mt-8 break-inside-avoid text-xs ${className}`}>
      {/* ─── BLOK TANDA TANGAN FORMAL ─── */}
      <div className="flex justify-between items-start text-center px-6">
        <div>
          <p className="font-semibold text-slate-700 print:text-black">{leftTitle}</p>
          <p className="font-black text-slate-900 print:text-black mt-0.5">{leftRole}</p>
          <div className="h-16" />
          <p className="font-bold underline uppercase text-slate-900 print:text-black">{leftName}</p>
        </div>

        <div>
          <p className="font-medium text-slate-700 print:text-black">
            {rightCity}, {printDateStr}
          </p>
          <p className="font-black text-slate-900 print:text-black mt-0.5">{rightRole}</p>
          <div className="h-16" />
          <p className="font-bold underline uppercase text-slate-900 print:text-black">{rightName}</p>
        </div>
      </div>

      {/* ─── GARIS PENUTUP & KETERANGAN CETAK 1 BARIS RINGKAS ─── */}
      <div className="mt-6 pt-2 border-t border-slate-300 print:border-black/40 flex items-center justify-between text-[9px] text-slate-500 print:text-black/70">
        <div>
          Dicetak otomatis melalui Sistem MyKopsyah • Dokumen Resmi Logistik & Keuangan
        </div>
        <div className="font-semibold">
          Koperasi Syariah FKDT Sumbar • Halaman 1 dari 1
        </div>
      </div>
    </div>
  );
}
