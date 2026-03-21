"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Package, Users, Wallet, UserCircle, Award } from 'lucide-react';
import '@/styles/design-system.css';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

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
