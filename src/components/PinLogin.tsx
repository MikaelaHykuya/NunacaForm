'use client';

import { useState } from 'react';
import { Lock, ArrowRight, ShieldCheck, Loader2, Cloud } from 'lucide-react';
import Link from 'next/link';
import { loginWithPin } from '@/lib/auth';
import { supabaseEnabled } from '@/lib/supabase';

export default function PinLogin({ onSuccess }: { onSuccess: () => void }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await loginWithPin(pin);
    setLoading(false);
    if (res.ok) {
      onSuccess();
    } else {
      setError(res.error || 'PIN salah!');
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] font-sans flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-50"></div>
      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-[#FFCC00]/5 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-[#FFCC00]/5 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="w-full max-w-md z-10 px-6">
        <Link href="/" className="flex items-center justify-center mb-10 text-white hover:scale-105 transition-transform">
          <ShieldCheck size={48} className="text-[#FFCC00]" />
        </Link>

        <div className="bg-neutral-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-2">Login <span className="text-[#FFCC00]">Admin</span></h1>
            <p className="text-white/50 text-sm">Masukkan PIN admin untuk mengakses sistem.</p>
            {supabaseEnabled && (
              <p className="text-[10px] text-emerald-400/80 mt-3 font-bold uppercase tracking-widest flex items-center justify-center gap-1">
                <Cloud size={12} /> Sinkronisasi cloud aktif
              </p>
            )}
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">PIN Akses</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={18} className="text-white/30" />
                </div>
                <input
                  type="password"
                  required
                  inputMode="numeric"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••••"
                  className="w-full bg-black border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white tracking-[0.5em] text-center text-lg font-bold focus:border-[#FFCC00] focus:ring-1 focus:ring-[#FFCC00] outline-none transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-500 text-xs p-3 rounded-lg text-center font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || pin.length < 6}
              className="w-full bg-[#FFCC00] text-black font-black uppercase tracking-widest py-4 rounded-xl hover:bg-yellow-400 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 mt-4 shadow-[0_0_20px_rgba(255,204,0,0.2)] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
              {loading ? 'Memverifikasi...' : 'Masuk Sistem'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-[10px] text-white/30">PIN admin dikonfigurasi oleh pemilik sistem.</p>
          </div>
        </div>

        <div className="text-center mt-8">
          <Link href="/" className="text-xs text-white/30 hover:text-white uppercase tracking-widest font-bold transition-colors">
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}