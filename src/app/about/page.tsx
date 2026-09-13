import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Target, Shield, Users } from 'lucide-react';
import Footer from '@/components/Footer';


export const metadata: Metadata = {
  title: 'Tentang Kami | Nunaca Form',
  description:
    'Nunaca Form adalah sistem formulir interaktif internal Nunaca Group Indonesia — 100% kepemilikan dan privasi data, tanpa biaya langganan SaaS bulanan.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] font-sans text-white selection:bg-yellow-500/30">

      <section className="pt-40 pb-20 px-6 max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-white/50 hover:text-[#FFCC00] transition-colors mb-8 text-sm font-bold uppercase tracking-widest">
          <ArrowLeft size={16} /> Kembali ke Beranda
        </Link>
        
        <div className="flex items-center gap-3 mb-6">
          <span className="w-12 h-[1px] bg-[#FFCC00]"></span>
          <span className="text-[#FFCC00] font-bold tracking-[0.3em] uppercase text-sm">TENTANG KAMI</span>
        </div>
        
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter mb-10 leading-[1.1] italic text-white">
          Membangun Sistem <br/><span className="text-[#FFCC00]">Internal yang Kuat.</span>
        </h1>
        
        <div className="space-y-6 text-lg text-white/70 leading-relaxed mb-16">
          <p>
            Nunaca Form adalah inisiatif teknologi internal yang dibangun khusus untuk memenuhi kebutuhan pengumpulan data secara interaktif, profesional, dan efisien dalam ekosistem bisnis Nunaca Group.
          </p>
          <p>
            Berbeda dengan layanan pihak ketiga (SaaS), sistem <em>custom-built</em> ini menjamin <strong>100% kepemilikan dan privasi data</strong> pada infrastruktur internal kami. Kami tidak perlu khawatir akan batasan kustomisasi atau biaya langganan yang mahal.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6 bg-neutral-900 border border-white/10 rounded-xl">
            <Target className="text-[#FFCC00] mb-4" size={32} />
            <h3 className="text-xl font-bold mb-2 uppercase tracking-tight">Visi Misi</h3>
            <p className="text-white/50 text-sm">Menghadirkan pengalaman survei terbaik yang menyenangkan bagi pengguna dan efisien bagi pengelola.</p>
          </div>
          <div className="p-6 bg-neutral-900 border border-white/10 rounded-xl">
            <Shield className="text-[#FFCC00] mb-4" size={32} />
            <h3 className="text-xl font-bold mb-2 uppercase tracking-tight">Privasi 100%</h3>
            <p className="text-white/50 text-sm">Data responden dan logika bisnis sepenuhnya berada di server Nunaca tanpa campur tangan pihak ketiga.</p>
          </div>
          <div className="p-6 bg-neutral-900 border border-white/10 rounded-xl">
            <Users className="text-[#FFCC00] mb-4" size={32} />
            <h3 className="text-xl font-bold mb-2 uppercase tracking-tight">Kustomisasi</h3>
            <p className="text-white/50 text-sm">Dirancang agar fleksibel dan dapat dihubungkan langsung dengan berbagai lini unit bisnis Nunaca.</p>
          </div>
        </div>
      </section>

      <div className="mt-20">
        <Footer />
      </div>
    </div>
  );
}
