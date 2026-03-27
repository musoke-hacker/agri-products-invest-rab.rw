"use client";

import { useRouter } from 'next/navigation';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/user/stats');
        if (!res.ok) {
          router.push('/login');
          return;
        }
        const data = await res.json();
        if (data.role !== 'ADMIN') {
          router.push('/profile');
        } else {
          setIsAdmin(true);
        }
      } catch (err) {
        router.push('/login');
      }
    }
    checkAuth();
  }, [router]);

  if (isAdmin === null) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5' }}>
        <Loader2 className="animate-spin" size={48} color="var(--primary)" />
      </div>
    );
  }

  return (
    <div style={{ background: '#f0f2f5', minHeight: '100vh' }}>
      <header style={{ background: 'var(--primary-dark)', color: 'white', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', position: 'sticky', top: 0, zIndex: 100 }}>
        <button onClick={() => router.push('/profile')} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
           <ChevronLeft size={24} />
        </button>
        <h1 style={{ color: 'white', fontSize: '1.25rem', fontWeight: 700 }}>Management Panel</h1>
      </header>
      <main style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
        {children}
      </main>
    </div>
  );
}
