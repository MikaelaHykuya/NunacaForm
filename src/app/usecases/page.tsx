import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Scissors, Sparkles, Baby, Coffee, Briefcase, Droplets, Plane, Shirt } from 'lucide-react';
import Footer from '@/components/Footer';

import { getAllUseCases } from '@/lib/cms';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Studi Kasus | Nunaca Form',
  description:
    'Lihat bagaimana seluruh lini usaha Nunaca Group — Barbershop, Beauty Bar, Kids Spa, Coffee, Agency, Skincare, Travel, dan Butik — memanfaatkan Nunaca Form untuk mengumpulkan data secara interaktif.',
  alternates: { canonical: '/usecases' },
};

const ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Scissors,
  Sparkles,
  Baby,
  Coffee,
  Briefcase,
  Droplets,
  Plane,
  Shirt,
};

export default async function UseCasesPage() {
  const useCases = await getAllUseCases();

  return (
    <div className="min-h-screen bg-[#0A0A0A] font-sans text-white selection:bg-[#FFCC00]/30 flex flex-col">

      <section className="pt-40 pb-20 px-6 relative flex-grow">
        <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-[#FFCC00]/5 rounded-full blur-[150px] -z-10 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-white/50 hover:text-[#FFCC00] transition-colors mb-12 text-sm font-bold uppercase tracking-widest">
            <ArrowLeft size={16} /> Kembali ke Beranda
          </Link>

          <div className="text-center mb-20">
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="w-12 h-[1px] bg-[#FFCC00]"></span>
              <span className="text-[#FFCC00] font-bold tracking-[0.3em] uppercase text-sm">STUDI KASUS MULTI LINI</span>
              <span className="w-12 h-[1px] bg-[#FFCC00]"></span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 text-white uppercase italic tracking-tighter leading-[1.1]">
              Satu Mesin, <br/><span className="text-[#FFCC00]">Solusi Seluruh Ekosistem.</span>
            </h1>
            <p className="text-white/60 text-lg max-w-3xl mx-auto leading-relaxed">
              Nunaca Form dirancang tidak hanya untuk satu bisnis, melainkan sebagai pusat saraf pengumpulan data bagi <strong>seluruh lini usaha Nunaca Group</strong>. Lihat bagaimana setiap lini memanfaatkannya:
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map((useCase) => {
              const Icon = ICONS[useCase.icon] || Sparkles;
              return (
                <div key={useCase.id} className="bg-neutral-900 p-6 rounded-2xl border border-white/5 hover:border-[#FFCC00]/30 transition-all hover:-translate-y-1 shadow-lg hover:shadow-[0_10px_30px_rgba(255,204,0,0.1)] group">
                  <div className="w-12 h-12 rounded-xl bg-white/5 group-hover:bg-[#FFCC00]/10 flex items-center justify-center mb-6 transition-colors">
                    <Icon size={24} className="text-[#FFCC00]" />
                  </div>
                  <h3 className="text-xl font-black italic uppercase text-white group-hover:text-[#FFCC00] transition-colors mb-2 leading-tight">
                    {useCase.title}
                  </h3>
                  <p className="font-bold text-[#FFCC00]/80 mb-4 text-sm uppercase tracking-wider">{useCase.subtitle}</p>
                  <p className="text-white/50 text-sm leading-relaxed">{useCase.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}