import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SplashScreen from "@/components/SplashScreen";
import BackToTop from "@/components/BackToTop";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://nunacagroupindonesia.com'),
  title: {
    default: 'Nunaca Form Engine | Formulir Interaktif Nunaca Group',
    template: '%s',
  },
  description:
    "Nunaca Form adalah formulir interaktif kelas dunia dari Nunaca Group Indonesia. Satu pertanyaan per layar, logic jumps, dan analitik respons terpadu untuk seluruh lini usaha.",
  keywords: [
    'nunaca', 'nunaca group', 'formulir interaktif', 'survey online',
    'form builder', 'kuisioner', 'bandung', 'indonesia'
  ],
  authors: [{ name: 'Nunaca Group Indonesia', url: 'https://nunacagroupindonesia.com' }],
  creator: 'Nunaca Group Indonesia',
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: 'https://nunacagroupindonesia.com',
    siteName: 'Nunaca Form Engine',
    title: 'Nunaca Form Engine | Formulir Interaktif Nunaca Group',
    description:
      "Buat formulir yang disukai pengguna. Satu pertanyaan per layar, logic jumps, dan analitik respons terpadu untuk seluruh lini usaha Nunaca Group.",
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nunaca Form Engine | Formulir Interaktif Nunaca Group',
    description:
      'Buat formulir yang disukai pengguna. Satu pertanyaan per layar, logic jumps, dan analitik respons terpadu.',
  },
  icons: {
    icon: '/icon.svg',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SplashScreen />
        {children}
        <BackToTop />
      </body>
    </html>
  );
}
