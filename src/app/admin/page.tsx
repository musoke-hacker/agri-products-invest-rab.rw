"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Smartphone, 
  ListChecks, 
  CheckCircle2, 
  XCircle, 
  RefreshCcw, 
  DollarSign, 
  Wallet, 
  Award, 
  Users, 
  Search, 
  TrendingUp, 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight,
  Eye,
  Settings2,
  Trash2,
  UserPlus,
  Loader2,
  LogOut,
  Share2
} from 'lucide-react';
import '@/styles/design-system.css';

interface User {
  id: string;
  phone: string;
  name?: string;
  profileImage?: string;
  countryCode: string;
  balance: number;
  totalInvestment: number;
  totalEarnings: number;
  role: string;
  createdAt: string;
  referralCode: string;
  referredBy?: string;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  reference?: string;
  notes?: string;
  createdAt: string;
  user: {
    phone: string;
    id: string;
    name?: string;
  }
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'TRANSACTIONS' | 'CLIENTS' | 'REFERRALS' | 'SYSTEM'>('TRANSACTIONS');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [txFilter, setTxFilter] = useState<'ALL' | 'PENDING' | 'SUCCESSFUL' | 'REJECTED' | 'PROCESSING'>('PENDING');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [txsRes, usersRes] = await Promise.all([
        fetch('/api/admin/transactions').catch(() => null),
        fetch('/api/admin/users').catch(() => null)
      ]);
      
      if (txsRes && txsRes.ok) setTransactions(await txsRes.json());
      if (usersRes && usersRes.ok) setUsers(await usersRes.json());
      
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const stats = useMemo(() => {
    return {
      totalUsers: users.length,
      totalBalance: users.reduce((acc, u) => acc + (u.balance || 0), 0),
      pendingDeposits: transactions.filter(t => t.type === 'DEPOSIT' && t.status === 'PENDING').length,
      pendingWithdrawals: transactions.filter(t => t.type === 'WITHDRAWAL' && t.status === 'PENDING').length,
    };
  }, [users, transactions]);

  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      u.phone.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.referralCode && u.referralCode.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [users, searchQuery]);

  const referralsData = useMemo(() => {
    return users.filter(u => u.referredBy).map(u => ({
      user: u,
      inviter: users.find(inv => inv.referralCode === u.referredBy)
    }));
  }, [users]);

  const filteredTransactions = useMemo(() => {
    let filtered = transactions;
    if (txFilter !== 'ALL') {
      filtered = transactions.filter(t => t.status === txFilter);
    }
    return filtered.filter(t => 
      t.user.phone.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (t.user.name && t.user.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.reference && t.reference.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [transactions, txFilter, searchQuery]);

  const handleTxAction = async (id: string, type: string, action: string) => {
    if (!confirm(`Are you sure you want to mark this request as ${action.toLowerCase()}?`)) return;
    setProcessing(id);
    const endpoint = type === 'DEPOSIT' ? '/api/admin/deposits/approve' : '/api/admin/withdrawals/approve';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId: id, status: action }),
      });
      if (res.ok) {
        setTransactions(prev => prev.map(tx => tx.id === id ? { ...tx, status: action } : tx));
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to process');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      
      {/* QUICK STATS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
        <div className="premium-card" style={{ padding: '1rem', background: 'white' }}>
          <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>TOTAL CLIENTS</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stats.totalUsers}</h2>
            <Users size={20} color="var(--primary)" />
          </div>
        </div>
        <div className="premium-card" style={{ padding: '1rem', background: 'white' }}>
          <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>SYSTEM BALANCE</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>{stats.totalBalance.toLocaleString()}</h2>
            <DollarSign size={20} color="#16a34a" />
          </div>
        </div>
        <div className="premium-card" style={{ padding: '1rem', background: 'white' }}>
          <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>PENDING TASKS</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: (stats.pendingDeposits + stats.pendingWithdrawals) > 0 ? '#e11d48' : 'inherit' }}>
              {stats.pendingDeposits + stats.pendingWithdrawals}
            </h2>
            <Activity size={20} color="#e11d48" />
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div style={{ display: 'flex', gap: '0.5rem', background: '#f1f5f9', padding: '0.35rem', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
         {(['TRANSACTIONS', 'CLIENTS', 'REFERRALS', 'SYSTEM'] as const).map(tab => (
           <button 
             key={tab}
             onClick={() => setActiveTab(tab)}
             style={{ 
               flex: 1, padding: '0.7rem', borderRadius: '10px', border: 'none', 
               background: activeTab === tab ? 'white' : 'transparent',
               color: activeTab === tab ? 'var(--primary-dark)' : 'var(--text-muted)',
               fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer',
               boxShadow: activeTab === tab ? '0 2px 8px rgba(0,0,0,0.08)' : 'none'
             }}
           >
             {tab.charAt(0) + tab.slice(1).toLowerCase()}
           </button>
         ))}
      </div>

      {/* SEARCH BOX */}
      <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder={`Search ${activeTab.toLowerCase()}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 2.8rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.9rem' }}
          />
      </div>

      {/* TAB CONTENT: TRANSACTIONS */}
      {activeTab === 'TRANSACTIONS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
            {['ALL', 'PENDING', 'SUCCESSFUL', 'REJECTED'].map((f) => (
              <button 
                key={f}
                onClick={() => setTxFilter(f as any)}
                style={{ 
                  whiteSpace: 'nowrap', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700,
                  background: txFilter === f ? 'var(--primary)' : 'white',
                  color: txFilter === f ? 'white' : 'var(--text-muted)',
                  border: '1px solid #e2e8f0', cursor: 'pointer'
                }}
              >
                {f}
              </button>
            ))}
          </div>
          {loading ? <div style={{ textAlign: 'center', padding: '3rem' }}><Loader2 className="spin" size={32} /></div> : 
           filteredTransactions.length === 0 ? <div className="premium-card" style={{ textAlign: 'center', padding: '4rem' }}>No records found.</div> :
           filteredTransactions.map(tx => (
            <div key={tx.id} className="premium-card" style={{ background: 'white', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                     <div style={{ 
                       width: '38px', height: '38px', borderRadius: '10px', background: tx.type === 'DEPOSIT' ? '#f0fdf4' : '#fff1f2',
                       display: 'flex', alignItems: 'center', justifyContent: 'center', color: tx.type === 'DEPOSIT' ? '#16a34a' : '#e11d48'
                     }}>
                        {tx.type === 'DEPOSIT' ? <ArrowUpRight /> : <ArrowDownRight />}
                     </div>
                     <div>
                        <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>{tx.user.phone}</p>
                        <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{new Date(tx.createdAt).toLocaleString()}</p>
                     </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: 800 }}>{tx.amount.toLocaleString()} <span style={{fontSize: '0.6rem'}}>RWF</span></p>
                    <span style={{ fontSize: '0.6rem', padding: '2px 8px', borderRadius: '4px', background: '#f1f5f9', fontWeight: 800 }}>{tx.status}</span>
                  </div>
               </div>
               {tx.status === 'PENDING' && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => handleTxAction(tx.id, tx.type, 'SUCCESSFUL')} className="btn-primary" style={{ flex: 1, fontSize: '0.75rem', height: '34px', background: '#16a34a' }}>Approve</button>
                    <button onClick={() => handleTxAction(tx.id, tx.type, 'REJECTED')} style={{ flex: 1, height: '34px', background: 'transparent', color: '#e11d48', border: '1px solid #e11d48', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700 }}>Reject</button>
                  </div>
               )}
            </div>
           ))
          }
        </div>
      )}

      {/* TAB CONTENT: CLIENTS */}
      {activeTab === 'CLIENTS' && (
        <div className="premium-card" style={{ background: 'white', padding: 0, overflowX: 'auto', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
           <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)' }}>CLIENT</th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)' }}>BALANCE</th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)' }}>INVESTED</th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)' }}>REF CODE</th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '1rem' }}>
                      <p style={{ fontWeight: 700, fontSize: '0.85rem' }}>{u.phone}</p>
                      <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{u.name || 'No Name'}</p>
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 800, fontSize: '0.85rem' }}>{u.balance.toLocaleString()}</td>
                    <td style={{ padding: '1rem', fontSize: '0.85rem' }}>{u.totalInvestment.toLocaleString()}</td>
                    <td style={{ padding: '1rem', fontSize: '0.8rem' }}><code style={{background: '#f1f5f9', padding: '2px 5px', borderRadius: '4px'}}>{u.referralCode}</code></td>
                    <td style={{ padding: '1rem' }}>
                      <button style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}><Eye size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
           </table>
        </div>
      )}

      {/* TAB CONTENT: REFERRALS */}
      {activeTab === 'REFERRALS' && (
        <div className="premium-card" style={{ background: 'white', padding: 0, overflowX: 'auto', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
           <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '1rem', fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)' }}>NEW CLIENT</th>
                  <th style={{ padding: '1rem', fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)' }}>INVITED BY (REFERRED BY)</th>
                  <th style={{ padding: '1rem', fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)' }}>DATE JOINED</th>
                </tr>
              </thead>
              <tbody>
                {referralsData.length === 0 ? <tr><td colSpan={3} style={{textAlign: 'center', padding: '3rem'}}>No referral data found.</td></tr> :
                 referralsData.map((ref, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '1rem' }}>
                      <p style={{ fontWeight: 700, fontSize: '0.85rem' }}>{ref.user.phone}</p>
                      <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{ref.user.name || 'Anonymous'}</p>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Share2 size={14} color="var(--primary)" />
                        <div>
                           <p style={{ fontWeight: 700, fontSize: '0.85rem' }}>{ref.inviter?.phone || 'Unknown'}</p>
                           <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Code: {ref.user.referredBy}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(ref.user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
           </table>
        </div>
      )}

      {/* TAB CONTENT: SYSTEM */}
      {activeTab === 'SYSTEM' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
           <div className="premium-card" style={{ background: 'white' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Interest Distribution</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>Manually trigger daily profits for all active investments.</p>
              <button 
                onClick={async () => {
                  if(!confirm('Process earnings for all users?')) return;
                  setProcessing('sync');
                  try {
                    await fetch('/api/admin/cron/process-earnings', { method: 'POST' });
                    alert('Sync successful!');
                  } catch(e) { alert('Failed'); }
                  finally { setProcessing(null); }
                }}
                disabled={!!processing}
                className="btn-primary" style={{ width: '100%', height: '44px' }}>
                {processing === 'sync' ? 'Syncing...' : 'Sync All Client Earnings'}
              </button>
           </div>
           <div className="premium-card" style={{ background: '#1e293b', color: 'white' }}>
              <h4 style={{ fontSize: '0.85rem', marginBottom: '0.75rem' }}>System Health</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                 <span style={{opacity: 0.7}}>Database Connection</span>
                 <span style={{color: '#22c55e', fontWeight: 800}}>CONNECTED</span>
              </div>
           </div>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
        .premium-card { box-shadow: 0 4px 20px rgba(0,0,0,0.04); border: 1px solid #f1f5f9; }
      `}</style>
    </div>
  );
}
