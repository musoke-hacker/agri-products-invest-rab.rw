"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Phone, Lock, ChevronRight, Globe } from 'lucide-react';
import '@/styles/design-system.css';

const countries = [
  { name: 'Rwanda', code: '250', flag: '🇷🇼' },
  { name: 'Uganda', code: '256', flag: '🇺🇬' },
  { name: 'Kenya', code: '254', flag: '🇰🇪' },
  { name: 'Tanzania', code: '255', flag: '🇹🇿' },
  { name: 'Burundi', code: '257', flag: '🇧🇮' },
  { name: 'South Sudan', code: '211', flag: '🇸🇸' },
];

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    phone: '',
    countryCode: '250',
    password: '',
    referralCode: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      router.push('/home');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem', minHeight: '100vh', justifyContent: 'center', background: 'linear-gradient(to bottom, #f0fdf4, #ffffff)' }}>
      <div className="auth-header" style={{ textAlign: 'center' }}>
        <div style={{ background: 'var(--primary)', width: '64px', height: '64px', borderRadius: '16px', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Globe color="white" size={32} />
        </div>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Join AGRI-PRODUCTS</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Modernizing Agriculture Investment</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {error && <div style={{ background: '#fee2e2', color: '#ef4444', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem' }}>{error}</div>}
        
        <div className="input-group">
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>SELECT COUNTRY</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <select 
              value={formData.countryCode}
              onChange={(e) => setFormData({...formData, countryCode: e.target.value})}
              style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--accent)', background: 'white', flex: '1' }}
            >
              {countries.map(c => (
                <option key={c.code} value={c.code}>{c.flag} {c.name} (+{c.code})</option>
              ))}
            </select>
          </div>
        </div>

        <div className="input-group">
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>PHONE NUMBER</label>
          <div style={{ position: 'relative' }}>
            <Phone size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="tel"
              placeholder="Enter mobile money number"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              required
              style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid var(--accent)', fontSize: '1rem' }}
            />
          </div>
        </div>

        <div className="input-group">
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>PASSWORD</label>
          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="password"
              placeholder="Create a secure password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
              style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid var(--accent)', fontSize: '1rem' }}
            />
          </div>
        </div>

        <div className="input-group">
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>REFERRAL CODE (OPTIONAL)</label>
          <input 
            type="text"
            placeholder="Enter invite code if any"
            value={formData.referralCode}
            onChange={(e) => setFormData({...formData, referralCode: e.target.value})}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--accent)', fontSize: '1rem' }}
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          {loading ? 'Creating Account...' : 'Register Now'}
          {!loading && <ChevronRight size={18} />}
        </button>

        <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Already have an account? <Link href="/login" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>Login</Link>
        </p>
      </form>
    </div>
  );
}
