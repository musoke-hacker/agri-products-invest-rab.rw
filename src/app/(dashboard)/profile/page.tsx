"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, FileText, Info, LogOut, ChevronRight, Settings, Headphones } from 'lucide-react';
import '@/styles/design-system.css';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  // Modal states
  const [activeModal, setActiveModal] = useState<string | null>(null);

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
    { name: 'Settings (Account Details)', icon: Settings, id: 'settings' },
    { name: 'About Us & Partners', icon: Info, id: 'about' },
    { name: 'Privacy, Terms & Conditions', icon: Shield, id: 'terms' },
    { name: 'Withdrawal Policy', icon: FileText, id: 'withdrawal' },
  ];

  return (
    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '90px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 0' }}>
         <div style={{ width: '70px', height: '70px', borderRadius: '35px', background: 'white', border: '2px solid var(--accent)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            {user?.profileImage
              ? <img src={user.profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <img src="/rdb-logo.png" alt="RDB" style={{ width: '90%', height: '90%', objectFit: 'contain' }} />
            }
         </div>
         <div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.2rem' }}>{user?.name || user?.phone || 'Loading...'}</h2>
            {user?.name && (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: '500' }}>
                 {user?.countryCode} {user?.phone}
              </p>
            )}
            <span style={{ fontSize: '0.7rem', background: 'var(--primary)', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '10px', textTransform: 'uppercase', fontWeight: '700', display: 'inline-block' }}>
               {user?.role || 'REGULAR MEMBER'}
            </span>
         </div>
      </div>

      <div className="premium-card" style={{ padding: '0.5rem' }}>
         {menuItems.map((item, idx) => {
           const Icon = item.icon;
           return (
             <div key={idx} 
               onClick={() => setActiveModal(item.id)}
               style={{ 
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
           onClick={() => router.push('/support')}
           style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid #f1f1f1', cursor: 'pointer' }}
         >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary-dark)' }}>
               <Headphones size={20} />
               <span style={{ fontSize: '0.9rem', fontWeight: '700' }}>Customer Support Helpdesk</span>
            </div>
            <ChevronRight size={18} color="var(--primary-dark)" />
         </div>

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

      {/* MODALS */}
      {activeModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000,
          display: 'flex', alignItems: 'flex-end',
          animation: 'fadeIn 0.2s ease-out'
        }} onClick={() => setActiveModal(null)}>
          <div className="premium-card" style={{ 
            width: '100%', borderBottomLeftRadius: 0, borderBottomRightRadius: 0,
            maxHeight: '85vh', overflowY: 'auto', padding: '1.5rem',
            animation: 'slideUp 0.3s ease-out'
          }} onClick={e => e.stopPropagation()}>
            
            {activeModal === 'settings' && (
              <div>
                <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Settings size={24} /> Account Settings
                </h2>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Username</label>
                  <input readOnly type="text" value={user?.name || 'Not Set'} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: '#f9f9f9' }} />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Phone Number</label>
                  <input readOnly type="text" value={user?.phone || ''} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: '#f9f9f9' }} />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Account Role</label>
                  <input readOnly type="text" value={user?.role || 'REGULAR MEMBER'} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: '#f9f9f9' }} />
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '1.5rem' }}>
                   * To update your name or phone number, please contact our support team.
                </p>
                <button className="btn-primary" style={{ width: '100%' }} onClick={() => setActiveModal(null)}>Close Settings</button>
              </div>
            )}

            {activeModal === 'terms' && (
              <div>
                <h2 style={{ marginBottom: '1rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Shield size={24} /> Privacy & Terms
                </h2>
                <div style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '0.9rem' }}>
                  <h3 style={{ marginTop: '1rem', marginBottom: '0.5rem', color: 'var(--text)', fontSize: '1rem' }}>1. Privacy Policy</h3>
                  <p>We collect your phone number and name for profile verification and mobile money security. Your data is encrypted and never shared with external agencies.</p>
                  
                  <h3 style={{ marginTop: '1rem', marginBottom: '0.5rem', color: 'var(--text)', fontSize: '1rem' }}>2. Terms of Service</h3>
                  <p>All investments are locked for a 5-day cycle. Premature withdrawals are not permitted to ensure farming stability.</p>

                  <h3 style={{ marginTop: '1rem', marginBottom: '0.5rem', color: 'var(--text)', fontSize: '1rem' }}>3. Financial Safety</h3>
                  <p>Invest only what you can afford to lock for the duration of the cycle.</p>
                </div>
                <button className="btn-primary" style={{ marginTop: '1.5rem', width: '100%' }} onClick={() => setActiveModal(null)}>I Understand</button>
              </div>
            )}

            {activeModal === 'about' && (
              <div>
                <h2 style={{ marginBottom: '1.25rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Info size={24} /> Program Overview
                </h2>
                <div style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '0.9rem' }}>
                  <h3 style={{ marginBottom: '0.5rem', color: 'var(--text)', fontSize: '1rem' }}>Aims & Objectives</h3>
                  <p>Agri-Products Invest aims to empower rural farmers in East Africa by providing them with high-quality tools, organic fertilizers, and hybrid seeds through crowd-sourced capital. Our goal is to increase crop yield by 40% annually while providing stable returns to our investors.</p>
                  
                  <h3 style={{ marginTop: '1.25rem', marginBottom: '0.5rem', color: 'var(--text)', fontSize: '1rem' }}>Developers</h3>
                  <p>Developed by <strong>AgriTech Solutions Ltd</strong>, a team of dedicated software engineers and agricultural experts committed to digitizing the farming value chain.</p>

                  <h3 style={{ marginTop: '1.25rem', marginBottom: '0.5rem', color: 'var(--text)', fontSize: '1rem' }}>Our Partners</h3>
                  <p>We are proud to collaborate with <strong>Regional Farmers Cooperatives</strong>, <strong>MTN Mobile Money</strong>, and <strong>Airtel Money</strong> to ensure secure and efficient fund distribution and profit collection.</p>
                  

                </div>
                <button className="btn-primary" style={{ marginTop: '1.5rem', width: '100%' }} onClick={() => setActiveModal(null)}>Close Overview</button>
              </div>
            )}

            {activeModal === 'withdrawal' && (
              <div>
                <h2 style={{ marginBottom: '1rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileText size={24} /> Withdrawal Policy
                </h2>
                <div style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '0.9rem' }}>
                  <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <li>Withdrawals are processed exclusively via Mobile Money.</li>
                    <li>Minimum withdrawal amount limit applies as stated on the withdrawal page.</li>
                    <li>Withdrawals initiated post 5-day cycle are processed within 24 hours.</li>
                    <li>A standard network fee might be deducted by the mobile network operator during transfer.</li>
                  </ul>
                </div>
                <button className="btn-primary" style={{ marginTop: '1.5rem', width: '100%' }} onClick={() => setActiveModal(null)}>Close</button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
