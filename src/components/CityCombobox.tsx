"use client";

import { useState, useRef, useEffect } from "react";
import { DAFTAR_WILAYAH_SUMBAR } from "@/lib/wilayah-sumbar";
import { MapPin, ChevronDown, Check, X } from "lucide-react";

interface CityComboboxProps {
  value: string;
  onChange: (city: string) => void;
  required?: boolean;
}

export default function CityCombobox({ value, onChange, required = false }: CityComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState(value);
  const [isCustomOutside, setIsCustomOutside] = useState(false);
  const [customCity, setCustomCity] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync internal search with external value
  useEffect(() => {
    setSearch(value);
    const isSumbar = (DAFTAR_WILAYAH_SUMBAR as readonly string[]).includes(value);
    if (value && !isSumbar) {
      setIsCustomOutside(true);
      setCustomCity(value);
    }
  }, [value]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = DAFTAR_WILAYAH_SUMBAR.filter((item) =>
    item.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (city: string) => {
    if (city === "Lainnya (Di Luar Sumbar)") {
      setIsCustomOutside(true);
      setCustomCity("");
      onChange("");
      setSearch("Lainnya (Di Luar Sumbar)");
      setIsOpen(false);
    } else {
      setIsCustomOutside(false);
      setSearch(city);
      onChange(city);
      setIsOpen(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    onChange(val);
    setIsOpen(true);
    if (isCustomOutside) {
      setIsCustomOutside(false);
    }
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomCity(val);
    onChange(val ? `Di Luar Sumbar - ${val}` : "Di Luar Sumbar");
  };

  return (
    <div className="space-y-2" ref={containerRef}>
      <label className="block text-sm font-semibold text-slate-800">
        Kota / Kabupaten Tujuan (Sumatera Barat) <span className="text-rose-500">*</span>
      </label>

      <div className="relative">
        <div className="relative flex items-center">
          <input
            type="text"
            required={required}
            value={search}
            onFocus={() => setIsOpen(true)}
            onChange={handleInputChange}
            placeholder="Ketik untuk mencari Kota / Kab di Sumbar..."
            className="w-full px-4 py-3 pl-11 pr-16 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-slate-900 font-medium"
          />
          <MapPin className="w-5 h-5 text-emerald-700 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />

          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  onChange("");
                  setIsCustomOutside(false);
                  setIsOpen(true);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* Dropdown Suggestions */}
        {isOpen && (
          <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-64 overflow-y-auto divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-100">
            {filtered.length === 0 ? (
              <div className="p-4 text-center text-sm text-slate-500">
                <p>Tidak ada Kab/Kota di Sumbar yang cocok.</p>
                <button
                  type="button"
                  onClick={() => handleSelect("Lainnya (Di Luar Sumbar)")}
                  className="mt-2 text-xs font-bold text-emerald-700 hover:underline inline-block"
                >
                  Pilih: "Lainnya (Di Luar Sumbar)" →
                </button>
              </div>
            ) : (
              filtered.map((item) => {
                const isSelected = value === item;
                const isSpecial = item === "Lainnya (Di Luar Sumbar)";

                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleSelect(item)}
                    className={`w-full text-left px-4 py-3 text-sm flex items-center justify-between transition-colors ${
                      isSelected
                        ? "bg-emerald-50 text-emerald-800 font-bold"
                        : isSpecial
                        ? "bg-amber-50/60 text-amber-900 font-semibold hover:bg-amber-100/60"
                        : "text-slate-800 hover:bg-slate-50"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <MapPin
                        className={`w-4 h-4 ${
                          isSpecial
                            ? "text-amber-600"
                            : isSelected
                            ? "text-emerald-600"
                            : "text-slate-400"
                        }`}
                      />
                      <span>{item}</span>
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-emerald-700" />}
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Input Tambahan Jika Memilih Di Luar Sumbar */}
      {isCustomOutside && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1.5 animate-in fade-in duration-200">
          <label className="block text-xs font-bold text-amber-900 uppercase">
            Tuliskan Nama Kota / Wilayah di Luar Sumbar:
          </label>
          <input
            type="text"
            required
            value={customCity}
            onChange={handleCustomChange}
            placeholder="Contoh: Kota Pekanbaru, Jakarta Selatan, Kab. Kampar"
            className="w-full px-3 py-2.5 bg-white border border-amber-300 rounded-lg text-sm text-slate-900 font-medium focus:ring-2 focus:ring-amber-500"
          />
        </div>
      )}

    </div>
  );
}
