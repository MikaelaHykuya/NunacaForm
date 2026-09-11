"use client";

import Link from 'next/link';
import { ArrowRight, Sparkles, Zap, Shield, CheckCircle2, Mail, Quote } from 'lucide-react';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { subscribeNewsletter } from '@/lib/storage';

// --- Komponen Newsletter CTA ---
function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'exists' | 'error'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus('error');
      return;
    }
    const ok = subscribeNewsletter(email);
    setStatus(ok ? 'success' : 'exists');
    setEmail('');
  };

  return (
    <section className="py-24 px-6 relative overflow-hidden bg-black border-t border-white/5">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-[#FFCC00]/10 rounded-full blur-[150px] -z-10"></div>
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-3 px-4 py-2 border border-[#FFCC00]/30 rounded-full bg-[#FFCC00]/5 text-[#FFCC00] font-bold text-xs tracking-widest uppercase mb-8">
          <Mail size={14} />
          <span>Newsletter Intern Nunaca</span>
        </div>
        <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-white leading-[1.1] mb-6">
          Semua Formulir, <span className="text-[#FFCC00]">Satu Sistem.</span>
        </h2>
        <p className="text-lg text-white/60 max-w-2xl mx-auto leading-relaxed mb-12">
          Dapatkan notifikasi fitur baru, tips formulir berkonversi tinggi, dan studi kasus dari setiap lini usaha Nunaca Group.
        </p>

        {status === 'success' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-bold px-6 py-4 rounded-xl mb-8 max-w-md mx-auto">
            Berhasil! Email Anda sudah terdaftar di newsletter Nunaca.
          </motion.div>
        )}
        {status === 'exists' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#FFCC00]/10 border border-[#FFCC00]/30 text-[#FFCC00] text-sm font-bold px-6 py-4 rounded-xl mb-8 max-w-md mx-auto">
            Email ini sudah terdaftar sebagai subscriber.
          </motion.div>
        )}
        {status === 'error' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-bold px-6 py-4 rounded-xl mb-8 max-w-md mx-auto">
            Masukkan alamat email yang valid.
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setStatus('idle'); }}
            placeholder="nama@perusahaan.com"
            className="flex-1 bg-neutral-900 border border-white/10 rounded-xl px-6 py-4 text-white font-medium outline-none focus:border-[#FFCC00] focus:ring-1 focus:ring-[#FFCC00] transition-all placeholder:text-white/30"
          />
          <button type="submit" className="bg-[#FFCC00] text-black px-8 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-yellow-400 transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(255,204,0,0.3)]">
            Berlangganan <ArrowRight size={18} />
          </button>
        </form>
        <p className="text-xs text-white/30 mt-6 font-bold uppercase tracking-widest">
          Tanpa spam. <Link href="/unsubscribe" className="hover:text-[#FFCC00] transition-colors underline underline-offset-4">Berhenti berlangganan.</Link>
        </p>
      </div>
    </section>
  );
}

// --- Komponen Mini Form (Embedded Preview) ---
function MiniFormPreview() {
  const [step, setStep] = useState(0);
  const [inputValue, setInputValue] = useState('');

  const questions = [
    { title: "Siapa nama Anda?", placeholder: "Ketik nama..." },
    { title: "Layanan apa yang Anda minati?", placeholder: "Ketik layanan..." },
  ];

  const handleNext = () => {
    if (step <= questions.length) {
      setStep(step + 1);
      setInputValue('');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-neutral-900 border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden text-left h-[300px] flex flex-col justify-center">
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="q0" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col">
            <h3 className="text-2xl font-black text-white mb-2 italic">Selamat Datang</h3>
            <p className="text-white/60 mb-6 text-sm">Coba isi mini form ini untuk melihat transisinya.</p>
            <button onClick={handleNext} className="bg-[#FFCC00] text-black font-bold py-3 px-6 rounded hover:bg-yellow-400 transition-colors self-start shadow-[0_0_15px_rgba(255,204,0,0.3)]">Mulai</button>
          </motion.div>
        )}
        {step > 0 && step <= questions.length && (
          <motion.div key={`q${step}`} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} className="flex flex-col">
            <div className="flex items-center gap-2 text-[#FFCC00] font-bold mb-2 text-sm">
              <span>{step}</span> <ArrowRight size={14} />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">{questions[step-1].title}</h3>
            <input 
              type="text" 
              placeholder={questions[step-1].placeholder}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="bg-transparent border-b border-white/30 focus:border-[#FFCC00] outline-none py-2 text-white text-lg w-full mb-6 transition-colors"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleNext();
              }}
            />
            <button onClick={handleNext} className="bg-[#FFCC00] text-black font-bold py-2 px-6 rounded hover:bg-yellow-400 transition-colors self-start flex items-center gap-2">OK <ArrowRight size={16}/></button>
          </motion.div>
        )}
        {step > questions.length && (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center">
            <CheckCircle2 size={48} className="text-[#FFCC00] mb-4" />
            <h3 className="text-2xl font-black text-white italic">Selesai!</h3>
            <p className="text-white/60 text-sm mt-2">Seperti itulah mulusnya pengalaman Nunaca Form.</p>
            <button onClick={() => setStep(0)} className="mt-6 text-[#FFCC00] text-sm underline underline-offset-4 hover:text-white transition-colors">Ulangi</button>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="absolute top-0 left-0 h-1 bg-[#FFCC00] transition-all duration-500" style={{ width: `${(step / (questions.length + 1)) * 100}%` }}></div>
    </div>
  );
}

// --- Halaman Utama ---
export default function LandingPage() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] font-sans text-white selection:bg-yellow-500/30 overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center min-h-[90vh] relative">
        <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-[#FFCC00]/5 rounded-full blur-[120px] -z-10"></div>
        <div className="absolute bottom-0 left-0 w-[30%] h-[30%] bg-[#FFCC00]/5 rounded-full blur-[100px] -z-10"></div>
        
        <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="flex flex-col items-start text-left">
          <div className="inline-flex items-center gap-3 px-4 py-2 border border-[#FFCC00]/30 rounded-full bg-[#FFCC00]/5 text-[#FFCC00] font-bold text-xs tracking-widest uppercase mb-8">
            <Sparkles size={14} />
            <span>Bukan Sekadar Formulir Biasa</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-8 leading-[1.1] italic text-white">
            Buat formulir yang <br/><span className="text-[#FFCC00]">disukai pengguna.</span>
          </h1>
          <p className="text-lg md:text-xl text-white/60 max-w-lg mb-12 leading-relaxed">
            Nunaca Form dirancang dengan prinsip psikologi interaktif. Dapatkan lebih banyak respons dengan antarmuka yang personal, mulus, dan elegan.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link href="/form" className="flex items-center justify-center gap-3 bg-[#FFCC00] text-black px-8 py-4 rounded text-sm font-bold hover:bg-yellow-400 transition-all shadow-[0_0_30px_rgba(255,204,0,0.3)] hover:shadow-[0_0_40px_rgba(255,204,0,0.5)] tracking-widest uppercase group">
              Isi Formulir 
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="#features" className="flex items-center justify-center bg-transparent text-white border border-white/20 px-8 py-4 rounded text-sm font-bold hover:bg-white/5 transition-colors tracking-widest uppercase">
              Jelajahi Fitur
            </a>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="w-full">
          <MiniFormPreview />
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-black px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp} className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="w-12 h-[1px] bg-[#FFCC00]"></span>
              <span className="text-[#FFCC00] font-bold tracking-[0.3em] uppercase text-sm">FITUR UNGGULAN</span>
              <span className="w-12 h-[1px] bg-[#FFCC00]"></span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-6 text-white uppercase italic tracking-tighter">Fitur Premium Kelas Dunia.</h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">Semua yang Anda butuhkan untuk membuat formulir berkonversi tinggi, dibangun secara custom (internal) tanpa biaya langganan bulanan.</p>
          </motion.div>
          
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: <Sparkles size={28} />, title: "Conversational UI", desc: "Satu pertanyaan per layar (One Question per Screen). Membuat responden fokus layaknya sedang mengobrol." },
              { icon: <Zap size={28} />, title: "Logic Jumps Engine", desc: "Buat jalur dinamis tanpa batas. Tampilkan pertanyaan yang berbeda berdasarkan jawaban sebelumnya." },
              { icon: <Shield size={28} />, title: "Keyboard Shortcuts", desc: "Menjawab dengan cepat tanpa menyentuh mouse. Cukup tekan A, B, C, atau Enter di keyboard." },
              { icon: <Shield size={28} />, title: "Hidden Fields Tracking", desc: "Kumpulkan parameter UTM langsung dari URL tanpa menambah input ekstra bagi responden." },
              { icon: <Sparkles size={28} />, title: "Micro-Animations", desc: "Transisi animasi yang sangat mulus antar pertanyaan. Memberikan pengalaman yang sangat profesional." },
              { icon: <Zap size={28} />, title: "Internal Admin Builder", desc: "Antarmuka pembuat formulir (Drag-and-Drop). Buat formulir kapan saja secara instan." }
            ].map((feature, i) => (
              <motion.div key={i} variants={fadeInUp} className="p-8 rounded-2xl bg-neutral-900 border border-[#FFCC00]/10 hover:border-[#FFCC00]/50 transition-all duration-300 shadow-xl group">
                <div className="w-14 h-14 bg-[#FFCC00]/10 text-[#FFCC00] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold mb-3 text-white uppercase tracking-tight">{feature.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Partner / Business Units Strip */}
      <section className="py-16 px-6 border-t border-white/5 bg-[#0A0A0A]">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-white/40 mb-8">Dipercaya oleh seluruh lini usaha Nunaca Group</p>
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-6">
            {[
              'Barbershop', 'Beauty Bar', 'Kids Spa', 'Coffee & Pastry',
              'Agency', 'Skincare', 'Travel', 'Butik'
            ].map((name) => (
              <span key={name} className="text-white/30 hover:text-[#FFCC00] text-lg font-black uppercase italic tracking-widest transition-colors cursor-default">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-black px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp} className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="w-12 h-[1px] bg-[#FFCC00]"></span>
              <span className="text-[#FFCC00] font-bold tracking-[0.3em] uppercase text-sm">APA KATA MEREKA</span>
              <span className="w-12 h-[1px] bg-[#FFCC00]"></span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-6 text-white uppercase italic tracking-tighter">Disukai Tim & Pelanggan.</h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">Tim operasional di berbagai unit bisnis Nunaca merasakan langsung bedanya formulir yang nyaman diisi.</p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: 'Response rate survei kepuasan Beauty Bar naik drastis. Pelanggan malah bilang form-nya \'keren\' dan bukan beban.',
                name: 'Karin Prameswari',
                role: 'Head of Beauty Bar',
                initials: 'KP'
              },
              {
                quote: 'Pendaftaran Kids Spa tidak lagi manual. Data pelanggan langsung masuk tersusun rapi tanpa pusing baca PDF.',
                name: 'Dimas Saputra',
                role: 'Operational Manager',
                initials: 'DS'
              },
              {
                quote: 'Logic jump-nya kami pakai untuk rekomendasi skincare otomatis. Praktis, elegan, dan hasilnya konsisten.',
                name: 'Rina Maharani',
                role: 'Nunaca Skincare Consultant',
                initials: 'RM'
              }
            ].map((t, i) => (
              <motion.div key={i} variants={fadeInUp} className="p-8 rounded-2xl bg-neutral-900 border border-white/10 hover:border-[#FFCC00]/30 transition-all duration-300 shadow-xl flex flex-col">
                <Quote size={28} className="text-[#FFCC00] mb-6 opacity-60" />
                <p className="text-white/70 leading-relaxed mb-8 flex-1">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-4 pt-6 border-t border-white/10">
                  <div className="w-11 h-11 rounded-full bg-[#FFCC00]/10 text-[#FFCC00] border border-[#FFCC00]/30 flex items-center justify-center font-black text-sm">
                    {t.initials}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{t.name}</div>
                    <div className="text-[10px] uppercase tracking-widest text-white/40 font-bold mt-0.5">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <NewsletterSection />

      <Footer />
    </div>
  );
}
