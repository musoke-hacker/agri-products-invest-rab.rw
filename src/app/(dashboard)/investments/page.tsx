"use client";

import { useState, useEffect } from 'react';
import { Award, TrendingUp, Clock, Calendar, ChevronRight } from 'lucide-react';
import '@/styles/design-system.css';

export default function InvestmentsPage() {
  const [investments, setInvestments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/investments')
      .then(res => res.json())
      .then(data => {
        setInvestments(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Your Tools...</div>;

  return (
    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ marginBottom: '0.5rem' }}>
        <h2 style={{ fontSize: '1.25rem' }}>My Active Tools</h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Track your daily earnings per product</p>
      </div>

      {investments.length === 0 ? (
        <div className="premium-card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <Award size={48} color="var(--accent)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>You haven't invested in any tools yet.</p>
          <button 
            onClick={() => window.location.href = '/products'}
            className="btn-primary" 
            style={{ width: 'auto', padding: '0.75rem 2rem' }}
          >
            Go to Market
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {investments.map((inv) => (
            <div key={inv.id} className="premium-card" style={{ display: 'flex', gap: '1rem', padding: '1rem', borderLeft: '4px solid var(--primary)' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0 }}>
                <img src={inv.product.image} alt={inv.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: '700' }}>{inv.product.name}</h3>
                  <span style={{ fontSize: '0.6rem', fontWeight: '800', background: 'var(--accent)', color: 'var(--primary-dark)', padding: '2px 8px', borderRadius: '6px' }}>{inv.product.code}</span>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <div>
                    <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Daily Income</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <TrendingUp size={12} color="var(--success)" />
                      <p style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--success)' }}>{inv.product.dailyIncome.toLocaleString()} RWF</p>
                    </div>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Invested</p>
                    <p style={{ fontSize: '0.85rem', fontWeight: '700' }}>{inv.amount.toLocaleString()} RWF</p>
                  </div>
                </div>

                <div style={{ background: '#f8faf9', padding: '0.6rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={12} color="var(--text-muted)" />
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Ends: {new Date(inv.endDate).toLocaleDateString()}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={12} color="var(--primary)" />
                    <p style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: '700' }}>Cycle: {inv.cycleCount + 1}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Section */}
      <div style={{ background: '#f0fdf4', padding: '1rem', borderRadius: '12px', border: '1px solid #dcfce7', marginTop: '1rem' }}>
        <h4 style={{ fontSize: '0.85rem', color: 'var(--primary-dark)', marginBottom: '0.5rem' }}>How earnings work</h4>
        <ul style={{ fontSize: '0.75rem', color: 'var(--text-muted)', paddingLeft: '1.2rem', lineHeight: '1.6' }}>
          <li>Earnings are automatically added to your balance every 24 hours.</li>
          <li>Each tool runs for a 5-day cycle.</li>
          <li>You can withdraw your capital + profit at the end of the cycle.</li>
        </ul>
      </div>
    </div>
  );
}
