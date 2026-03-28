"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Package, Users, Wallet, UserCircle, Award } from 'lucide-react';
import '@/styles/design-system.css';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [installPrompt, setInstallPrompt] = (useState as any)(null);

  (useEffect as any)(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) {
      alert('Steps to install:\n1. Open your browser menu (3 dots or share icon)\n2. Tap "Add to Home Screen"\n3. Enjoy high-speed access!');
      return;
    }
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  const tabs = [
    { name: 'Home', path: '/home', icon: Home },
    { name: 'Market', path: '/products', icon: Package },
    { name: 'My Tools', path: '/investments', icon: Award },
    { name: 'Team', path: '/team', icon: Users },
    { name: 'Wallet', path: '/wallet', icon: Wallet },
    { name: 'Profile', path: '/profile', icon: UserCircle },
  ];

  return (
    <div style={{ paddingBottom: '80px' }}>
      {/* PWA Install Notice */}
      <div style={{ 
        background: 'linear-gradient(90deg, #1b5e38 0%, #083d22 100%)', 
        color: 'white', 
        padding: '0.6rem 1rem', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        fontSize: '0.75rem',
        fontWeight: '700',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1rem' }}>📲</span>
          <span>Install Official App for Faster Access</span>
        </div>
        <button 
          onClick={handleInstallClick}
          style={{ background: 'white', color: 'var(--primary-dark)', border: 'none', padding: '0.3rem 0.8rem', borderRadius: '6px', fontSize: '0.65rem', fontWeight: '800', cursor: 'pointer' }}>
          INSTALL NOW
        </button>
      </div>

      {children}
      
      <nav className="tab-bar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.path;
          return (
            <Link 
              key={tab.path} 
              href={tab.path} 
              className={`tab-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span>{tab.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
