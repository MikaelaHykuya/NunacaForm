import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, CalendarClock, Clock } from 'lucide-react';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { getAllPosts } from '@/lib/cms';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Blog & Studi Kasus | Nunaca Form',
  description:
    'Wawasan, studi kasus, dan best practice seputar formulir interaktif, logic jumps, analitik respons, dan UTM tracking dari Nunaca Group Indonesia.',
  alternates: { canonical: '/blog' },
};

export default async function BlogPage() {
  const posts = await getAllPosts();

  return (
    <div className="min-h-screen bg-[#0A0A0A] font-sans text-white selection:bg-[#FFCC00]/30 flex flex-col">
      <Navbar />

      <section className="pt-40 pb-20 px-6 relative flex-grow">
        <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-[#FFCC00]/5 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
        <div className="max-w-6xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-white/50 hover:text-[#FFCC00] transition-colors mb-8 text-sm font-bold uppercase tracking-widest">
            <ArrowLeft size={16} /> Kembali ke Beranda
          </Link>

          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="w-12 h-[1px] bg-[#FFCC00]"></span>
              <span className="text-[#FFCC00] font-bold tracking-[0.3em] uppercase text-sm">BLOG & STUDI KASUS</span>
              <span className="w-12 h-[1px] bg-[#FFCC00]"></span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black mb-6 text-white uppercase italic tracking-tighter leading-[1.1]">
              Belajar dari <span className="text-[#FFCC00]">Pengalaman Nyata.</span>
            </h1>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Studi kasus dan best practice dari setiap lini usaha Nunaca Group dalam memanfaatkan formulir interaktif.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group bg-neutral-900 border border-white/10 rounded-3xl p-8 hover:border-[#FFCC00]/40 hover:-translate-y-1 transition-all duration-300 shadow-xl flex flex-col"
              >
                <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-white/40 mb-5">
                  <span className="bg-[#FFCC00]/10 text-[#FFCC00] border border-[#FFCC00]/30 px-3 py-1 rounded-full">{post.category}</span>
                  <span className="flex items-center gap-1"><Clock size={12} /> {post.readTime}</span>
                </div>
                <h2 className="text-2xl font-black uppercase italic tracking-tighter leading-tight text-white group-hover:text-[#FFCC00] transition-colors mb-4">
                  {post.title}
                </h2>
                <p className="text-white/50 leading-relaxed text-sm mb-6 flex-1">{post.excerpt}</p>
                <div className="flex items-center justify-between pt-6 border-t border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#FFCC00] font-black text-xs">
                      {post.author.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{post.author}</div>
                      <div className="text-[10px] text-white/40 uppercase tracking-widest mt-0.5">{post.authorRole}</div>
                    </div>
                  </div>
                  <div className="text-[10px] text-white/30 font-bold uppercase tracking-widest flex items-center gap-1">
                    <CalendarClock size={12} />
                    {new Date(post.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                </div>
                <div className="mt-6 inline-flex items-center gap-2 text-[#FFCC00] text-xs font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                  Baca Selengkapnya <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}