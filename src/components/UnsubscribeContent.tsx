'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { removeSubscriber } from '@/lib/storage';

export default function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const [state, setState] = useState<'checking' | 'removed' | 'missing' | 'noemail'>('checking');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(email ? (removeSubscriber(email) ? 'removed' : 'missing') : 'noemail');
  }, [email]);

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 text-center relative">
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-50"></div>
      <div className="max-w-md z-10">
        {state === 'checking' && (
          <p className="text-white/50 text-sm uppercase tracking-widest font-bold">Memproses...</p>
        )}
        {state === 'removed' && (
          <>
            <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-4">Berhenti Berlangganan</h1>
            <p className="text-white/60 leading-relaxed mb-3">
              Email <span className="text-[#FFCC00] font-bold">{email}</span> sudah dihapus dari daftar newsletter Nunaca.
            </p>
            <p className="text-white/40 text-sm mb-10">Terima kasih pernah berlangganan.</p>
          </>
        )}
        {state === 'missing' && (
          <>
            <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-4">Tidak Ditemukan</h1>
            <p className="text-white/60 mb-10">Email ini tidak ada di daftar newsletter.</p>
          </>
        )}
        {state === 'noemail' && (
          <>
            <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-4">Samar</h1>
            <p className="text-white/60 mb-10">Tidak ada email yang diproses.</p>
          </>
        )}
        <Link href="/" className="inline-block text-[#FFCC00] text-sm font-bold uppercase tracking-widest hover:underline">
          ← Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}