import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, CalendarClock, Clock } from 'lucide-react';
import Footer from '@/components/Footer';

import { getAllPosts, getPostBySlug } from '@/lib/cms';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  return {
    title: `${post.title} | Nunaca Form`,
    description: post.excerpt,
    authors: [{ name: post.author }],
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.excerpt,
      publishedTime: post.date,
      authors: [post.author],
    },
    alternates: { canonical: `/blog/${post.slug}` },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const allPosts = await getAllPosts();
  const index = allPosts.findIndex((p) => p.slug === slug);
  const prev = index > 0 ? allPosts[index - 1] : null;
  const next = index >= 0 && index < allPosts.length - 1 ? allPosts[index + 1] : null;

  return (
    <div className="min-h-screen bg-[#0A0A0A] font-sans text-white selection:bg-[#FFCC00]/30 flex flex-col">

      <article className="pt-40 pb-20 px-6 relative flex-grow">
        <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-[#FFCC00]/5 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
        <div className="max-w-3xl mx-auto">
          <Link href="/blog" className="inline-flex items-center gap-2 text-white/50 hover:text-[#FFCC00] transition-colors mb-8 text-sm font-bold uppercase tracking-widest">
            <ArrowLeft size={16} /> Semua Artikel
          </Link>

          <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-white/40 mb-6">
            <span className="bg-[#FFCC00]/10 text-[#FFCC00] border border-[#FFCC00]/30 px-3 py-1.5 rounded-full">{post.category}</span>
            <span className="flex items-center gap-1.5"><CalendarClock size={12} /> {new Date(post.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
            <span className="flex items-center gap-1.5"><Clock size={12} /> {post.readTime}</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-[1.1] text-white mb-8">
            {post.title}
          </h1>

          <div className="flex items-center gap-4 pb-10 mb-10 border-b border-white/10">
            <div className="w-12 h-12 rounded-full bg-[#FFCC00]/10 text-[#FFCC00] border border-[#FFCC00]/30 flex items-center justify-center font-black text-sm">
              {post.author.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="text-sm font-bold text-white">{post.author}</div>
              <div className="text-[11px] text-white/40 uppercase tracking-widest mt-0.5">{post.authorRole}</div>
            </div>
          </div>

          <div className="space-y-7">
            {post.content.map((paragraph, i) => (
              <p key={i} className={`leading-relaxed text-lg ${i === 0 ? 'text-white/90 text-xl' : 'text-white/65'}`}>
                {paragraph}
              </p>
            ))}
          </div>

          <Link
            href="/form"
            className="mt-14 inline-flex items-center gap-3 bg-[#FFCC00] text-black px-8 py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-yellow-400 transition-all shadow-[0_0_30px_rgba(255,204,0,0.3)]"
          >
            Coba Formulirnya Sekarang
          </Link>

          <div className="grid sm:grid-cols-2 gap-4 mt-16 pt-8 border-t border-white/10">
            {prev && (
              <Link href={`/blog/${prev.slug}`} className="group bg-neutral-900 border border-white/10 rounded-2xl p-6 hover:border-[#FFCC00]/40 transition-all">
                <div className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-2">← Artikel Sebelumnya</div>
                <div className="text-sm font-bold text-white group-hover:text-[#FFCC00] transition-colors leading-snug">{prev.title}</div>
              </Link>
            )}
            {next && (
              <Link href={`/blog/${next.slug}`} className="group bg-neutral-900 border border-white/10 rounded-2xl p-6 hover:border-[#FFCC00]/40 transition-all text-right sm:col-start-2">
                <div className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-2">Artikel Selanjutnya →</div>
                <div className="text-sm font-bold text-white group-hover:text-[#FFCC00] transition-colors leading-snug">{next.title}</div>
              </Link>
            )}
          </div>
        </div>
      </article>

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}