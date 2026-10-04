"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/actions";
import { Store, KeyRound, ArrowRight, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-900 to-emerald-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border border-emerald-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-100 rounded-2xl mx-auto flex items-center justify-center text-emerald-700 mb-3 shadow-inner">
            <Store className="w-9 h-9" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Masuk MyKopsyah</h1>
          <p className="text-sm text-slate-600 mt-1">Sistem Stok & Penjualan Koperasi Syariah</p>
        </div>

        {state?.error && (
          <div className="mb-6 p-4 bg-rose-50 border-l-4 border-rose-600 text-rose-800 text-sm rounded-r-lg font-medium">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-6">
          <div>
            <label htmlFor="pin" className="block text-sm font-semibold text-slate-800 mb-2">
              Masukkan PIN Admin:
            </label>
            <div className="relative">
              <input
                id="pin"
                name="pin"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={10}
                required
                placeholder="Ketik 6 digit PIN (contoh: 123456)"
                className="w-full px-4 py-3.5 pl-11 text-lg font-medium tracking-wider bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 focus:bg-white transition-all text-slate-900"
              />
              <KeyRound className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
            <p className="text-xs text-slate-500 mt-2">
              💡 <span className="font-semibold">Tips:</span> PIN bawaan awal sistem adalah{" "}
              <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono font-bold text-emerald-800">
                123456
              </code>
            </p>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-4 px-6 bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white text-lg font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isPending ? (
              <span>Memverifikasi...</span>
            ) : (
              <>
                <span>Buka Sistem Admin</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Sistem aman & terenkripsi untuk Kopsyah</span>
        </div>
      </div>
    </div>
  );
}
