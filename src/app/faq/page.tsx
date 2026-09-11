import type { Metadata } from 'next';
import FAQContent from '@/components/FAQContent';

export const metadata: Metadata = {
  title: 'FAQ | Nunaca Form',
  description:
    'Pertanyaan umum seputar Nunaca Form: keunggulan dibanding Google Forms, keamanan data, pembuatan formulir tanpa kode, dan integrasi dengan sistem Nunaca lainnya.',
  alternates: { canonical: '/faq' },
};

export default function FAQPage() {
  return <FAQContent />;
}