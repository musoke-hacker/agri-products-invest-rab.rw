"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Phone, Lock, ChevronRight, Globe, User, ShieldCheck } from 'lucide-react';
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
    name: '',
    phone: '',
    countryCode: '250',
    password: '',
    referralCode: '',
    profileImage: '',
    verificationCode: '',
  });
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profileImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const sendVerificationCode = async () => {
    if (!formData.phone) {
      setError('Please enter your phone number first.');
      return;
    }
    setSendingCode(true);
    setError('');
    try {
      const res = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setCodeSent(true);
      setSuccess('Verification code sent to your phone!');
      if (data.debugCode) {
        console.log('DEBUG: Verification code is', data.debugCode);
        setSuccess(`Code sent! (Debug: ${data.debugCode})`);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSendingCode(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeSent) {
      setError('Please verify your phone number first.');
      return;
    }
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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'linear-gradient(160deg, #083d22 0%, #1b5e38 40%, #f0fdf4 100%)' }}>

      {/* TOP HERO SECTION - Team Photo */}
      <div style={{ position: 'relative', width: '100%', height: '160px', overflow: 'hidden', flexShrink: 0 }}>
        <img
          src="/agroforestry-team.png"
          alt="International Support - World Bank, RAB & MINAGRI"
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(8,61,34,0.4) 0%, rgba(8,61,34,0.65) 100%)' }} />
        <div style={{ position: 'absolute', bottom: '12px', left: 0, right: 0, textAlign: 'center' }}>
          <h1 style={{ color: 'white', fontSize: '1.2rem', fontWeight: '800', textShadow: '0 2px 8px rgba(0,0,0,0.5)', marginBottom: '2px' }}>
            🌱 Join AGRI-PRODUCTS
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.7rem', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
            Modernizing Agriculture Investment in East Africa
          </p>
        </div>
      </div>

      {/* FORM AREA */}
      <div style={{ flex: 1, padding: '1.25rem' }}>
        <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>Create Account 🚀</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: '1.25rem' }}>Invest in agriculture & earn returns</p>


      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {error && <div style={{ background: '#fee2e2', color: '#ef4444', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem' }}>{error}</div>}
        {success && <div style={{ background: '#dcfce7', color: '#16a34a', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem' }}>{success}</div>}
        
        <div className="input-group">
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>UPLOAD PROFILE PICTURE</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#f8faf9', padding: '0.5rem', borderRadius: '10px', border: '1.5px solid var(--accent)' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '25px', background: 'var(--accent)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {formData.profileImage ? (
                <img src={formData.profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: '1.2rem' }}>👤</span>
              )}
            </div>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageCapture}
              style={{ fontSize: '0.75rem', flex: 1, color: 'var(--text-muted)' }}
            />
          </div>
        </div>

        <div className="input-group">
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>USERNAME</label>
          <div style={{ position: 'relative' }}>
            <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text"
              placeholder="Enter your full name as username"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
              style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid var(--accent)', fontSize: '1rem' }}
            />
          </div>
        </div>

        <div className="input-group">
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>PHONE NUMBER</label>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <select 
              value={formData.countryCode}
              onChange={(e) => setFormData({...formData, countryCode: e.target.value})}
              style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--accent)', background: 'white', flex: '0.4' }}
            >
              {countries.map(c => (
                <option key={c.code} value={c.code}>{c.flag} +{c.code}</option>
              ))}
            </select>
            <div style={{ position: 'relative', flex: '1' }}>
              <Phone size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="tel"
                placeholder="Mobile number"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                required
                style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid var(--accent)', fontSize: '1rem' }}
              />
            </div>
          </div>
          <button 
            type="button"
            onClick={sendVerificationCode}
            disabled={sendingCode || !formData.phone}
            style={{ 
              width: '100%', padding: '0.6rem', background: codeSent ? '#f0fdf4' : 'var(--accent)', 
              color: codeSent ? '#16a34a' : 'var(--primary-dark)', border: 'none', 
              borderRadius: '8px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' 
            }}
          >
            {sendingCode ? 'Sending Code...' : codeSent ? 'Code Sent (Resend?)' : 'Send Verification Code'}
          </button>
        </div>

        {codeSent && (
          <div className="input-group">
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>VERIFICATION CODE</label>
            <div style={{ position: 'relative' }}>
              <ShieldCheck size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text"
                placeholder="Enter 4-digit code"
                value={formData.verificationCode}
                onChange={(e) => setFormData({...formData, verificationCode: e.target.value})}
                required
                maxLength={4}
                style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: '8px', border: '1.5px solid var(--primary)', fontSize: '1.2rem', fontWeight: '800', letterSpacing: '0.5rem', textAlign: 'center' }}
              />
            </div>
          </div>
        )}

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

        <button type="submit" disabled={loading || !codeSent} className="btn-primary" style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', borderRadius: '12px', opacity: (loading || !codeSent) ? 0.7 : 1 }}>
          {loading ? 'Creating Account...' : 'Register Now'}
          {!loading && <ChevronRight size={18} />}
        </button>

        <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Already have an account? <Link href="/login" style={{ color: 'var(--primary)', fontWeight: '700', textDecoration: 'none' }}>Login</Link>
        </p>
      </form>

      <div style={{ marginTop: '1.5rem', borderTop: '1px solid #f1f1f1', paddingTop: '1rem', textAlign: 'center' }}>
            <a 
              href="https://agriproducts-invest-exchange.mystrikingly.com" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: 'var(--primary)', fontSize: '0.75rem', fontWeight: '600', textDecoration: 'none' }}
            >
              🌐 Visit Our Official Website
            </a>
          </div>

        </div>
      </div>

      <div style={{ textAlign: 'center', paddingBottom: '1rem' }}>
        <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.7)' }}>
          🔒 Secure &nbsp;|&nbsp; 🌍 East Africa &nbsp;|&nbsp; 📱 Mobile Money
        </p>
      </div>
    </div>
  );
}
