'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PinLogin from '@/components/PinLogin';

function AdminLoginContent() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next');

  return (
    <PinLogin
      onSuccess={() => {
        const target = next && next.startsWith('/') && next !== '/admin/login' ? next : '/admin';
        router.replace(target);
        router.refresh();
      }}
    />
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#050505] text-[#FFCC00] flex items-center justify-center font-bold tracking-widest uppercase">
          Memuat...
        </div>
      }
    >
      <AdminLoginContent />
    </Suspense>
  );
}