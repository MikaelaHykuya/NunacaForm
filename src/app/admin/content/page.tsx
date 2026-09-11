'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, FileText, Layout, Plus, Trash2, Save, Loader2,
  Check, RefreshCw, Newspaper, Settings2, LogOut,
} from 'lucide-react';
import { getSession, logout } from '@/lib/auth';
import {
  supabase, pullBlogPosts, pushBlogPost, deleteBlogPostRemote,
  pullUseCases, pushUseCase, deleteUseCaseRemote,
  BlogPostRow, UseCaseRow,
} from '@/lib/supabase';

const ICON_OPTIONS = [
  'Scissors', 'Sparkles', 'Baby', 'Coffee', 'Briefcase',
  'Droplets', 'Plane', 'Shirt', 'Heart', 'MessageCircle',
  'ShoppingBag', 'Star', 'Truck',
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function newPost(): BlogPostRow {
  return {
    slug: '',
    title: '',
    category: 'Blog',
    author: '',
    author_role: '',
    date: new Date().toISOString().slice(0, 10),
    read_time: '3 menit',
    excerpt: '',
    content: [],
  };
}

function newUseCase(): UseCaseRow {
  return {
    id: '',
    title: '',
    subtitle: '',
    description: '',
    icon: 'Sparkles',
    sort_order: 0,
  };
}

const inputCls =
  'w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-[#FFCC00] transition-all placeholder:text-white/25';
const labelCls = 'block text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-2';

export default function AdminContentPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<'blog' | 'usecase'>('blog');

  const [posts, setPosts] = useState<BlogPostRow[]>([]);
  const [useCases, setUseCases] = useState<UseCaseRow[]>([]);
  const [formPost, setFormPost] = useState<BlogPostRow | null>(null);
  const [formUse, setFormUse] = useState<UseCaseRow | null>(null);
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState('');

  const notify = (msg: string) => {
    setFlash(msg);
    setTimeout(() => setFlash(''), 2500);
  };

  const load = async () => {
    if (!supabase) return;
    const [p, u] = await Promise.all([pullBlogPosts(), pullUseCases()]);
    setPosts(p);
    setUseCases(u);
  };

  useEffect(() => {
    let alive = true;
    getSession().then((session) => {
      if (!alive) return;
      if (session?.role !== 'admin') {
        router.replace('/admin/login?next=/admin/content');
        return;
      }
      setReady(true);
      void load();
    });
    return () => {
      alive = false;
    };
  }, [router]);

  const slugPreview = useMemo(() => {
    if (!formPost) return '';
    return formPost.slug || slugify(formPost.title) || '—';
  }, [formPost]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#050505] text-[#FFCC00] flex items-center justify-center font-bold tracking-widest uppercase">
        Checking Authorization...
      </div>
    );
  }

  const savePost = async () => {
    if (!formPost) return;
    if (!formPost.title.trim()) return notify('Judul artikel wajib diisi.');
    const slug = slugify(formPost.title);
    setBusy(true);
    const ok = await pushBlogPost({
      ...formPost,
      slug,
      author: formPost.author.trim() || 'Nunaca IT Team',
      content: formPost.content.filter((p) => p.trim()),
    });
    setBusy(false);
    if (ok) {
      notify(`Artikel "${slug}" disimpan.`);
      setFormPost(null);
      void load();
    } else {
      notify('Gagal menyimpan — periksa sesi admin.');
    }
  };

  const deletePost = async (slug: string) => {
    if (!window.confirm(`Hapus artikel "${slug}"?`)) return;
    setBusy(true);
    const ok = await deleteBlogPostRemote(slug);
    setBusy(false);
    if (ok) {
      notify('Artikel dihapus.');
      if (formPost?.slug === slug) setFormPost(null);
      void load();
    } else {
      notify('Gagal menghapus.');
    }
  };

  const saveUseCase = async () => {
    if (!formUse) return;
    if (!formUse.title.trim()) return notify('Judul studi kasus wajib diisi.');
    setBusy(true);
    const ok = await pushUseCase({
      ...formUse,
      id: formUse.id || slugify(formUse.title),
    });
    setBusy(false);
    if (ok) {
      notify('Studi kasus disimpan.');
      setFormUse(null);
      void load();
    } else {
      notify('Gagal menyimpan — periksa sesi admin.');
    }
  };

  const deleteUseCase = async (id: string) => {
    if (!window.confirm(`Hapus studi kasus "${id}"?`)) return;
    setBusy(true);
    const ok = await deleteUseCaseRemote(id);
    setBusy(false);
    if (ok) {
      notify('Studi kasus dihapus.');
      if (formUse?.id === id) setFormUse(null);
      void load();
    } else {
      notify('Gagal menghapus.');
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] font-sans text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-[#FFCC00]/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <Link href="/admin" className="inline-flex items-center gap-2 text-white/40 hover:text-[#FFCC00] text-xs font-black uppercase tracking-[0.25em] transition-all hover:-translate-x-1 mb-6">
              <ArrowLeft size={14} /> Dashboard Analitik
            </Link>
            <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter">Kelola <span className="text-[#FFCC00]">Konten</span></h1>
            <p className="text-white/50 mt-3 text-sm flex items-center gap-2">
              <Settings2 size={16} className="text-[#FFCC00]" />
              Buat dan ubah artikel blog serta studi kasus — langsung tayang di situs publik.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => { void logout().then(() => router.push('/')); }}
              className="inline-flex items-center gap-2 bg-white/5 hover:bg-red-500/15 border border-white/10 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-white/70 hover:text-red-400 transition-all"
            >
              <LogOut size={15} /> Logout
            </button>
            <button
              onClick={() => { void load(); notify('Daftar disegarkan.'); }}
              className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-white/80 transition-all"
            >
              <RefreshCw size={15} /> Segarkan
            </button>
          </div>
        </div>

        {flash && (
          <div className="mb-6 flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 text-xs font-bold px-4 py-3 rounded-xl tracking-wide">
            <Check size={14} /> {flash}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setTab('blog')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${
              tab === 'blog'
                ? 'bg-[#FFCC00] text-black border-[#FFCC00] shadow-[0_0_20px_rgba(255,204,0,0.3)]'
                : 'bg-neutral-900 border-white/10 text-white/60 hover:text-white hover:border-white/20'
            }`}
          >
            <Newspaper size={15} /> Blog & Artikel ({posts.length})
          </button>
          <button
            onClick={() => setTab('usecase')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${
              tab === 'usecase'
                ? 'bg-[#FFCC00] text-black border-[#FFCC00] shadow-[0_0_20px_rgba(255,204,0,0.3)]'
                : 'bg-neutral-900 border-white/10 text-white/60 hover:text-white hover:border-white/20'
            }`}
          >
            <Layout size={15} /> Studi Kasus ({useCases.length})
          </button>
        </div>

        {tab === 'blog' ? (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* List */}
            <div className="bg-neutral-900 border border-white/10 rounded-2xl overflow-hidden h-[calc(100vh-320px)] min-h-[400px] flex flex-col">
              <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
                <h2 className="text-xs font-black uppercase tracking-[0.25em] text-[#FFCC00] flex items-center gap-3">
                  <Newspaper size={16} /> Daftar Artikel
                </h2>
                <button
                  onClick={() => setFormPost(newPost())}
                  className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-black bg-[#FFCC00] hover:bg-yellow-400 px-3.5 py-2 rounded-lg transition-all"
                >
                  <Plus size={13} /> Artikel Baru
                </button>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-white/5">
                {posts.length === 0 ? (
                  <p className="p-8 text-xs font-bold uppercase tracking-widest text-white/30 text-center">
                    Belum ada artikel.
                  </p>
                ) : (
                  posts.map((p) => (
                    <div key={p.slug} className="px-6 py-4 flex items-center gap-4 hover:bg-white/5 transition-colors">
                      <div className="w-9 h-9 rounded-lg bg-[#FFCC00]/10 border border-[#FFCC00]/30 flex items-center justify-center text-[#FFCC00] shrink-0">
                        <FileText size={15} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-bold text-white">{p.title}</div>
                        <div className="text-[10px] text-white/40 uppercase tracking-widest mt-1">
                          {p.category} • {p.date || 'tanpa tanggal'}
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => { setFormPost({ ...p, content: Array.isArray(p.content) ? p.content : [] }); }}
                          className="p-2 bg-white/5 hover:bg-[#FFCC00]/15 hover:text-[#FFCC00] rounded-lg text-white/50 transition-colors"
                          title="Edit"
                        >
                          <Settings2 size={15} />
                        </button>
                        <button
                          onClick={() => deletePost(p.slug)}
                          disabled={busy}
                          className="p-2 bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded-lg text-white/50 transition-colors disabled:opacity-40"
                          title="Hapus"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Editor */}
            <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 lg:h-[calc(100vh-320px)] lg:min-h-[400px] overflow-y-auto custom-scrollbar">
              {!formPost ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-white/25 py-16">
                  <Newspaper size={40} className="mb-4" />
                  <p className="text-xs font-bold uppercase tracking-widest max-w-xs leading-relaxed">
                    Pilih artikel dari daftar untuk mengedit, atau klik &quot;Artikel Baru&quot;.
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-[0.25em] text-[#FFCC00]">
                      {formPost.slug ? `Edit: ${formPost.slug}` : 'Artikel Baru'}
                    </h3>
                    <button onClick={() => setFormPost(null)} className="text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white">
                      Batal
                    </button>
                  </div>

                  <div>
                    <label className={labelCls}>Judul Artikel</label>
                    <input
                      type="text"
                      value={formPost.title}
                      onChange={(e) => setFormPost({ ...formPost, title: e.target.value, slug: '' })}
                      className={inputCls}
                      placeholder="Contoh: Cara Meningkatkan Response Rate"
                    />
                    <div className="text-[10px] text-white/30 mt-1.5">
                      Slug URL: <span className="text-[#FFCC00] font-bold">/blog/{slugPreview}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Kategori</label>
                      <input
                        type="text"
                        value={formPost.category}
                        onChange={(e) => setFormPost({ ...formPost, category: e.target.value })}
                        className={inputCls}
                        placeholder="Blog / Fitur / Studi Kasus"
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Tanggal</label>
                      <input
                        type="date"
                        value={formPost.date}
                        onChange={(e) => setFormPost({ ...formPost, date: e.target.value })}
                        className={inputCls}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Penulis</label>
                      <input
                        type="text"
                        value={formPost.author}
                        onChange={(e) => setFormPost({ ...formPost, author: e.target.value })}
                        className={inputCls}
                        placeholder="Nama penulis"
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Jabatan</label>
                      <input
                        type="text"
                        value={formPost.author_role}
                        onChange={(e) => setFormPost({ ...formPost, author_role: e.target.value })}
                        className={inputCls}
                        placeholder="Head of Barbershop"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Waktu Baca</label>
                      <input
                        type="text"
                        value={formPost.read_time}
                        onChange={(e) => setFormPost({ ...formPost, read_time: e.target.value })}
                        className={inputCls}
                        placeholder="3 menit"
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Ringkasan</label>
                      <input
                        type="text"
                        value={formPost.excerpt}
                        onChange={(e) => setFormPost({ ...formPost, excerpt: e.target.value })}
                        className={inputCls}
                        placeholder="Satu kalimat ringkas..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>Isi Artikel (satu paragraf per baris)</label>
                    <textarea
                      value={formPost.content.join('\n')}
                      onChange={(e) => setFormPost({ ...formPost, content: e.target.value.split('\n') })}
                      rows={10}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white outline-none focus:border-[#FFCC00] transition-all resize-y placeholder:text-white/25"
                      placeholder={'Paragraf pertama...\n\nParagraf kedua...'}
                    />
                  </div>

                  <button
                    onClick={savePost}
                    disabled={busy}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-xs font-black uppercase tracking-widest bg-[#FFCC00] text-black hover:bg-yellow-400 transition-all shadow-[0_0_25px_rgba(255,204,0,0.25)] disabled:opacity-50"
                  >
                    {busy ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Simpan Artikel
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* List */}
            <div className="bg-neutral-900 border border-white/10 rounded-2xl overflow-hidden h-[calc(100vh-320px)] min-h-[400px] flex flex-col">
              <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
                <h2 className="text-xs font-black uppercase tracking-[0.25em] text-[#FFCC00] flex items-center gap-3">
                  <Layout size={16} /> Daftar Studi Kasus
                </h2>
                <button
                  onClick={() => setFormUse(newUseCase())}
                  className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-black bg-[#FFCC00] hover:bg-yellow-400 px-3.5 py-2 rounded-lg transition-all"
                >
                  <Plus size={13} /> Studi Kasus Baru
                </button>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-white/5">
                {useCases.length === 0 ? (
                  <p className="p-8 text-xs font-bold uppercase tracking-widest text-white/30 text-center">
                    Belum ada studi kasus.
                  </p>
                ) : (
                  useCases.map((u) => (
                    <div key={u.id} className="px-6 py-4 flex items-center gap-4 hover:bg-white/5 transition-colors">
                      <div className="w-9 h-9 rounded-lg bg-[#FFCC00]/10 border border-[#FFCC00]/30 flex items-center justify-center text-[#FFCC00] shrink-0">
                        <Layout size={15} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-bold text-white">{u.title}</div>
                        <div className="text-[10px] text-white/40 uppercase tracking-widest mt-1">
                          {u.subtitle || 'tanpa subjudul'} • urutan {u.sort_order}
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => setFormUse({ ...u })}
                          className="p-2 bg-white/5 hover:bg-[#FFCC00]/15 hover:text-[#FFCC00] rounded-lg text-white/50 transition-colors"
                          title="Edit"
                        >
                          <Settings2 size={15} />
                        </button>
                        <button
                          onClick={() => deleteUseCase(u.id)}
                          disabled={busy}
                          className="p-2 bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded-lg text-white/50 transition-colors disabled:opacity-40"
                          title="Hapus"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Editor */}
            <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 lg:h-[calc(100vh-320px)] lg:min-h-[400px] overflow-y-auto custom-scrollbar">
              {!formUse ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-white/25 py-16">
                  <Layout size={40} className="mb-4" />
                  <p className="text-xs font-bold uppercase tracking-widest max-w-xs leading-relaxed">
                    Pilih studi kasus untuk mengedit, atau klik &quot;Studi Kasus Baru&quot;.
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-[0.25em] text-[#FFCC00]">
                      {formUse.id ? `Edit: ${formUse.id}` : 'Studi Kasus Baru'}
                    </h3>
                    <button onClick={() => setFormUse(null)} className="text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white">
                      Batal
                    </button>
                  </div>

                  <div>
                    <label className={labelCls}>Nama Unit / Judul</label>
                    <input
                      type="text"
                      value={formUse.title}
                      onChange={(e) => setFormUse({ ...formUse, title: e.target.value, id: formUse.id || '' })}
                      className={inputCls}
                      placeholder="Contoh: Nunaca Barbershop"
                    />
                  </div>

                  <div>
                    <label className={labelCls}>Subjudul</label>
                    <input
                      type="text"
                      value={formUse.subtitle}
                      onChange={(e) => setFormUse({ ...formUse, subtitle: e.target.value })}
                      className={inputCls}
                      placeholder="Contoh: Reservasi Jadwal & Stylist"
                    />
                  </div>

                  <div>
                    <label className={labelCls}>Deskripsi</label>
                    <textarea
                      value={formUse.description}
                      onChange={(e) => setFormUse({ ...formUse, description: e.target.value })}
                      rows={5}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white outline-none focus:border-[#FFCC00] transition-all resize-y placeholder:text-white/25"
                      placeholder="Cerita singkat studi kasus ini..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Ikon</label>
                      <select
                        value={formUse.icon}
                        onChange={(e) => setFormUse({ ...formUse, icon: e.target.value })}
                        className={inputCls}
                      >
                        {ICON_OPTIONS.map((ic) => (
                          <option key={ic} value={ic} className="bg-neutral-900">{ic}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Urutan Tampil</label>
                      <input
                        type="number"
                        value={formUse.sort_order}
                        onChange={(e) => setFormUse({ ...formUse, sort_order: Number(e.target.value) || 0 })}
                        className={inputCls}
                      />
                    </div>
                  </div>

                  <button
                    onClick={saveUseCase}
                    disabled={busy}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-xs font-black uppercase tracking-widest bg-[#FFCC00] text-black hover:bg-yellow-400 transition-all shadow-[0_0_25px_rgba(255,204,0,0.25)] disabled:opacity-50"
                  >
                    {busy ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Simpan Studi Kasus
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}