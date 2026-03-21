"use client";

import { useState, useEffect } from 'react';
import { Package, TrendingUp, Clock, Flame, ChevronRight } from 'lucide-react';
import '@/styles/design-system.css';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      });
  }, []);

  const handleBuy = async (productId: string) => {
    if (!confirm('Confirm investment in this product?')) return;
    setBuying(productId);
    try {
      const res = await fetch('/api/investments/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      if (!res.ok) alert(data.error);
      else alert('Investment successful!');
    } catch (err) {
      alert('Failed to buy');
    } finally {
      setBuying(null);
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Products...</div>;

  return (
    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ marginBottom: '0.5rem' }}>
        <h2 style={{ fontSize: '1.25rem' }}>Investment Products</h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Choose a tool to start earning</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {products.map((p) => (
          <div key={p.id} className="premium-card" style={{ display: 'flex', gap: '1rem', padding: '1rem' }}>
            <div style={{ width: '80px', height: '80px', background: '#f5f5f5', borderRadius: '12px', overflow: 'hidden', flexShrink: 0 }}>
              <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--primary)', letterSpacing: '1px' }}>{p.code}</span>
                {p.status === 'Hot' && (
                  <span className="status-badge status-hot" style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <Flame size={10} /> {p.status}
                  </span>
                )}
              </div>
              <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>{p.name}</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                <div>
                   <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Daily Income</p>
                   <p style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--success)' }}>{p.dailyIncome.toLocaleString()} RWF</p>
                </div>
                <div>
                   <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>5-Day Returns</p>
                   <p style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--primary)' }}>{p.cycleIncome.toLocaleString()} RWF</p>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Price</p>
                  <p style={{ fontSize: '1.1rem', fontWeight: '800' }}>{p.price.toLocaleString()} RWF</p>
                </div>
                <button 
                  onClick={() => handleBuy(p.id)}
                  disabled={buying === p.id}
                  className="btn-primary" 
                  style={{ width: 'auto', padding: '0.6rem 1.25rem', borderRadius: '10px' }}
                >
                  {buying === p.id ? '...' : 'Invest'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
