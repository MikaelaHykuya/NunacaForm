import { MapPin, Phone, Mail, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#111111] text-white/70 py-16 px-6 border-t border-[#FFCC00]/20">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        
        {/* Column 1: About */}
        <div className="space-y-6">
          <div>
            <h2 className="text-[#FFCC00] font-bold text-lg leading-tight">NUNACA GROUP INDONESIA</h2>
            <p className="text-white font-medium text-sm">MULTI BUSINESS GROUP</p>
            <p className="text-white font-medium text-sm">BANDUNG INDONESIA</p>
          </div>
          <p className="text-sm leading-relaxed max-w-sm">
            Nunaca Group Indonesia is a multi business group based in Bandung, Indonesia. Our main objective is to establish and manage various business units to provide excellent services and products to our valued customers.
          </p>
          
          <div className="flex gap-4">
            <a href="https://www.instagram.com/nunacagroup/" target="_blank" rel="noopener noreferrer" aria-label="Instagram Nunaca Group" className="w-10 h-10 rounded-full border border-[#FFCC00]/50 flex items-center justify-center text-[#FFCC00] hover:bg-[#FFCC00] hover:text-black transition-colors">
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
            <a href="https://wa.me/6283181013424" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp Nunaca Group" className="w-10 h-10 rounded-full border border-[#FFCC00]/50 flex items-center justify-center text-[#FFCC00] hover:bg-[#FFCC00] hover:text-black transition-colors">
              <MessageCircle size={18} />
            </a>
            <a href="https://www.tiktok.com/@nunaca.group" target="_blank" rel="noopener noreferrer" aria-label="TikTok Nunaca Group" className="w-10 h-10 rounded-full border border-[#FFCC00]/50 flex items-center justify-center text-[#FFCC00] hover:bg-[#FFCC00] hover:text-black transition-colors">
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
              </svg>
            </a>
          </div>
        </div>

        {/* Column 2: Our Units */}
        <div>
          <h3 className="text-[#FFCC00] font-bold text-lg mb-4">OUR UNITS</h3>
          <div className="w-10 h-0.5 bg-[#FFCC00]/50 mb-6"></div>
          <ul className="space-y-4 text-sm">
            <li className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FFCC00]"></span>
              <a href="https://nunacagroupindonesia.com/nunaca-beauty-bar" target="_blank" rel="noopener noreferrer" className="hover:text-[#FFCC00] transition-colors">Nunaca Beauty Bar</a>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FFCC00]"></span>
              <a href="https://nunacagroupindonesia.com/nunaca-barbershop" target="_blank" rel="noopener noreferrer" className="hover:text-[#FFCC00] transition-colors">Nunaca Barbershop</a>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FFCC00]"></span>
              <a href="https://nunacagroupindonesia.com/nunaca-baby-kids-spa" target="_blank" rel="noopener noreferrer" className="hover:text-[#FFCC00] transition-colors">Nunaca Baby & Kids Spa</a>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FFCC00]"></span>
              <a href="https://nunacagroupindonesia.com/nunaca-coffee-pastry" target="_blank" rel="noopener noreferrer" className="hover:text-[#FFCC00] transition-colors">Nunaca Coffee and Pastry</a>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FFCC00]"></span>
              <a href="https://nunacagroupindonesia.com/nunaca-agency" target="_blank" rel="noopener noreferrer" className="hover:text-[#FFCC00] transition-colors">Nunaca Agency</a>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FFCC00]"></span>
              <a href="https://nunacagroupindonesia.com/nunaca-skincare" target="_blank" rel="noopener noreferrer" className="hover:text-[#FFCC00] transition-colors">Nunaca Skincare</a>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FFCC00]"></span>
              <a href="https://nunacagroupindonesia.com/nunaca-travel" target="_blank" rel="noopener noreferrer" className="hover:text-[#FFCC00] transition-colors">Nunaca Travel</a>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FFCC00]"></span>
              <a href="https://nunacagroupindonesia.com/nunaca-butik" target="_blank" rel="noopener noreferrer" className="hover:text-[#FFCC00] transition-colors">Nunaca Butik</a>
            </li>
          </ul>
        </div>

        {/* Column 3: Contact */}
        <div>
          <h3 className="text-[#FFCC00] font-bold text-lg mb-4">CONTACT</h3>
          <div className="w-10 h-0.5 bg-[#FFCC00]/50 mb-6"></div>
          <ul className="space-y-6 text-sm">
            <li className="flex items-start gap-4">
              <MapPin className="text-[#FFCC00] shrink-0 mt-0.5" size={18} />
              <span className="leading-relaxed">Jl. Siliwangi No. 88, Baleendah<br/>Kabupaten Bandung, Jawa Barat</span>
            </li>
            <li className="flex items-start gap-4">
              <MapPin className="text-[#FFCC00] shrink-0 mt-0.5" size={18} />
              <span className="leading-relaxed">Cluster La Plaza Shophouse, Jl. Podomoro Park Jl. Bumi Arga Blok N No. N1, Lengkong, Kec. Bojongsoang,<br/>Kab. Bandung, Jawa Barat</span>
            </li>
            <li className="flex items-center gap-4">
              <Phone className="text-[#FFCC00] shrink-0" size={18} />
              <span>+62 831 8101 3424</span>
            </li>
            <li className="flex items-center gap-4">
              <Mail className="text-[#FFCC00] shrink-0" size={18} />
              <span className="break-all">business@nunacagroupindonesia.com</span>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
