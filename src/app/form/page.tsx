'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import FormEngine from '@/components/FormEngine';
import { FormSchema } from '@/types/form';
import { getCachedSchema } from '@/lib/storage';
import { pullSchema, pullPublished } from '@/lib/supabase';

import Link from 'next/link';
import { Lock } from 'lucide-react';

function FormLoader() {
  const [schema, setSchema] = useState<FormSchema | null>(null);
  const [published, setPublishedState] = useState(false);
  const [checked, setChecked] = useState(false);
  const searchParams = useSearchParams();
  const workspace = searchParams.get('workspace');
  const preview = searchParams.get('preview') === '1';

  useEffect(() => {
    if (!workspace) return;
    let alive = true;
    (async () => {
      // Cloud adalah sumber kebenaran: hanya bentuk form yang benar-benar ada yang ditampilkan
      const cached = getCachedSchema(workspace);
      const [remote, distant] = await Promise.all([
        pullSchema(workspace),
        pullPublished(workspace),
      ]);
      if (!alive) return;
      setSchema((remote as FormSchema | null) ?? cached ?? null);
      setPublishedState(distant ?? true);
      setChecked(true);
    })();
    return () => {
      alive = false;
    };
  }, [workspace]);

  if (!workspace) {
    const lines = [
      { id: 'barbershop', name: 'Barbershop', icon: '✂️' },
      { id: 'beauty_bar', name: 'Beauty Bar', icon: '✨' },
      { id: 'kids_spa', name: 'Kids Spa', icon: '👶' },
      { id: 'coffee', name: 'Coffee & Pastry', icon: '☕' },
      { id: 'agency', name: 'Agency', icon: '💼' },
      { id: 'skincare', name: 'Skincare', icon: '💧' },
      { id: 'travel', name: 'Travel', icon: '✈️' },
      { id: 'butik', name: 'Butik', icon: '👗' }
    ];
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 relative">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-50"></div>
        <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-[#FFCC00]/5 rounded-full blur-[150px] pointer-events-none"></div>
        
        <div className="z-10 text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter mb-4">Pilih Layanan <span className="text-[#FFCC00]">Nunaca</span></h1>
          <p className="text-white/50 text-lg mb-12">Silakan pilih unit bisnis yang ingin Anda akses formulirnya.</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {lines.map(line => (
              <Link 
                key={line.id} 
                href={`/form?workspace=${line.id}`}
                className="bg-white/5 border border-white/10 hover:border-[#FFCC00] hover:bg-[#FFCC00]/5 hover:-translate-y-1 transition-all rounded-2xl p-6 flex flex-col items-center gap-4 group"
              >
                <div className="text-4xl group-hover:scale-110 transition-transform">{line.icon}</div>
                <div className="text-white font-bold tracking-wider text-sm text-center uppercase">{line.name}</div>
              </Link>
            ))}
          </div>
          
          <Link href="/" className="inline-block mt-12 text-white/30 hover:text-[#FFCC00] text-xs font-bold uppercase tracking-widest transition-colors">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  if (!schema && !checked) return <div className="min-h-screen bg-[#050505] text-[#FFCC00] flex items-center justify-center font-bold tracking-widest uppercase">Loading Form...</div>;

  if (!schema) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 text-center relative">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-50"></div>
        <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-white/30 mb-8 z-10">
          <Lock size={36} />
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-tighter mb-4 z-10">Form Belum Tersedia</h1>
        <p className="text-white/50 max-w-md mb-10 z-10">Formulir untuk layanan ini belum diterbitkan. Silakan kembali lagi nanti.</p>
        <Link href="/" className="z-10 text-[#FFCC00] text-sm font-bold uppercase tracking-widest hover:underline">
          ← Kembali ke Beranda
        </Link>
      </div>
    );
  }

  if (!preview && !published) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 text-center relative">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-50"></div>
        <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-white/30 mb-8 z-10">
          <Lock size={36} />
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-tighter mb-4 z-10">Form Sedang Ditutup</h1>
        <p className="text-white/50 max-w-md mb-10 z-10">Formulir ini sedang dalam perbaikan. Silakan kembali lagi nanti atau hubungi admin Nunaca.</p>
        <Link href="/" className="z-10 text-[#FFCC00] text-sm font-bold uppercase tracking-widest hover:underline">
          ← Kembali ke Beranda
        </Link>
      </div>
    );
  }

  return <FormEngine schema={schema} workspaceId={workspace} />;
}

export default function FormPage() {
  return (
    <main className="min-h-screen bg-white">
      <Suspense fallback={<div className="min-h-screen bg-[#0A0A0A] text-[#FFCC00] flex items-center justify-center font-bold tracking-widest uppercase">Loading...</div>}>
        <FormLoader />
      </Suspense>
    </main>
  );
}
