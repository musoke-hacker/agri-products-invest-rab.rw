"use client";

import { useState, useEffect } from 'react';
import { Bell, TrendingUp, Wallet, Award, Clock, ChevronRight, CheckCircle2, Globe } from 'lucide-react';
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

  if (loading) return (
    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ height: '40px', width: '60%', background: '#eee', borderRadius: '8px', animation: 'pulse 1.5s infinite' }} />
      <div style={{ height: '160px', width: '100%', background: '#eee', borderRadius: '24px', animation: 'pulse 1.5s infinite' }} />
      <div style={{ height: '80px', width: '100%', background: '#eee', borderRadius: '20px', animation: 'pulse 1.5s infinite' }} />
      <div style={{ height: '140px', width: '100%', background: '#eee', borderRadius: '24px', animation: 'pulse 1.5s infinite' }} />
      <style>{`
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 0.3; }
          100% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );

  return (
    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--accent)', background: 'white' }}>
            <img src="/agroforestry-team.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--primary-dark)', fontWeight: '800' }}>AGRI-PRODUCTS</h2>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600' }}>Invest & Grow Rwanda</p>
          </div>
        </div>
        <div style={{ position: 'relative', padding: '0.6rem', background: 'var(--accent)', borderRadius: '14px' }}>
          <Bell size={20} color="var(--primary)" />
          {stats?.activeInvestments > 0 && <span style={{ position: 'absolute', top: '2px', right: '2px', width: '8px', height: '8px', background: 'red', borderRadius: '50%', border: '2px solid white' }}></span>}
        </div>
      </div>

      {/* Main Stats Card */}
      <div className="premium-card" style={{ background: 'linear-gradient(135deg, #083d22 0%, #1b5e38 100%)', color: 'white', border: 'none', boxShadow: '0 10px 25px rgba(8,61,34,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <p style={{ fontSize: '0.8rem', opacity: 0.8, letterSpacing: '0.5px' }}>Current Account Balance</p>
            <h1 style={{ color: 'white', fontSize: '2.2rem', fontWeight: '800' }}>{stats?.balance?.toLocaleString()} <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>RWF</span></h1>
          </div>
          <button 
             onClick={handleCheckIn}
             disabled={checkingIn}
             style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '0.6rem 1rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700', alignSelf: 'flex-start' }}
          >
            {checkingIn ? '...' : 'Daily Check-in'}
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '1.25rem' }}>
          <div>
            <p style={{ fontSize: '0.6rem', opacity: 0.7, textTransform: 'uppercase', fontWeight: '700' }}>Invested</p>
            <p style={{ fontWeight: '700', fontSize: '0.9rem' }}>{stats?.totalInvestment?.toLocaleString()}</p>
          </div>
          <div>
            <p style={{ fontSize: '0.6rem', opacity: 0.7, textTransform: 'uppercase', fontWeight: '700' }}>Earnings</p>
            <p style={{ fontWeight: '700', fontSize: '0.9rem' }}>{stats?.totalEarnings?.toLocaleString()}</p>
          </div>
          <div>
            <p style={{ fontSize: '0.6rem', opacity: 0.7, textTransform: 'uppercase', fontWeight: '700' }}>Tools</p>
            <p style={{ fontWeight: '700', fontSize: '0.9rem' }}>{stats?.activeInvestments}</p>
          </div>
        </div>
      </div>

      {/* Today's Earning Highlight */}
      <div style={{ background: '#f0fdf4', border: '1px solid #dcfce7', padding: '1.25rem', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 12px rgba(22,163,74,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'var(--primary)', padding: '0.6rem', borderRadius: '12px' }}>
             <TrendingUp size={20} color="white" />
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Today's Return</p>
            <p style={{ fontSize: '1.2rem', color: 'var(--primary)', fontWeight: '800' }}>+{stats?.todayEarnings?.toLocaleString()} RWF</p>
          </div>
        </div>
        <ChevronRight size={18} color="var(--primary)" />
      </div>

      {/* Hero / Partner Banner */}
      <div style={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', height: '140px' }}>
        <img 
          src="/agroforestry-team.png" 
          alt="International Support - World Bank, RAB & MINAGRI" 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(8,61,34,0.8), transparent)' }}></div>
        <div style={{ position: 'absolute', bottom: '1rem', left: '1.25rem' }}>
          <p style={{ color: 'white', fontSize: '1.1rem', fontWeight: '800' }}>International Support</p>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.7rem' }}>Powered by World Agroforestry & Partners</p>
        </div>
      </div>


      {/* Info Warning */}
      <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', padding: '1rem', borderRadius: '12px', fontSize: '0.75rem', color: '#92400e', lineHeight: '1.4' }}>
        <strong>DISCLAIMER:</strong> Product prices and earnings may change anytime depending on market conditions and platform decisions.
      </div>



      {/* WhatsApp Community Section */}
      <div style={{ background: 'white', border: '1px solid var(--border)', padding: '1.25rem', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '0.8rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: '#25D366', padding: '0.6rem', borderRadius: '12px' }}>
             <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.01-1.24-.148-1.314l-.643-.322Z"/></svg>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--primary-dark)' }}>Join Our WhatsApp Group</p>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Get updates & support on WhatsApp</p>
          </div>
          <a 
            href="https://chat.whatsapp.com/KW5LhHKUXvxHnnbuWDnZTB" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn-primary"
            style={{ width: 'auto', padding: '0.6rem 1.25rem', borderRadius: '12px', background: '#25D366', border: 'none', color: 'white', textDecoration: 'none', fontSize: '0.8rem', fontWeight: '700' }}
          >
            Join
          </a>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', paddingBottom: '20px' }}>
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
