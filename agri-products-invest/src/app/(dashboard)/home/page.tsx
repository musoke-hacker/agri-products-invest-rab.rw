"use client";

import { useState, useEffect } from 'react';
import { Bell, TrendingUp, Wallet, Award, Clock, ChevronRight, CheckCircle2 } from 'lucide-react';
import '@/styles/design-system.css';

export default function HomePage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/user/stats');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    setCheckingIn(true);
    try {
      const res = await fetch('/api/user/check-in', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) alert(data.error);
      else {
        alert(data.message);
        fetchStats();
      }
    } catch (err) {
      alert('Check-in failed');
    } finally {
      setCheckingIn(false);
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;

  return (
    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem' }}>AGRI-PRODUCTS</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Welcome back, Invest & Grow</p>
        </div>
        <div style={{ position: 'relative', padding: '0.5rem', background: 'var(--accent)', borderRadius: '12px' }}>
          <Bell size={20} color="var(--primary)" />
        </div>
      </div>

      {/* Main Stats Card */}
      <div className="premium-card" style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', color: 'white', border: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>Wallet Balance</p>
            <h1 style={{ color: 'white', fontSize: '2rem' }}>{stats?.balance?.toLocaleString()} <span style={{ fontSize: '1rem' }}>RWF</span></h1>
          </div>
          <button 
             onClick={handleCheckIn}
             disabled={checkingIn || stats?.checkInCount >= 5}
             style={{ background: 'white', color: 'var(--primary)', border: 'none', padding: '0.5rem 1rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '700', alignSelf: 'flex-start' }}
          >
            {stats?.checkInCount >= 5 ? 'Check-in Done' : 'Daily Check-in'}
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
          <div>
            <p style={{ fontSize: '0.7rem', opacity: 0.8 }}>Total Investment</p>
            <p style={{ fontWeight: '600' }}>{stats?.totalInvestment?.toLocaleString()} RWF</p>
          </div>
          <div>
            <p style={{ fontSize: '0.7rem', opacity: 0.8 }}>Total Earnings</p>
            <p style={{ fontWeight: '600' }}>{stats?.totalEarnings?.toLocaleString()} RWF</p>
          </div>
        </div>
      </div>

      {/* Today's Earning Highlight */}
      <div style={{ background: 'var(--accent)', padding: '1rem', borderRadius: 'var(--border-radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <TrendingUp size={20} color="var(--primary)" />
          <div>
            <p style={{ fontSize: '0.8rem', fontWeight: '600' }}>Today's Earnings</p>
            <p style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: '700' }}>+{stats?.todayEarnings?.toLocaleString()} RWF</p>
          </div>
        </div>
        <ChevronRight size={18} color="var(--text-muted)" />
      </div>

      {/* Partners Section */}
      <div style={{ marginTop: '0.5rem' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Trusted Development Partners</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', textAlign: 'center' }}>
          <div className="partner-item">
             <div style={{ height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f0f0', borderRadius: '8px', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem' }}>🇷🇼</span>
             </div>
             <p style={{ fontSize: '0.65rem', fontWeight: '600' }}>Rwanda Flag</p>
          </div>
          <div className="partner-item">
             <div style={{ height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f0f0', borderRadius: '8px', marginBottom: '0.5rem' }}>
                <img src="https://upload.wikimedia.org/wikipedia/commons/e/ef/World_Bank_Group_logo.svg" alt="World Bank" style={{ maxWidth: '80%', maxHeight: '80%' }} />
             </div>
             <p style={{ fontSize: '0.65rem', fontWeight: '600' }}>World Bank</p>
          </div>
          <div className="partner-item">
             <div style={{ height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f0f0', borderRadius: '8px', marginBottom: '0.5rem' }}>
                <img src="https://www.rab.gov.rw/typo3conf/ext/gov_template/Resources/Public/Images/logo.png" alt="RAB" style={{ maxWidth: '80%', maxHeight: '80%', filter: 'grayscale(100%)' }} />
             </div>
             <p style={{ fontSize: '0.65rem', fontWeight: '600' }}>RAB Rwanda</p>
          </div>
        </div>
      </div>

      {/* Info Warning */}
      <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', padding: '1rem', borderRadius: '12px', fontSize: '0.75rem', color: '#92400e', lineHeight: '1.4' }}>
        <strong>DISCLAIMER:</strong> Product prices and earnings may change anytime depending on market conditions and platform decisions.
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
         <div className="premium-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Wallet size={20} color="var(--primary)" />
            <p style={{ fontSize: '0.8rem', fontWeight: '600' }}>My Wallet</p>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Deposit & Withdraw</p>
         </div>
         <div className="premium-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Award size={20} color="var(--primary)" />
            <p style={{ fontSize: '0.8rem', fontWeight: '600' }}>Cycle Progress</p>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Track investments</p>
         </div>
      </div>
    </div>
  );
}
