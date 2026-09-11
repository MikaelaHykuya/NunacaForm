import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Mail, MessageCircle, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Kontak | Nunaca Group Indonesia',
  description:
    'Hubungi Nunaca Group Indonesia — WhatsApp, email, dan alamat kantor di Bandung. Kami siap membantu pertanyaan Anda.',
};

const CONTACTS = [
  {
    icon: <MessageCircle size={22} />,
    title: 'WhatsApp',
    value: '+62 831 8101 3424',
    href: 'https://wa.me/6283181013424',
    note: 'Respon cepat jam kerja (08.00–20.00 WIB)',
  },
  {
    icon: <Mail size={22} />,
    title: 'Email',
    value: 'business@nunacagroupindonesia.com',
    href: 'mailto:business@nunacagroupindonesia.com',
    note: 'Untuk kerja sama bisnis & media',
  },
  {
    icon: <MapPin size={22} />,
    title: 'Kantor 1',
    value: 'Jl. Siliwangi No. 88, Baleendah, Kabupaten Bandung, Jawa Barat',
    href: 'https://www.google.com/maps/search/?api=1&query=Jl.+Siliwangi+No.88+Baleendah+Bandung',
    note: 'Kantor utama',
  },
  {
    icon: <MapPin size={22} />,
    title: 'Kantor 2',
    value:
      'Cluster La Plaza Shophouse, Jl. Podomoro Park, Jl. Bumi Arga Blok N No. N1, Lengkong, Kec. Bojongsoang, Kab. Bandung, Jawa Barat',
    href: 'https://www.google.com/maps/search/?api=1&query=Cluster+La+Plaza+Bojongsoang+Bandung',
    note: 'Cabang & showroom',
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#050505] font-sans text-white relative overflow-hidden">
      <div className="pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-28">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter mb-6">
            Hubungi <span className="text-[#FFCC00]">Nunaca</span>
          </h1>
          <p className="text-white/50 max-w-2xl mx-auto leading-relaxed">
            Ada pertanyaan soal formulir, layanan, atau kerja sama bisnis? Tim kami siap membantu.
          </p>
        </div>

        {/* Contact cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {CONTACTS.map((c) => (
            <a
              key={c.title}
              href={c.href}
              target={c.href.startsWith('http') ? '_blank' : undefined}
              rel={c.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="group flex items-start gap-5 rounded-3xl border border-white/10 bg-neutral-900 p-8 transition-all duration-300 hover:-translate-y-1 hover:border-[#FFCC00]/50 hover:bg-neutral-900/80"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#FFCC00]/10 border border-[#FFCC00]/30 flex items-center justify-center text-[#FFCC00] shrink-0 group-hover:bg-[#FFCC00] group-hover:text-black transition-all">
                {c.icon}
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40 mb-1.5">
                  {c.title}
                </div>
                <div className="text-base font-bold text-white leading-snug break-words">{c.value}</div>
                {c.note && <div className="text-xs text-white/40 mt-2">{c.note}</div>}
              </div>
              <ArrowRight
                size={18}
                className="text-white/20 group-hover:text-[#FFCC00] group-hover:translate-x-1 transition-all ml-auto shrink-0 mt-2"
              />
            </a>
          ))}
        </div>

        {/* Form / CTA */}
        <div className="rounded-3xl border border-[#FFCC00]/40 bg-gradient-to-br from-[#FFCC00]/15 to-transparent p-10 md:p-14 text-center">
          <h2 className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter mb-4">
            Sudah siap mencoba <span className="text-[#FFCC00]">Form Engine</span>?
          </h2>
          <p className="text-white/50 max-w-xl mx-auto mb-8 leading-relaxed">
            Mulai gratis sekarang, atau lihat paket yang sesuai dengan kebutuhan lini usaha Anda.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-3 bg-[#FFCC00] text-black px-8 py-4 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-yellow-400 transition-all shadow-[0_0_30px_rgba(255,204,0,0.3)]"
            >
              Lihat Harga <ArrowRight size={16} />
            </Link>
            <Link
              href="/form"
              className="inline-flex items-center gap-3 border border-white/20 text-white px-8 py-4 rounded-xl text-sm font-black uppercase tracking-widest hover:border-[#FFCC00] hover:text-[#FFCC00] transition-all"
            >
              Isi Formulir
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}