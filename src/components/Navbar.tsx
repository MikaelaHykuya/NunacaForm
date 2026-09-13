"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSession, logout } from '@/lib/auth';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [authRole, setAuthRole] = useState<string | null>(null);
  const [authName, setAuthName] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    getSession().then((session) => {
      if (!alive) return;
      setAuthRole(session?.role ?? null);
      setAuthName(session?.name ?? null);
    });
    return () => {
      alive = false;
    };
  }, [pathname]); // re-run when route changes

  const handleLogout = () => {
    void logout().then(() => {
      setAuthRole(null);
      setAuthName(null);
      setIsMobileMenuOpen(false);
      router.push('/');
    });
  };

  // Mencegah scroll saat menu mobile terbuka
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMobileMenuOpen]);

  const navLinks = [
    { name: 'Beranda', path: '/' },
    { name: 'Fitur', path: '/#features' },
    { name: 'Studi Kasus', path: '/usecases' },
    // { name: 'Harga', path: '/pricing' }, // Disembunyikan sementara
    // { name: 'Teknologi', path: '/tech' }, // Dihapus
    { name: 'Tentang', path: '/about' },
    // { name: 'Blog', path: '/blog' }, // Dihapus
    { name: 'FAQ', path: '/faq' },
    { name: 'Kontak', path: '/contact' },
  ];

  // Sembunyikan navbar di area admin & builder (punya navigasi sendiri)
  if (pathname.startsWith('/admin') || pathname === '/builder') {
    return null;
  }

  return (
    <>
      <nav className="fixed top-0 left-0 w-full bg-black/80 backdrop-blur-md z-50 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex flex-col hover:opacity-80 transition-opacity">
            <span className="font-bold text-xl tracking-tight text-[#FFCC00] leading-tight">NUNACA GROUP</span>
            <span className="text-[10px] text-white/50 tracking-widest uppercase">Form</span>
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden lg:flex gap-8 font-medium text-white/70 text-sm items-center">
            {navLinks.filter(l => l.name !== 'Beranda').map((link) => (
              <Link 
                key={link.name} 
                href={link.path} 
                className={`${pathname === link.path ? 'text-[#FFCC00]' : 'hover:text-[#FFCC00]'} transition-colors uppercase tracking-wider text-xs font-bold`}
              >
                {link.name}
              </Link>
            ))}
            
            {authRole ? (
              <div className="flex items-center gap-4 ml-4 pl-4 border-l border-white/10">
                <div className="flex flex-col text-right">
                  <span className="text-white text-xs font-bold leading-none">{authName}</span>
                  <span className="text-[#FFCC00] text-[10px] uppercase tracking-widest">{authRole}</span>
                </div>
                {authRole === 'admin' ? (
                  <>
                    <Link href="/admin" className="bg-white/5 border border-white/10 text-white px-4 py-2 rounded text-xs font-bold hover:bg-white/10 hover:border-[#FFCC00] transition-colors uppercase tracking-widest">
                      Analitik
                    </Link>
                    <Link href="/admin/content" className="bg-white/5 border border-white/10 text-white px-4 py-2 rounded text-xs font-bold hover:bg-white/10 hover:border-[#FFCC00] transition-colors uppercase tracking-widest">
                      Kelola Konten
                    </Link>
                    <Link href="/builder" className="bg-[#FFCC00] text-black px-4 py-2 rounded text-xs font-bold hover:bg-yellow-400 transition-colors uppercase tracking-widest">
                      Admin Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="border border-white/20 text-white hover:text-red-400 hover:border-red-400 px-4 py-2 rounded text-xs font-bold transition-colors uppercase tracking-widest"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={handleLogout}
                    className="border border-white/20 text-white hover:text-red-400 hover:border-red-400 px-4 py-2 rounded text-xs font-bold transition-colors uppercase tracking-widest"
                  >
                    Logout
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-4 ml-4">
                <Link 
                  href="/form" 
                  className="bg-[#FFCC00] text-black px-6 py-2.5 rounded text-sm font-bold hover:bg-yellow-400 transition-colors uppercase tracking-wide"
                >
                  Isi Formulir
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="lg:hidden text-white hover:text-[#FFCC00] transition-colors"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={28} />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[60] bg-[#0A0A0A] flex flex-col"
          >
            <div className="px-6 h-20 flex items-center justify-between border-b border-white/10">
              <div className="flex flex-col">
                <span className="font-bold text-xl tracking-tight text-[#FFCC00] leading-tight">MENU</span>
              </div>
              <button 
                className="text-white hover:text-[#FFCC00] transition-colors p-2 bg-white/5 rounded-full"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="flex flex-col px-8 py-12 gap-8 overflow-y-auto">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + (i * 0.1) }}
                >
                  <Link 
                    href={link.path} 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`text-3xl font-black italic uppercase tracking-tighter ${pathname === link.path ? 'text-[#FFCC00]' : 'text-white hover:text-[#FFCC00]'} transition-colors`}
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + (navLinks.length * 0.1) }}
                className="mt-8 flex flex-col gap-4"
              >
                {authRole ? (
                  <>
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-center mb-4">
                       <span className="text-[#FFCC00] text-[10px] uppercase tracking-widest block mb-1">{authRole}</span>
                       <span className="text-white font-bold text-lg">{authName}</span>
                    </div>
                    {authRole === 'admin' ? (
                      <>
                        <Link 
                          href="/admin" 
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="border border-white/20 text-white px-8 py-4 rounded-xl text-center block font-bold transition-colors uppercase tracking-widest text-lg w-full"
                        >
                          Dashboard Analitik
                        </Link>
                        <Link 
                          href="/admin/content" 
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="border border-white/20 text-white px-8 py-4 rounded-xl text-center block font-bold transition-colors uppercase tracking-widest text-lg w-full"
                        >
                          Kelola Konten
                        </Link>
                        <Link 
                          href="/builder" 
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="bg-[#FFCC00] text-black px-8 py-4 rounded-xl text-center block font-bold hover:bg-yellow-400 transition-colors uppercase tracking-widest text-lg w-full shadow-[0_0_20px_rgba(255,204,0,0.2)]"
                        >
                          Admin Dashboard
                        </Link>
                      </>
                    ) : null}
                    <button 
                      onClick={handleLogout}
                      className="border border-white/20 text-red-400 px-8 py-4 rounded-xl text-center block font-bold transition-colors uppercase tracking-widest text-lg w-full"
                    >
                      Logout Keluar
                    </button>
                  </>
                ) : (
                  <>
                    <Link 
                      href="/form" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="bg-[#FFCC00] text-black px-8 py-4 rounded text-center block font-bold hover:bg-yellow-400 transition-colors uppercase tracking-widest text-lg w-full shadow-[0_0_20px_rgba(255,204,0,0.2)]"
                    >
                      Isi Formulir
                    </Link>
                  </>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
