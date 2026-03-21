"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Phone, Lock, ChevronRight } from 'lucide-react';
import '@/styles/design-system.css';

const partners = [
  {
    name: 'Rwanda',
    flag: 'https://flagcdn.com/w80/rw.png',
    label: 'Rwanda',
  },
  {
    name: 'World Bank',
    flag: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/World_Bank_logo.svg/120px-World_Bank_logo.svg.png',
    label: 'World Bank',
    isLogo: true,
  },
  {
    name: 'RAB Rwanda',
    flag: 'https://flagcdn.com/w80/rw.png',
    label: 'RAB Rwanda',
  },
  {
    name: 'ICRAF',
    flag: 'https://flagcdn.com/w80/ke.png',
    label: 'ICRAF / Kenya',
  },
  {
    name: 'Uganda',
    flag: 'https://flagcdn.com/w80/ug.png',
    label: 'Uganda',
  },
  {
    name: 'Tanzania',
    flag: 'https://flagcdn.com/w80/tz.png',
    label: 'Tanzania',
  },
];

export default function LoginPage() {
  const [formData, setFormData] = useState({ phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      router.push('/home');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(160deg, #083d22 0%, #1b5e38 40%, #f0fdf4 100%)',
    }}>

      {/* TOP HERO SECTION - Team Photo Full Width */}
      <div style={{ position: 'relative', width: '100%', height: '240px', overflow: 'hidden', flexShrink: 0 }}>
        <img
          src="/agroforestry-team.png"
          alt="International Support - World Bank, RAB & MINAGRI"
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }}
        />
        {/* Gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(8,61,34,0.45) 0%, rgba(8,61,34,0.15) 60%, rgba(8,61,34,0.7) 100%)',
        }} />
        {/* Title over image */}
        <div style={{ position: 'absolute', bottom: '16px', left: 0, right: 0, textAlign: 'center', padding: '0 1rem' }}>
          <h1 style={{
            color: 'white', fontSize: '1.3rem', fontWeight: '800',
            textShadow: '0 2px 8px rgba(0,0,0,0.5)', marginBottom: '2px',
          }}>
            🌱 AGRI-PRODUCTS INVEST EXCHANGE
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.88)', fontSize: '0.75rem', fontWeight: '500', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
            Rwandan & International Agricultural Investment Platform
          </p>
        </div>
      </div>

      {/* PARTNER LOGOS ROW */}
      <div style={{
        background: 'white',
        padding: '0.75rem 1rem',
        boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
      }}>
        <p style={{ textAlign: 'center', fontSize: '0.6rem', fontWeight: '700', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
          Supported By
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {partners.map((p) => (
            <div key={p.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
              <div style={{
                width: '44px', height: '30px', borderRadius: '4px', overflow: 'hidden',
                border: '1px solid #e5e7eb', background: '#f9fafb',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <img
                  src={p.flag}
                  alt={p.name}
                  style={{ width: p.isLogo ? '90%' : '100%', height: p.isLogo ? 'auto' : '100%', objectFit: p.isLogo ? 'contain' : 'cover', display: 'block' }}
                  onError={(e: any) => { e.target.style.display = 'none'; }}
                />
              </div>
              <span style={{ fontSize: '0.55rem', fontWeight: '600', color: 'var(--text-muted)', textAlign: 'center', maxWidth: '50px', lineHeight: 1.1 }}>{p.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* LOGIN FORM */}
      <div style={{
        flex: 1,
        padding: '1.5rem 1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}>
        {/* Card */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '1.5rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          border: '1px solid rgba(255,255,255,0.8)',
        }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '0.25rem', color: 'var(--primary-dark)' }}>Welcome Back 👋</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1.25rem' }}>Login to your investment account</p>

          {error && (
            <div style={{ background: '#fee2e2', color: '#ef4444', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', marginBottom: '0.4rem', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                PHONE NUMBER
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  id="login-phone"
                  type="tel"
                  placeholder="Registered mobile number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.7rem 0.7rem 0.7rem 2.4rem', borderRadius: '10px', border: '1.5px solid var(--accent)', fontSize: '0.95rem', background: '#f8faf9', outline: 'none' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', marginBottom: '0.4rem', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                PASSWORD
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  id="login-password"
                  type="password"
                  placeholder="Your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.7rem 0.7rem 0.7rem 2.4rem', borderRadius: '10px', border: '1.5px solid var(--accent)', fontSize: '0.95rem', background: '#f8faf9', outline: 'none' }}
                />
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ marginTop: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', borderRadius: '12px', padding: '0.9rem' }}
            >
              {loading ? 'Logging in...' : 'Login to My Account'}
              {!loading && <ChevronRight size={18} />}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
            Don&apos;t have an account?{' '}
            <Link href="/register" style={{ color: 'var(--primary)', fontWeight: '700', textDecoration: 'none' }}>
              Register Now
            </Link>
          </p>

          <div style={{ marginTop: '1.5rem', borderTop: '1px solid #f1f1f1', paddingTop: '1rem', textAlign: 'center' }}>
            <a 
              href="https://agri-invest-exchange-with-rab-rdb-rwanda.mystrikingly.com" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: 'var(--primary)', fontSize: '0.75rem', fontWeight: '600', textDecoration: 'none' }}
            >
              🌐 Visit Official Developer Website
            </a>
          </div>
        </div>

        {/* Bottom badge */}
        <div style={{ textAlign: 'center', paddingBottom: '1rem' }}>
          <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
            🔒 Secure &nbsp;|&nbsp; 🌍 East Africa &nbsp;|&nbsp; 📱 Mobile Money
          </p>
        </div>
      </div>
    </div>
  );
}
