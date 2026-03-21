"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserCircle, Shield, FileText, Info, LogOut, ChevronRight, HelpCircle, Settings } from 'lucide-react';
import '@/styles/design-system.css';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/user/stats')
      .then(res => res.json())
      .then(data => setUser(data));
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const menuItems = [
    { name: 'Company Profile', icon: Info },
    { name: 'About Us', icon: HelpCircle },
    { name: 'Terms & Conditions', icon: FileText },
    { name: 'Withdrawal Policy', icon: Shield },
    { name: 'User Guide', icon: FileText },
  ];

  return (
    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 0' }}>
         <div style={{ width: '60px', height: '60px', borderRadius: '30px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserCircle size={40} color="var(--primary)" />
         </div>
         <div>
            <h2 style={{ fontSize: '1.25rem' }}>{user?.phone}</h2>
            <span style={{ fontSize: '0.7rem', background: 'var(--primary)', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '10px', textTransform: 'uppercase', fontWeight: '700' }}>
               {user?.role || 'REGULAR MEMBER'}
            </span>
         </div>
      </div>

      <div className="premium-card" style={{ padding: '0.5rem' }}>
         {menuItems.map((item, idx) => {
           const Icon = item.icon;
           return (
             <div key={idx} style={{ 
               display: 'flex', 
               alignItems: 'center', 
               justifyContent: 'space-between', 
               padding: '1rem', 
               borderBottom: idx === menuItems.length - 1 ? 'none' : '1px solid #f1f1f1',
               cursor: 'pointer'
             }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                   <Icon size={20} color="var(--text-muted)" />
                   <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{item.name}</span>
                </div>
                <ChevronRight size={18} color="#ccc" />
             </div>
           );
         })}
      </div>

      <div className="premium-card" style={{ padding: '0.5rem' }}>
         {user?.role === 'ADMIN' && (
           <div 
             onClick={() => router.push('/admin')}
             style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid #f1f1f1', cursor: 'pointer' }}
           >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary)' }}>
                 <Settings size={20} />
                 <span style={{ fontSize: '0.9rem', fontWeight: '700' }}>Admin Dashboard</span>
              </div>
              <ChevronRight size={18} color="var(--primary)" />
           </div>
         )}
         
         <div 
           onClick={handleLogout}
           style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', cursor: 'pointer' }}
         >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--danger)' }}>
               <LogOut size={20} />
               <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>Logout Account</span>
            </div>
         </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
         <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>AGRI-PRODUCTS v1.0.2</p>
         <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Secured by SSL Encryption</p>
      </div>
    </div>
  );
}
