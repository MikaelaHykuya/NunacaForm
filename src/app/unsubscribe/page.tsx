import type { Metadata } from 'next';
import { Suspense } from 'react';
import UnsubscribeContent from '@/components/UnsubscribeContent';

export const metadata: Metadata = {
  title: 'Berhenti Berlangganan | Nunaca Group',
  robots: { index: false, follow: false },
};

export default function UnsubscribePage() {
  return (
    <main className="min-h-screen bg-[#050505]">
      <Suspense fallback={<div className="min-h-screen bg-[#050505] text-[#FFCC00] flex items-center justify-center font-bold tracking-widest uppercase">Loading...</div>}>
        <UnsubscribeContent />
      </Suspense>
    </main>
  );
}