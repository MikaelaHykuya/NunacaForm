import type { Metadata } from 'next';
import Link from 'next/link';
import { Check, MessageCircle, Sparkles, Building2, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Harga & Paket | Nunaca Form Engine',
  description:
    'Paket harga Nunaca Form Engine untuk semua skala bisnis — mulai dari gratis, paket Bisnis, hingga Enterprise. Mulai buat formulir interaktif hari ini.',
};

const PLANS = [
  {
    name: 'Pemula',
    tagline: 'Coba gratis, tanpa kartu kredit',
    price: 'Gratis',
    period: 'selamanya',
    accent: false,
    features: [
      '1 unit bisnis (workspace)',
      '5 formulir aktif',
      '100 respons per bulan',
      'Format jawaban lengkap',
      'Analitik dasar (view & responden)',
      'Dukungan email',
    ],
    cta: 'Mulai Gratis',
    highlight: false,
  },
  {
    name: 'Bisnis',
    tagline: 'Untuk grup & multi lini usaha',
    price: 'Rp 149rb',
    period: 'per bulan',
    accent: true,
    features: [
      '8 unit bisnis (semua lini Nunaca)',
      'Formulir tanpa batas',
      'Respons tanpa batas',
      'Logika bercabang (logic jumps)',
      'Ekspor CSV & sinkron cloud',
      'Link & QR Code form',
      'Prioritas dukungan WhatsApp',
    ],
    cta: 'Pilih Bisnis',
    highlight: true,
  },
  {
    name: 'Enterprise',
    tagline: 'Untuk multi-cabang & kebutuhan khusus',
    price: 'Custom',
    period: 'negosiasi',
    accent: false,
    features: [
      'Multi-cabang & multi-brand',
      'Akun tim (multi-admin)',
      'Integrasi CRM / workflow',
      'Notifikasi lead custom',
      'SLA & onboarding khusus',
      'Opsi self-hosted',
    ],
    cta: 'Hubungi Kami',
    highlight: false,
  },
];

const COMPARISONS = [
  { label: 'Satu pertanyaan per layar', plans: [true, true, true] },
  { label: 'Logic jumps & percabangan', plans: [false, true, true] },
  { label: 'Sinkron cloud & multi-perangkat', plans: [false, true, true] },
  { label: 'Notifikasi lead WhatsApp', plans: [false, false, true] },
  { label: 'Akun tim / multi-admin', plans: [false, false, true] },
  { label: 'Lokalisasi & custom domain', plans: [false, false, true] },
];

const WA_LINK =
  'https://wa.me/6283181013424?text=' +
  encodeURIComponent('Halo Nunaca Group, saya mau bertanya tentang paket Nunaca Form Engine.');

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#050505] font-sans text-white relative overflow-hidden">
      <div className="absolute pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-28">
        {/* Hero */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#FFCC00]/40 bg-[#FFCC00]/5 text-[#FFCC00] text-[10px] font-black uppercase tracking-[0.25em] mb-6">
            <Sparkles size={12} /> Harga Transparan
          </div>
          <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter">
            Pilih Paket <span className="text-[#FFCC00]">Form Engine</span>
          </h1>
          <p className="text-white/50 mt-6 max-w-2xl mx-auto leading-relaxed">
            Dari formulir pertama yang gratis sampai solusi enterprise multi-cabang. Semua paket sudah
            termasuk akses data respons &amp; dashboard analitik.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-3xl border p-8 transition-all duration-300 hover:-translate-y-1.5 ${
                plan.highlight
                  ? 'bg-gradient-to-b from-[#FFCC00]/15 to-[#FFCC00]/5 border-[#FFCC00]/60 shadow-[0_0_60px_rgba(255,204,0,0.15)]'
                  : 'bg-neutral-900 border-white/10 hover:border-white/25'
              }`}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FFCC00] text-black text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full shadow-lg">
                  Paling Populer
                </span>
              )}
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-black uppercase tracking-widest">{plan.name}</h2>
                {plan.accent && <Building2 size={18} className="text-[#FFCC00]" />}
              </div>
              <p className="text-xs text-white/40 mb-6">{plan.tagline}</p>

              <div className="mb-8">
                <span className="text-4xl font-black italic tracking-tighter">{plan.price}</span>
                <span className="text-xs text-white/40 ml-2 uppercase tracking-widest">{plan.period}</span>
              </div>

              <ul className="space-y-3.5 mb-10 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-white/70">
                    <Check size={16} className="text-[#FFCC00] shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href={WA_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  plan.highlight
                    ? 'bg-[#FFCC00] text-black hover:bg-yellow-400 shadow-[0_0_25px_rgba(255,204,0,0.35)]'
                    : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                }`}
              >
                <MessageCircle size={15} /> {plan.cta}
              </a>
            </div>
          ))}
        </div>

        {/* Comparison */}
        <div className="rounded-3xl border border-white/10 bg-neutral-900/60 overflow-hidden mb-20">
          <div className="px-8 py-6 border-b border-white/10">
            <h2 className="text-sm font-black uppercase tracking-[0.25em] text-[#FFCC00]">
              Perbandingan Fitur
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] font-black uppercase tracking-widest text-white/40">
                  <th className="text-left px-8 py-4">Fitur</th>
                  <th className="py-4 text-center">Pemula</th>
                  <th className="py-4 text-center">Bisnis</th>
                  <th className="py-4 text-center">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {COMPARISONS.map((row) => (
                  <tr key={row.label}>
                    <td className="px-8 py-4 text-white/70">{row.label}</td>
                    {row.plans.map((val, i) => (
                      <td key={i} className="py-4 text-center">
                        {val ? (
                          <Check size={16} className="inline text-[#FFCC00]" />
                        ) : (
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-white/15" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-3xl bg-gradient-to-br from-[#FFCC00]/20 via-[#FFCC00]/10 to-transparent border border-[#FFCC00]/40 p-10 md:p-14 text-center">
          <h2 className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter mb-4">
            Bingung pilih paket yang tepat?
          </h2>
          <p className="text-white/50 max-w-xl mx-auto mb-8 leading-relaxed">
            Konsultasi gratis dengan tim Nunaca — kami bantu sesuaikan paket dengan jumlah lini usaha
            dan kebutuhan data Anda.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={WA_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-[#FFCC00] text-black px-8 py-4 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-yellow-400 transition-all shadow-[0_0_30px_rgba(255,204,0,0.3)]"
            >
              <MessageCircle size={18} /> Chat WhatsApp
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center gap-3 border border-white/20 text-white px-8 py-4 rounded-xl text-sm font-black uppercase tracking-widest hover:border-[#FFCC00] hover:text-[#FFCC00] transition-all"
            >
              Halaman Kontak <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}