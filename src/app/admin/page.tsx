'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import {
  ArrowLeft, Eye, MousePointerClick, CheckCircle2, Users,
  Copy, Check, Mail, Trash2, Share2, TrendingUp,
  Download, ChevronLeft, ChevronRight, QrCode, RefreshCw, LogOut
} from 'lucide-react';
import { mockWorkspaces } from '@/data/mockWorkspaces';
import {
  WORKSPACE_LABELS,
  getResponses, getViews, getStarts,
  deleteResponse,
  getNewsletterSubscribers, removeSubscriber, syncFromSupabase, clearResponses
} from '@/lib/storage';
import { supabaseEnabled } from '@/lib/supabase';
import { FormSchema } from '@/types/form';
import { getSession, logout } from '@/lib/auth';
import { useRouter } from 'next/navigation';

const WORKSPACE_IDS = Object.keys(WORKSPACE_LABELS);
const PAGE_SIZE = 10;

function loadSchema(workspace: string): FormSchema {
  const saved = localStorage.getItem(`nbs_form_schema_${workspace}`);
  return saved ? JSON.parse(saved) : mockWorkspaces[workspace] || mockWorkspaces['barbershop'];
}

function StatCard({ icon, label, value, sub, accent }: {
  icon: React.ReactNode; label: string; value: string; sub?: string; accent?: boolean;
}) {
  return (
    <div className={`p-4 sm:p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1 ${accent ? 'bg-[#FFCC00]/10 border-[#FFCC00]/40' : 'bg-neutral-900 border-white/10 hover:border-white/20'}`}>
      <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
        <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 ${accent ? 'bg-[#FFCC00] text-black' : 'bg-white/10 text-[#FFCC00]'}`}>
          {icon}
        </div>
        <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-white/40 leading-tight">{label}</div>
      </div>
      <div className="text-3xl sm:text-4xl font-black uppercase italic tracking-tighter text-white">{value}</div>
      {sub && <div className="text-[10px] sm:text-[11px] text-white/40 mt-1 sm:mt-2 font-bold uppercase tracking-wider">{sub}</div>}
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [activeWorkspace, setActiveWorkspace] = useState('barbershop');
  const [copied, setCopied] = useState<Record<string, boolean>>({});
  const [qrVisible, setQrVisible] = useState(false);
  const [page, setPage] = useState(0);
  const [, bumpVersion] = useState(0);
  const [syncTick, setSyncTick] = useState(0);
  const [lastSync, setLastSync] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    getSession().then((session) => {
      if (!alive) return;
      setAuthChecked(true);
      if (session?.role === 'admin') setIsAuthorized(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (authChecked && !isAuthorized) {
      router.replace('/admin/login?next=/admin');
    }
  }, [authChecked, isAuthorized, router]);

  useEffect(() => {
    let alive = true;
    syncFromSupabase(activeWorkspace).then(() => {
      if (!alive) return;
      setPage(0);
      setQrVisible(false);
      setLastSync(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
      bumpVersion((v) => v + 1);
    });
    return () => {
      alive = false;
    };
  }, [activeWorkspace, syncTick]);

  if (!isAuthorized) {
    return <div className="min-h-screen bg-[#050505] text-[#FFCC00] flex items-center justify-center font-bold tracking-widest uppercase">Checking Authorization...</div>;
  }

  const responses = getResponses(activeWorkspace);
  const views = getViews(activeWorkspace);
  const starts = getStarts(activeWorkspace);
  const schema = loadSchema(activeWorkspace);
  const completionRate = starts > 0 ? Math.round((responses.length / starts) * 100) : 0;
  const env = typeof window !== 'undefined' ? window.location.origin : '';
  const shareUrl = `${env}/form?workspace=${activeWorkspace}`;

  const totalPages = Math.max(1, Math.ceil(responses.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pagedResponses = responses.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  const copyLink = async (workspace: string) => {
    const url = `${env}/form?workspace=${workspace}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied((prev) => ({ ...prev, [workspace]: true }));
      setTimeout(() => setCopied((prev) => ({ ...prev, [workspace]: false })), 2000);
    } catch {
      window.prompt('Salin link ini:', url);
    }
  };

  const handleClearResponses = () => {
    if (!window.confirm('Hapus SEMUA respons untuk lini ini?')) return;
    clearResponses(activeWorkspace);
    bumpVersion((v) => v + 1);
  };

  const exportCsv = () => {
    const hiddenKeys = Array.from(new Set(responses.flatMap((r) => Object.keys(r.hiddenFields))));
    const headers = ['Tanggal', ...schema.questions.map((q) => q.title.replace(/"/g, '""')), ...hiddenKeys.map((k) => `UTM:${k}`.replace(/"/g, '""'))];
    const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows = responses.map((r) => [
      new Date(r.createdAt).toLocaleString('id-ID'),
      ...schema.questions.map((q) => {
        const val = r.answers[q.id];
        const opt = q.options?.find((o) => o.id === val || o.label === val);
        return opt ? opt.label : val || '';
      }),
      ...hiddenKeys.map((k) => r.hiddenFields[k] || ''),
    ].map(esc));
    const csv = [headers.map(esc).join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `respons_${activeWorkspace}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const answerLabel = (qId: string, value: string) => {
    const q = schema?.questions.find((qs) => qs.id === qId);
    const opt = q?.options?.find((o) => o.id === value || o.label === value);
    return opt ? opt.label : value;
  };

  const handleWorkspaceTab = (id: string) => {
    setActiveWorkspace(id);
    setPage(0);
  };

  const subscribers = getNewsletterSubscribers();

  return (
    <div className="min-h-screen bg-[#050505] font-sans text-white relative overflow-x-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-30"></div>
      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-[#FFCC00]/5 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <Link href="/builder" className="inline-flex items-center gap-2 text-white/40 hover:text-[#FFCC00] text-xs font-black uppercase tracking-[0.25em] transition-all hover:-translate-x-1 mb-6">
              <ArrowLeft size={14} /> Admin Builder
            </Link>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-white">Dashboard <span className="text-[#FFCC00]">Analitik</span></h1>
            <p className="text-white/50 mt-3 flex items-center gap-2 text-xs sm:text-sm">
              <TrendingUp size={16} className="text-[#FFCC00] shrink-0" />
              Pantau view, completion rate, dan respons setiap formulir lini usaha.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin/content"
              className="bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-[#FFCC00] transition-all"
            >
              Kelola Konten
            </Link>
            <button
              onClick={() => { void logout().then(() => router.push('/')); }}
              className="bg-white/5 hover:bg-red-500/15 hover:border-red-500/40 border border-white/10 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-white/70 hover:text-red-400 transition-all flex items-center gap-2"
            >
              <LogOut size={15} /> Logout
            </button>
            <Link href="/" className="bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-white/80 transition-all">
              ← Beranda
            </Link>
          </div>
        </div>

        {/* Workspace Tabs */}
        <div className="flex gap-2 flex-wrap mb-8">
          {WORKSPACE_IDS.map((id) => (
            <button
              key={id}
              onClick={() => handleWorkspaceTab(id)}
              className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all border ${activeWorkspace === id
                ? 'bg-[#FFCC00] text-black border-[#FFCC00] shadow-[0_0_20px_rgba(255,204,0,0.3)]'
                : 'bg-neutral-900 border-white/10 text-white/60 hover:text-white hover:border-white/20'}`}
            >
              {WORKSPACE_LABELS[id]}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard icon={<Eye size={20} />} label="Total View" value={String(views)} sub="Pengunjung form" />
          <StatCard icon={<MousePointerClick size={20} />} label="Mulai Mengisi" value={String(starts)} sub="Klik tombol mulai" />
          <StatCard icon={<CheckCircle2 size={20} />} label="Respons Masuk" value={String(responses.length)} sub="Form selesai diisi" accent />
          <StatCard icon={<Users size={20} />} label="Completion Rate" value={`${completionRate}%`} sub="Respons / starts" />
        </div>

        {/* Share + QR */}
        <div className="bg-neutral-900 border border-white/10 rounded-2xl p-4 sm:p-6 mb-10">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-11 h-11 rounded-xl bg-[#FFCC00]/10 border border-[#FFCC00]/30 flex items-center justify-center text-[#FFCC00]">
              <Share2 size={20} />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Bagikan Link Formulir</div>
              <div className="text-xs text-white/40 mt-1 break-all">{shareUrl}</div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => copyLink(activeWorkspace)}
              className={`flex items-center gap-2 px-7 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${copied[activeWorkspace] ? 'bg-emerald-500 text-black' : 'bg-[#FFCC00] text-black hover:bg-yellow-400 shadow-[0_0_20px_rgba(255,204,0,0.3)]'}`}
            >
              {copied[activeWorkspace] ? <><Check size={16} /> Tersalin!</> : <><Copy size={16} /> Salin Link</>}
            </button>
            <button
              onClick={() => setQrVisible((v) => !v)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${qrVisible ? 'bg-emerald-500 border-emerald-500 text-black' : 'bg-white/5 border-white/10 text-white/70 hover:text-white hover:border-white/20'}`}
            >
              <QrCode size={16} /> {qrVisible ? 'Tutup QR' : 'QR Code'}
            </button>
          </div>
          {qrVisible && (
            <div className="mt-6 flex flex-col items-center gap-4 bg-black/40 border border-white/5 rounded-2xl p-4 sm:p-6">
              <QRCodeSVG value={shareUrl} size={200} fgColor="#FFFFFF" bgColor="#0A0A0A" />
              <p className="text-xs text-white/40 text-center max-w-xs">Scan untuk membuka formulir {WORKSPACE_LABELS[activeWorkspace]} di HP responden.</p>
            </div>
          )}
        </div>

        {/* Responses */}
        <div className="bg-neutral-900 border border-white/10 rounded-2xl overflow-hidden mb-10">
          <div className="px-4 sm:px-6 py-5 border-b border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <h2 className="text-xs font-black uppercase tracking-[0.25em] text-[#FFCC00] flex items-center gap-3">
              <CheckCircle2 size={16} /> Respons Tersimpan
            </h2>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
              <button
                onClick={() => setSyncTick((t) => t + 1)}
                className="text-[10px] font-bold uppercase tracking-widest text-white/50 hover:text-[#FFCC00] transition-colors flex items-center gap-1"
                title="Sinkronkan data dengan cloud"
              >
                <RefreshCw size={12} /> Sinkron{lastSync ? ` • ${lastSync}` : ''}
              </button>
              <span className={`text-[10px] font-bold uppercase tracking-widest ${supabaseEnabled ? 'text-emerald-400/80' : 'text-white/30'} flex items-center gap-1`}>
                <span className={`w-1.5 h-1.5 rounded-full ${supabaseEnabled ? 'bg-emerald-400' : 'bg-white/20'}`} />
                {supabaseEnabled ? 'Cloud' : 'Lokal'}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">{responses.length} data</span>
              {responses.length > 0 && (
                <>
                  <button onClick={exportCsv} className="text-[10px] font-bold uppercase tracking-widest text-white/50 hover:text-[#FFCC00] transition-colors flex items-center gap-1">
                    <Download size={12} /> CSV
                  </button>
                  <button onClick={handleClearResponses} className="text-[10px] font-bold uppercase tracking-widest text-red-400/70 hover:text-red-400 transition-colors flex items-center gap-1">
                    <Trash2 size={12} /> Hapus
                  </button>
                </>
              )}
            </div>
          </div>
            <div className="max-h-[420px] overflow-y-auto overflow-x-hidden custom-scrollbar divide-y divide-white/5">
              {responses.length === 0 ? (
                <div className="p-10 text-center">
                  <CheckCircle2 size={32} className="text-white/10 mx-auto mb-3" />
                  <p className="text-xs font-bold uppercase tracking-widest text-white/30">Belum ada respons. Isi formulir lalu kembali ke sini.</p>
                </div>
              ) : pagedResponses.map((r, idx) => (
                <div key={r.id} className="px-4 sm:px-6 py-5 hover:bg-white/5 transition-colors group">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-[#FFCC00]/10 text-[#FFCC00] border border-[#FFCC00]/30 flex items-center justify-center text-xs font-black shrink-0">
                        {safePage * PAGE_SIZE + idx + 1}
                      </div>
                      <span className="text-xs font-bold text-white truncate">{WORKSPACE_LABELS[r.workspace] || r.workspace}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest">
                        {new Date(r.createdAt).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <button
                        onClick={() => { deleteResponse(activeWorkspace, r.id); bumpVersion((v) => v + 1); }}
                        className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition-all"
                        title="Hapus respons ini"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {Object.entries(r.answers).map(([qId, value]) => {
                      const q = schema?.questions.find((qs) => qs.id === qId);
                      return (
                        <div key={qId} className="bg-black/40 border border-white/5 rounded-xl px-4 py-3 min-w-0">
                          <div className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1 truncate">{q?.title || qId}</div>
                          <div className="text-sm font-medium text-white truncate break-words">{answerLabel(qId, value) || '—'}</div>
                        </div>
                      );
                    })}
                    {Object.keys(r.answers).length === 0 && (
                      <div className="text-xs text-white/40">Form selesai tanpa jawaban teks.</div>
                    )}
                  </div>
                  {Object.keys(r.hiddenFields).length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {Object.entries(r.hiddenFields).map(([k, v]) => (
                        <span key={k} className="text-[10px] font-bold bg-white/5 border border-white/10 px-2.5 py-1 rounded-md text-white/50 flex items-center gap-1">
                          <span className="text-[#FFCC00]">{k.toUpperCase()}</span> = {v}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {responses.length > PAGE_SIZE && (
              <div className="px-4 sm:px-6 py-4 border-t border-white/10 flex items-center justify-between">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={safePage === 0}
                  className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-[#FFCC00] transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={14} /> Sebelumnya
                </button>
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                  Halaman {safePage + 1} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={safePage >= totalPages - 1}
                  className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-[#FFCC00] transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                >
                  Berikutnya <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>

        {/* Newsletter subscribers */}
        <div className="bg-neutral-900 border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-4 sm:px-6 py-5 border-b border-white/10 flex items-center justify-between gap-4">
            <h2 className="text-xs font-black uppercase tracking-[0.25em] text-[#FFCC00] flex items-center gap-3">
              <Mail size={16} /> Newsletter Subscriber
            </h2>
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 shrink-0">{subscribers.length} email</span>
          </div>
          <div className="max-h-[300px] overflow-y-auto overflow-x-hidden custom-scrollbar divide-y divide-white/5">
            {subscribers.length === 0 ? (
              <div className="p-10 text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-white/30">Belum ada subscriber.</p>
              </div>
            ) : subscribers.map((s) => (
              <div key={s.email} className="px-4 sm:px-6 py-4 flex items-center justify-between gap-4 hover:bg-white/5 transition-colors group">
                <div className="min-w-0">
                  <div className="text-sm font-bold text-white truncate">{s.email}</div>
                  <div className="text-[10px] text-white/30 uppercase tracking-widest mt-0.5">{new Date(s.createdAt).toLocaleString('id-ID')}</div>
                </div>
                <button
                  onClick={() => { removeSubscriber(s.email); bumpVersion((v) => v + 1); }}
                  className="opacity-0 group-hover:opacity-100 text-[10px] font-bold uppercase tracking-widest text-red-400/70 hover:text-red-400 transition-all flex items-center gap-1 shrink-0"
                >
                  <Trash2 size={12} /> Hapus
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}