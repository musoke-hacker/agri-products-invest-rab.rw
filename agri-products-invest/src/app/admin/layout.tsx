"use client";

import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <div style={{ background: '#f0f2f5', minHeight: '100vh' }}>
      <header style={{ background: 'var(--primary-dark)', color: 'white', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button onClick={() => router.push('/profile')} style={{ background: 'none', border: 'none', color: 'white' }}>
           <ChevronLeft size={24} />
        </button>
        <h1 style={{ color: 'white', fontSize: '1.25rem' }}>Management Panel</h1>
      </header>
      <main style={{ padding: '1rem' }}>
        {children}
      </main>
    </div>
  );
}
