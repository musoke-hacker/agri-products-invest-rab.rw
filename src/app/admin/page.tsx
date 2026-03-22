"use client";

import { useState, useEffect, useCallback } from 'react';
import { Smartphone, ListChecks, CheckCircle2, XCircle, RefreshCcw, DollarSign, Wallet, Award } from 'lucide-react';
import '@/styles/design-system.css';

interface Transaction {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAWAL';
  amount: number;
  status: 'PENDING' | 'SUCCESSFUL' | 'REJECTED' | 'PROCESSING';
  reference?: string;
  notes?: string;
  createdAt: string;
  user: {
    phone: string;
    id: string;
  }
}

export default function AdminDashboard() {
  const [pendingTxs, setPendingTxs] = useState<Transaction[]>([]);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchPendingTxs = useCallback(async () => {
    setLoading(true);
    try {
      const [txsRes, usersRes] = await Promise.all([
        fetch('/api/admin/transactions').catch(() => null),
        fetch('/api/admin/users').catch(() => null)
      ]);
      if (txsRes && txsRes.ok) {
        const data = await txsRes.json();
        setPendingTxs(data);
      }
      if (usersRes && usersRes.ok) {
         setRecentUsers(await usersRes.json());
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingTxs();
  }, [fetchPendingTxs]);

  const handleTxAction = async (id: string, type: 'DEPOSIT' | 'WITHDRAWAL', action: 'SUCCESSFUL' | 'REJECTED' | 'PROCESSING') => {
    if (!confirm(`Are you sure you want to mark this ${type.toLowerCase()} as ${action.toLowerCase()}?`)) return;
    
    setProcessing(id);
    const endpoint = type === 'DEPOSIT' ? '/api/admin/deposits/approve' : '/api/admin/withdrawals/approve';
    
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId: id, status: action }),
      });
      
      if (res.ok) {
        setPendingTxs(prev => prev.filter(tx => tx.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to process');
      }
    } catch (err) {
      alert('Network error while processing');
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem' }}>
       <div className="premium-card" style={{ background: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ListChecks size={24} color="var(--primary)" /> Manage Transactions
            </h3>
            <button 
              onClick={fetchPendingTxs} 
              disabled={loading}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600 }}
            >
              <RefreshCcw size={18} className={loading ? 'spin' : ''} /> Refresh
            </button>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
             Verify user deposits and process withdrawal requests manually.
          </p>
       </div>

       <div className="premium-card" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award size={20} color="var(--primary)" /> System Controls
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <button 
              onClick={async () => {
                if(!confirm('This will process daily earnings for ALL users. Continue?')) return;
                setProcessing('earnings');
                try {
                  const res = await fetch('/api/admin/cron/process-earnings', { method: 'POST' });
                  const data = await res.json();
                  alert(data.message || 'Processed!');
                } catch(e) { alert('Failed'); }
                finally { setProcessing(null); }
              }}
              disabled={!!processing}
              className="btn-primary" 
              style={{ fontSize: '0.8rem', height: '40px', background: 'var(--primary-dark)' }}
            >
              {processing === 'earnings' ? '...' : 'Sync Earnings'}
            </button>
            <button 
              onClick={fetchPendingTxs}
              className="btn-primary" 
              style={{ fontSize: '0.8rem', height: '40px', background: 'white', color: 'var(--primary)', border: '1px solid var(--primary)' }}
            >
              Check Requests
            </button>
          </div>
       </div>

       {loading && pendingTxs.length === 0 ? (
         <div style={{ textAlign: 'center', padding: '3rem' }}>
            <RefreshCcw size={48} className="spin" style={{ opacity: 0.2, marginBottom: '1rem' }} />
            <p>Scanning for transactions...</p>
         </div>
       ) : pendingTxs.length === 0 ? (
         <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '16px', border: '1px solid var(--accent)' }}>
            <Smartphone size={64} style={{ opacity: 0.1, marginBottom: '1.5rem' }} />
            <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>All clear! No pending tasks.</p>
         </div>
       ) : (
         <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
               <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.5px' }}>
                 NEW ACCOUNTS
               </h4>
               <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                  {recentUsers.map((u) => (
                    <div key={u.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'white', padding: '1rem', borderRadius: '16px', minWidth: '120px', border: '1px solid var(--accent)' }}>
                       <div style={{ width: '60px', height: '60px', borderRadius: '30px', background: '#eee', overflow: 'hidden', marginBottom: '0.5rem', border: '2px solid var(--primary-light)' }}>
                          {u.profileImage ? <img src={u.profileImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '1.5rem' }}>👤</span>}
                       </div>
                       <p style={{ fontWeight: 700, fontSize: '0.85rem' }}>{u.phone}</p>
                       <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>+{u.countryCode}</p>
                    </div>
                  ))}
               </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.5px' }}>
              PENDING ({pendingTxs.length})
            </h4>
            {pendingTxs.map((tx) => (
              <div key={tx.id} className="premium-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '10px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      background: tx.type === 'DEPOSIT' ? '#f0fdf4' : '#fff1f2',
                      color: tx.type === 'DEPOSIT' ? '#16a34a' : '#e11d48'
                    }}>
                      {tx.type === 'DEPOSIT' ? <DollarSign size={20} /> : <Wallet size={20} />}
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: '1rem' }}>{tx.type} request</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(tx.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '1.1rem', fontWeight: 800 }}>{tx.amount.toLocaleString()} RWF</p>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: 'var(--accent)', color: 'var(--primary-dark)' }}>
                      {tx.status}
                    </span>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <p style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}><strong>User:</strong> {tx.user.phone}</p>
                  {tx.reference && <p style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}><strong>Reference ID:</strong> <code style={{ background: '#e2e8f0', padding: '2px 4px', borderRadius: '4px' }}>{tx.reference}</code></p>}
                  {tx.notes && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}><strong>Ref:</strong> {tx.notes}</p>}
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button 
                    disabled={!!processing}
                    onClick={() => handleTxAction(tx.id, tx.type, 'SUCCESSFUL')}
                    className="btn-primary" 
                    style={{ flex: 1, height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: '#16a34a' }}
                  >
                    {processing === tx.id ? '...' : <><CheckCircle2 size={18} /> Approve</>}
                  </button>
                  <button 
                    disabled={!!processing}
                    onClick={() => handleTxAction(tx.id, tx.type, 'REJECTED')}
                    style={{ flex: 1, height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', borderRadius: '12px', border: '1px solid #ef4444', color: '#ef4444', background: 'transparent', fontWeight: 700 }}
                  >
                    {processing === tx.id ? '...' : <><XCircle size={18} /> Reject</>}
                  </button>
                </div>
              </div>
            ))}
         </div>
         </div>
       )}

       <style>{`
         @keyframes spin {
           from { transform: rotate(0deg); }
           to { transform: rotate(360deg); }
         }
         .spin {
           animation: spin 1s linear infinite;
         }
       `}</style>
    </div>
  );
}
