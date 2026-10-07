"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { PelangganData } from "@/lib/data-service";
import {
  createPelangganAction,
  updatePelangganAction,
  deletePelangganAction,
} from "@/app/actions";
import CityCombobox from "@/components/CityCombobox";
import {
  Users,
  Search,
  Plus,
  Pencil,
  Trash2,
  Phone,
  MapPin,
  Building2,
  User,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  MessageCircle,
  ReceiptText,
} from "lucide-react";

export default function PelangganClient({
  initialPelanggan,
}: {
  initialPelanggan: PelangganData[];
}) {
  const [pelangganList, setPelangganList] = useState<PelangganData[]>(initialPelanggan);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("Semua");

  const [isPending, startTransition] = useTransition();

  // Modal State
  const [modalMode, setModalMode] = useState<"ADD" | "EDIT" | null>(null);
  const [selectedPelanggan, setSelectedPelanggan] = useState<PelangganData | null>(null);

  // Form State
  const [formNama, setFormNama] = useState("");
  const [formTipe, setFormTipe] = useState("Instansi / Pesantren");
  const [formPhone, setFormPhone] = useState("");
  const [formKota, setFormKota] = useState("");
  const [formAlamat, setFormAlamat] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Delete Confirm State
  const [deleteTarget, setDeleteTarget] = useState<PelangganData | null>(null);

  // Filter
  const filteredList = pelangganList.filter((p) => {
    const matchType =
      typeFilter === "Semua" ||
      (typeFilter === "Instansi" && p.tipePelanggan.includes("Instansi")) ||
      (typeFilter === "Perorangan" && !p.tipePelanggan.includes("Instansi"));

    const query = searchQuery.toLowerCase().trim();
    const matchQuery =
      query === "" ||
      p.nama.toLowerCase().includes(query) ||
      p.noTelepon.includes(query) ||
      p.kota.toLowerCase().includes(query) ||
      (p.alamatLengkap && p.alamatLengkap.toLowerCase().includes(query));

    return matchType && matchQuery;
  });

  // Stats
  const totalCount = pelangganList.length;
  const instansiCount = pelangganList.filter((p) => p.tipePelanggan.includes("Instansi")).length;
  const peroranganCount = totalCount - instansiCount;
  const uniqueCities = new Set(pelangganList.map((p) => p.kota)).size;

  const handleOpenAdd = () => {
    setSelectedPelanggan(null);
    setFormNama("");
    setFormTipe("Instansi / Pesantren");
    setFormPhone("");
    setFormKota("");
    setFormAlamat("");
    setErrorMessage("");
    setModalMode("ADD");
  };

  const handleOpenEdit = (p: PelangganData) => {
    setSelectedPelanggan(p);
    setFormNama(p.nama);
    setFormTipe(p.tipePelanggan);
    setFormPhone(p.noTelepon);
    setFormKota(p.kota);
    setFormAlamat(p.alamatLengkap || "");
    setErrorMessage("");
    setModalMode("EDIT");
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formNama.trim()) {
      setErrorMessage("Nama pelanggan atau instansi wajib diisi.");
      return;
    }
    if (!formPhone.trim()) {
      setErrorMessage("Nomor telepon/WhatsApp wajib diisi.");
      return;
    }
    if (!formKota.trim()) {
      setErrorMessage("Kota / Kabupaten wajib dipilih.");
      return;
    }

    startTransition(async () => {
      if (modalMode === "ADD") {
        const payload = {
          nama: formNama.trim(),
          tipePelanggan: formTipe,
          noTelepon: formPhone.trim(),
          kota: formKota.trim(),
          alamatLengkap: formAlamat.trim() || undefined,
        };
        const res = await createPelangganAction(payload);
        if (res.success && res.pelangganId) {
          setPelangganList((prev) => [
            {
              id: res.pelangganId!,
              nama: payload.nama,
              tipePelanggan: payload.tipePelanggan,
              noTelepon: payload.noTelepon,
              kota: payload.kota,
              alamatLengkap: payload.alamatLengkap || null,
              dibuatPada: new Date().toISOString(),
            },
            ...prev,
          ]);
          setModalMode(null);
        } else {
          setErrorMessage(res.error || "Gagal menyimpan pelanggan");
        }
      } else if (modalMode === "EDIT" && selectedPelanggan) {
        const payload = {
          nama: formNama.trim(),
          tipePelanggan: formTipe,
          noTelepon: formPhone.trim(),
          kota: formKota.trim(),
          alamatLengkap: formAlamat.trim() || undefined,
        };
        const res = await updatePelangganAction(selectedPelanggan.id, payload);
        if (res.success) {
          setPelangganList((prev) =>
            prev.map((item) =>
              item.id === selectedPelanggan.id
                ? {
                    ...item,
                    nama: payload.nama,
                    tipePelanggan: payload.tipePelanggan,
                    noTelepon: payload.noTelepon,
                    kota: payload.kota,
                    alamatLengkap: payload.alamatLengkap || null,
                  }
                : item
            )
          );
          setModalMode(null);
        } else {
          setErrorMessage(res.error || "Gagal memperbarui pelanggan");
        }
      }
    });
  };

  const handleExecuteDelete = () => {
    if (!deleteTarget) return;
    startTransition(async () => {
      const res = await deletePelangganAction(deleteTarget.id);
      if (res.success) {
        setPelangganList((prev) => prev.filter((p) => p.id !== deleteTarget.id));
        setDeleteTarget(null);
      } else {
        alert(res.error || "Gagal menghapus data pelanggan");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Data Pelanggan
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Buku kontak pemesan, wali santri, dan lembaga untuk transaksi kasir otomatis
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Pelanggan</span>
        </button>
      </div>

      {/* Ringkasan Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Total Pelanggan</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{totalCount}</div>
          <span className="text-[11px] text-emerald-800 font-bold">Terdaftar aktif</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Instansi / Ponpes</span>
          <div className="text-2xl font-black text-emerald-800 mt-1">{instansiCount}</div>
          <span className="text-[11px] text-slate-500">Lembaga & yayasan</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Perorangan</span>
          <div className="text-2xl font-black text-slate-800 mt-1">{peroranganCount}</div>
          <span className="text-[11px] text-slate-500">Wali santri / umum</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Wilayah Asal</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{uniqueCities}</div>
          <span className="text-[11px] text-slate-500">Kab / Kota terlayani</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama pemesan, no. WhatsApp, atau kota..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-slate-50/50"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {["Semua", "Instansi", "Perorangan"].map((tab) => (
            <button
              key={tab}
              onClick={() => setTypeFilter(tab)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                typeFilter === tab
                  ? "bg-emerald-800 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab === "Instansi"
                ? "Instansi / Pesantren"
                : tab === "Perorangan"
                ? "Wali Santri / Perorangan"
                : "Semua Tipe"}
            </button>
          ))}
        </div>
      </div>

      {/* Daftar Pelanggan */}
      {filteredList.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Tidak ada pelanggan ditemukan</h3>
          <p className="text-sm text-slate-500 mt-1">
            Coba kata kunci pencarian lain atau tambahkan data pelanggan baru.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          {filteredList.map((p) => {
            const isInstansi = p.tipePelanggan.includes("Instansi");
            const cleanPhone = p.noTelepon.replace(/[^0-9]/g, "");
            const waNumber = cleanPhone.startsWith("0")
              ? "62" + cleanPhone.slice(1)
              : cleanPhone;

            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-black uppercase tracking-wider ${
                        isInstansi
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}
                    >
                      {isInstansi ? (
                        <Building2 className="w-3 h-3" />
                      ) : (
                        <User className="w-3 h-3" />
                      )}
                      <span>{isInstansi ? "Instansi" : "Perorangan"}</span>
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Edit data pelanggan"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(p)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Hapus pelanggan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <Link
                      href={`/pelanggan/${p.id}`}
                      className="group font-extrabold text-base text-slate-900 hover:text-emerald-800 transition-colors leading-snug inline-block"
                      title="Lihat profil dan riwayat transaksi"
                    >
                      <span className="group-hover:underline">{p.nama}</span>
                    </Link>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span className="font-bold text-slate-800">{p.kota}</span>
                    </div>

                    {p.noTelepon && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{p.noTelepon}</span>
                      </div>
                    )}

                    {p.alamatLengkap && (
                      <p className="text-slate-500 text-[11px] line-clamp-2 pl-5 pt-0.5">
                        {p.alamatLengkap}
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer Card */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/pelanggan/${p.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 font-bold text-xs transition-colors"
                      title="Lihat semua riwayat transaksi pemesan ini"
                    >
                      <ReceiptText className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Riwayat</span>
                    </Link>

                    {waNumber && (
                      <a
                        href={`https://wa.me/${waNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs transition-colors"
                        title="Hubungi via WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">WA</span>
                      </a>
                    )}
                  </div>

                  <span className="text-[11px] text-slate-400 font-mono">ID #{p.id}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Form Tambah / Edit */}
      {modalMode && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg p-5 sm:p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-lg text-slate-900">
                {modalMode === "ADD" ? "Tambah Pelanggan Baru" : "Edit Data Pelanggan"}
              </h3>
              <button
                onClick={() => setModalMode(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmitForm} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nama Lengkap / Lembaga <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value)}
                  placeholder="Contoh: Ponpes Tarbiyah / Ust. Ahmad"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-700 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Tipe Pelanggan
                </label>
                <select
                  value={formTipe}
                  onChange={(e) => setFormTipe(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-700 text-sm font-medium"
                >
                  <option value="Instansi / Pesantren">Instansi / Pesantren</option>
                  <option value="Perorangan / Wali Santri">Perorangan / Wali Santri</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nomor WhatsApp / HP <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-700 text-sm font-medium"
                />
              </div>

              <div>
                <CityCombobox value={formKota} onChange={setFormKota} required />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Alamat Lengkap Pengiriman
                </label>
                <textarea
                  rows={2}
                  value={formAlamat}
                  onChange={(e) => setFormAlamat(e.target.value)}
                  placeholder="Jalan, RT/RW, Dusun, Kecamatan"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-700 text-sm font-medium"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs disabled:opacity-50"
                >
                  {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{modalMode === "ADD" ? "Simpan Pelanggan" : "Perbarui Data"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-sm p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-extrabold text-base text-slate-900">Hapus Pelanggan?</h3>
              <p className="text-xs text-slate-500">
                Data <strong>{deleteTarget.nama}</strong> ({deleteTarget.kota}) akan dihapus dari
                buku pelanggan. Nota transaksi lama tetap aman.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleExecuteDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs disabled:opacity-50 inline-flex items-center justify-center gap-1"
              >
                {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Ya, Hapus</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
