"use client";

import Link from 'next/link';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import Footer from '@/components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

// --- Komponen FAQ Accordion ---
function FAQItem({ question, answer }: { question: string, answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-white/10 py-4">
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center justify-between w-full text-left font-bold text-lg text-white hover:text-[#FFCC00] transition-colors">
        {question}
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={20} />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <p className="pt-4 text-white/60 leading-relaxed text-lg">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQContent() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] font-sans text-white selection:bg-yellow-500/30 flex flex-col">

      <section className="pt-40 pb-20 px-6 relative flex-grow">
        <div className="max-w-3xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-white/50 hover:text-[#FFCC00] transition-colors mb-8 text-sm font-bold uppercase tracking-widest">
            <ArrowLeft size={16} /> Kembali ke Beranda
          </Link>

          <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="w-12 h-[1px] bg-[#FFCC00]"></span>
              <span className="text-[#FFCC00] font-bold tracking-[0.3em] uppercase text-sm">TANYA JAWAB</span>
              <span className="w-12 h-[1px] bg-[#FFCC00]"></span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 text-white uppercase italic tracking-tighter leading-[1.1]">
              Pertanyaan <br/><span className="text-[#FFCC00]">Umum.</span>
            </h1>
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="space-y-2">
            <FAQItem
              question="Mengapa tidak menggunakan Google Forms saja?"
              answer="Google Forms fungsional, namun desainnya kaku dan sering dianggap membosankan, sehingga tingkat konversinya (penyelesaian form) rendah. Nunaca Form menawarkan pengalaman interaktif bergaya percakapan yang terbukti secara psikologis meningkatkan kemauan responden untuk menyelesaikan survei."
            />
            <FAQItem
              question="Apakah data pelanggan aman?"
              answer="Sangat aman. Berbeda dengan layanan pihak ketiga eksternal, Nunaca Form adalah sistem internal yang dibangun secara custom. Seluruh data yang masuk disimpan dan dikelola langsung di dalam server database milik Nunaca Group."
            />
            <FAQItem
              question="Apakah saya bisa membuat form sendiri tanpa tim IT?"
              answer="Ya! Fase selanjutnya dari sistem ini adalah Dashboard Admin Builder. Anda cukup melakukan 'drag-and-drop' untuk menambahkan pertanyaan dan mengatur urutan tanpa perlu menulis kode sebaris pun."
            />
            <FAQItem
              question="Bisakah dihubungkan ke sistem Nunaca lainnya?"
              answer="Tentu. Karena sistem ini dibangun secara custom (Next.js & Node.js), API-nya dapat dengan mudah disambungkan ke sistem kasir (POS), CRM, atau aplikasi internal Nunaca lainnya."
            />
          </motion.div>
        </div>
      </section>

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}