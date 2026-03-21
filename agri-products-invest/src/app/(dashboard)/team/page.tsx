"use client";

import { useState, useEffect } from 'react';
import { Users, UserPlus, Share2, Copy, Check, PieChart } from 'lucide-react';
import '@/styles/design-system.css';

export default function TeamPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const [teamStats, setTeamStats] = useState<any>({ level1: 0, level2: 0, level3: 0 });

  useEffect(() => {
    fetch('/api/user/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      });
    
    fetch('/api/user/team')
      .then(res => res.json())
      .then(data => setTeamStats(data));
  }, []);

  const copyRefLink = () => {
    const link = `${window.location.origin}/register?ref=${stats?.referralCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Team...</div>;

  return (
    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ marginBottom: '0.5rem' }}>
        <h2 style={{ fontSize: '1.25rem' }}>My Team</h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Earn commissions from your referrals</p>
      </div>

      <div className="premium-card" style={{ background: 'linear-gradient(135deg, var(--primary-light), var(--primary))', color: 'white', border: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <p style={{ fontSize: '0.75rem', opacity: 0.9 }}>Your Referral Code</p>
            <h3 style={{ color: 'white', fontSize: '1.5rem', letterSpacing: '2px' }}>{stats?.referralCode}</h3>
          </div>
          <Share2 size={24} color="rgba(255,255,255,0.8)" />
        </div>
        
        <div style={{ background: 'rgba(255,255,255,0.15)', padding: '1rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.75rem', maxWidth: '200px' }}>
            {typeof window !== 'undefined' ? `${window.location.origin}/register?ref=${stats?.referralCode}` : ''}
          </div>
          <button 
            onClick={copyRefLink}
            style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', border: 'none', background: 'white', color: 'var(--primary)', fontWeight: '700', fontSize: '0.75rem', flexShrink: 0 }}
          >
            {copied ? <Check size={16} /> : 'COPY LINK'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
         <div className="premium-card" style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)' }}>10%</p>
            <p style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)' }}>LEVEL 1</p>
         </div>
         <div className="premium-card" style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)' }}>5%</p>
            <p style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)' }}>LEVEL 2</p>
         </div>
         <div className="premium-card" style={{ gridColumn: 'span 2', textAlign: 'center' }}>
            <p style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)' }}>1%</p>
            <p style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)' }}>LEVEL 3</p>
         </div>
      </div>

      <div className="premium-card">
         <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
           <PieChart size={18} color="var(--primary)" /> Team Statistics
         </h4>
         <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#f8faf9', borderRadius: '8px' }}>
               <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>Direct Members (L1)</span>
               <span style={{ fontWeight: '800' }}>{teamStats.level1}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#f8faf9', borderRadius: '8px' }}>
               <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>Indirect Members (L2)</span>
               <span style={{ fontWeight: '800' }}>{teamStats.level2}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#f8faf9', borderRadius: '8px' }}>
               <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>Network Members (L3)</span>
               <span style={{ fontWeight: '800' }}>{teamStats.level3}</span>
            </div>
         </div>
      </div>
    </div>
  );
}
