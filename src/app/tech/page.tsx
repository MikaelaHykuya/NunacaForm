import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Footer from '@/components/Footer';


export const metadata: Metadata = {
  title: 'Teknologi | Nunaca Form',
  description:
    'Tumpukan teknologi Nunaca Form: Next.js, Framer Motion, Node.js Route Handlers, dan Supabase PostgreSQL JSONB untuk performa & skalabilitas.',
  alternates: { canonical: '/tech' },
};

export default function TechPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] font-sans text-white selection:bg-yellow-500/30 flex flex-col">

      {/* Technology Stack Section */}
      <section className="pt-40 pb-20 px-6 relative flex-grow">
        <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-[#FFCC00]/5 rounded-full blur-[120px] -z-10"></div>
        <div className="max-w-6xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-white/50 hover:text-[#FFCC00] transition-colors mb-8 text-sm font-bold uppercase tracking-widest">
            <ArrowLeft size={16} /> Kembali ke Beranda
          </Link>

          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="w-12 h-[1px] bg-[#FFCC00]"></span>
              <span className="text-[#FFCC00] font-bold tracking-[0.3em] uppercase text-sm">TECH STACK</span>
              <span className="w-12 h-[1px] bg-[#FFCC00]"></span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 text-white uppercase italic tracking-tighter leading-[1.1]">
              Dibangun Untuk <br/><span className="text-[#FFCC00]">Performa.</span>
            </h1>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">Menggunakan teknologi industri terkini untuk memastikan kecepatan eksekusi, keamanan data, dan animasi sekelas aplikasi native.</p>
          </div>

          <div className="flex flex-col gap-8 max-w-4xl mx-auto">
            {/* Tech 1 */}
            <div className="flex flex-col md:flex-row gap-6 p-8 bg-neutral-900 border border-white/10 rounded-xl hover:border-[#FFCC00]/30 transition-colors shadow-lg">
              <div className="w-16 h-16 shrink-0 bg-white/5 text-white rounded-xl flex items-center justify-center font-black text-xl italic tracking-tighter border border-white/10">
                N
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2 text-[#FFCC00] uppercase tracking-tight">Frontend: Next.js + Framer Motion</h3>
                <p className="text-white/60 leading-relaxed text-lg">
                  Next.js sangat andal untuk mengelola state formulir bercabang yang rumit secara langsung di perangkat klien (client-side). Dipadukan dengan Framer Motion untuk menangani transisi animasi perpindahan antar soal agar terasa mulus dan profesional layaknya aplikasi native.
                </p>
              </div>
            </div>

            {/* Tech 2 */}
            <div className="flex flex-col md:flex-row gap-6 p-8 bg-neutral-900 border border-white/10 rounded-xl hover:border-[#FFCC00]/30 transition-colors shadow-lg">
              <div className="w-16 h-16 shrink-0 bg-white/5 text-white rounded-xl flex items-center justify-center font-black text-xl italic tracking-tighter border border-white/10">
                API
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2 text-[#FFCC00] uppercase tracking-tight">Mesin Logika: Node.js</h3>
                <p className="text-white/60 leading-relaxed text-lg">
                  Arsitektur backend berperforma tinggi menggunakan lingkungan Node.js (via Next.js Route Handlers) sebagai penyedia API endpoint untuk memproses kiriman formulir, mengeksekusi aturan logika (logic jumps), dan mengenkripsi data sensitif pengguna dengan sangat cepat.
                </p>
              </div>
            </div>

            {/* Tech 3 */}
            <div className="flex flex-col md:flex-row gap-6 p-8 bg-neutral-900 border border-white/10 rounded-xl hover:border-[#FFCC00]/30 transition-colors shadow-lg">
              <div className="w-16 h-16 shrink-0 bg-white/5 text-white rounded-xl flex items-center justify-center font-black text-xl italic tracking-tighter border border-white/10">
                DB
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2 text-[#FFCC00] uppercase tracking-tight">Database: BaaS Supabase (PostgreSQL JSONB)</h3>
                <p className="text-white/60 leading-relaxed text-lg">
                  Karena setiap formulir memiliki struktur pertanyaan yang berbeda-beda (schema-less), kami menggunakan infrastruktur <strong>Supabase (Backend-as-a-Service)</strong>. Kapabilitas PostgreSQL bawaannya dalam menyimpan, memodifikasi, dan melakukan query pada struktur data <strong>JSONB</strong> adalah solusi terbaik untuk privasi dan skalabilitas tanpa batas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}
