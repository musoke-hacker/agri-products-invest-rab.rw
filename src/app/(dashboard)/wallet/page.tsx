"use client";

import { useState, useEffect } from 'react';
import { Wallet, ArrowDownCircle, ArrowUpCircle, History, Landmark, Copy, Check, Clock } from 'lucide-react';
import '@/styles/design-system.css';

export default function WalletPage() {
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'history'>('deposit');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Form states
  const [depositData, setDepositData] = useState({ amount: '', reference: '' });
  const [withdrawAmount, setWithdrawAmount] = useState('');

  useEffect(() => {
    fetchStats();
    fetchHistory();
  }, []);

  const fetchStats = async () => {
    const res = await fetch('/api/user/stats');
    const data = await res.json();
    setBalance(data.balance);
    setLoading(false);
  };

  const fetchHistory = async () => {
    const res = await fetch('/api/wallet/history');
    const data = await res.json();
    setHistory(Array.isArray(data) ? data : []);
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parseFloat(depositData.amount) < 5000) {
      alert('Minimum deposit amount is 5,000 RWF.');
      return;
    }
    try {
      const res = await fetch('/api/wallet/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(depositData),
      });
      const data = await res.json();
      if (!res.ok) alert(data.error);
      else {
        alert(`Deposit request submitted! Please send ${parseFloat(depositData.amount).toLocaleString()} RWF to +250795438363 immediately if you haven't already.`);
        setDepositData({ amount: '', reference: '' });
        fetchHistory();
      }
    } catch (err) {
      alert('Failed to submit deposit');
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);
    if (amount > balance) {
      alert(`Insufficient Funds! Your balance is ${balance.toLocaleString()} RWF.`);
      return;
    }
    if (amount < 2000) {
      alert(`Minimum withdrawal is 2000 RWF.`);
      return;
    }
    try {
      const res = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: withdrawAmount }),
      });
      const data = await res.json();
      if (!res.ok) alert(data.error);
      else {
        alert('Withdrawal request submitted!');
        setWithdrawAmount('');
        fetchStats();
        fetchHistory();
      }
    } catch (err) {
      alert('Failed to submit withdrawal');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'SUCCESSFUL': return { bg: '#dcfce7', color: '#16a34a' };
      case 'PROCESSING': return { bg: '#e0f2fe', color: '#0284c7' };
      case 'PENDING': return { bg: '#fffbeb', color: '#d97706' };
      case 'REJECTED': return { bg: '#fee2e2', color: '#dc2626' };
      default: return { bg: '#f3f4f6', color: '#6b7280' };
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Wallet...</div>;

  return (
    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="premium-card" style={{ background: 'var(--primary)', color: 'white', border: 'none', textAlign: 'center' }}>
        <p style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: '0.5rem' }}>My Total Balance</p>
        <h1 style={{ color: 'white', fontSize: '2.5rem' }}>{balance.toLocaleString()} <span style={{ fontSize: '1rem' }}>RWF</span></h1>
      </div>

      <div style={{ display: 'flex', background: 'white', padding: '0.4rem', borderRadius: '12px', gap: '0.25rem', border: '1px solid var(--accent)' }}>
        <button 
           onClick={() => setActiveTab('deposit')}
           style={{ flex: 1, padding: '0.75rem 0.25rem', borderRadius: '8px', border: 'none', background: activeTab === 'deposit' ? 'var(--accent)' : 'transparent', color: activeTab === 'deposit' ? 'var(--primary-dark)' : 'var(--text-muted)', fontWeight: '700', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
        >
          <ArrowDownCircle size={14} /> DEPOSIT
        </button>
        <button 
           onClick={() => setActiveTab('withdraw')}
           style={{ flex: 1, padding: '0.75rem 0.25rem', borderRadius: '8px', border: 'none', background: activeTab === 'withdraw' ? 'var(--accent)' : 'transparent', color: activeTab === 'withdraw' ? 'var(--primary-dark)' : 'var(--text-muted)', fontWeight: '700', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
        >
          <ArrowUpCircle size={14} /> WITHDRAW
        </button>
        <button 
           onClick={() => setActiveTab('history')}
           style={{ flex: 1, padding: '0.75rem 0.25rem', borderRadius: '8px', border: 'none', background: activeTab === 'history' ? 'var(--accent)' : 'transparent', color: activeTab === 'history' ? 'var(--primary-dark)' : 'var(--text-muted)', fontWeight: '700', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
        >
           <History size={14} /> TRANSACTIONS
        </button>
      </div>

      {activeTab === 'deposit' && (
        <div className="premium-card">
          <div style={{ background: '#f0fdf4', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
            <h4 style={{ color: 'var(--primary-dark)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Deposit Instructions</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Send Mobile Money to the official number below. After sending, enter the amount and transaction reference ID.
            </p>
            <div style={{ marginTop: '1rem', padding: '1rem', background: 'white', borderRadius: '8px', border: '1px dashed var(--primary-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Momo Number</p>
                  <p style={{ fontWeight: '800', fontSize: '1rem' }}>+250795438363</p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: '600' }}>MUSOKE EDWARD</p>
               </div>
               <button onClick={() => copyToClipboard('+250795438363')} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}>
                 {copied ? <Check size={20} /> : <Copy size={20} />}
               </button>
            </div>
          </div>

          <form onSubmit={handleDeposit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
             <div className="input-group">
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>DEPOSIT AMOUNT (RWF)</label>
                 <input 
                  type="number" 
                  placeholder="Min 5,000" 
                  value={depositData.amount}
                  onChange={(e) => setDepositData({...depositData, amount: e.target.value})}
                  required
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--accent)', marginTop: '0.25rem' }} 
                />
                {depositData.amount && parseFloat(depositData.amount) >= 5000 && (
                  <p style={{ fontSize: '0.7rem', color: 'var(--success)', fontWeight: '700', marginTop: '0.4rem' }}>
                    ✅ Amount valid. Please send {parseFloat(depositData.amount).toLocaleString()} RWF to +250795438363.
                  </p>
                )}
             </div>
             <div className="input-group">
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>TRANSACTION REFERENCE ID</label>
                <input 
                  type="text" 
                  placeholder="Paste transaction ref from SMS" 
                  value={depositData.reference}
                  onChange={(e) => setDepositData({...depositData, reference: e.target.value})}
                  required
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--accent)', marginTop: '0.25rem' }} 
                />
                {depositData.reference && depositData.reference.length > 5 && (
                  <p style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: '700', marginTop: '0.4rem' }}>
                    Once ready, click "Confirm Deposit" to notify the admin.
                  </p>
                )}
             </div>
             <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }}>Confirm Deposit</button>
          </form>
        </div>
      )}

      {activeTab === 'withdraw' && (
        <div className="premium-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: 'var(--warning)', background: '#fffbeb', padding: '0.75rem', borderRadius: '8px' }}>
            <Clock size={20} />
            <p style={{ fontSize: '0.75rem', fontWeight: '600' }}>Withdrawals are processed within 24 hours. Frequency: Once every 5 days.</p>
          </div>

          <form onSubmit={handleWithdraw} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
             <div className="input-group">
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>WITHDRAW AMOUNT (RWF)</label>
                <input 
                  type="number" 
                  placeholder="Min 2,000" 
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--accent)', marginTop: '0.25rem' }} 
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                   <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Withdrawal Fee: <span style={{fontWeight: 700}}>10%</span></p>
                   {withdrawAmount && parseFloat(withdrawAmount) >= 2000 && (
                     <p style={{ fontSize: '0.7rem', color: 'var(--success)', fontWeight: 700 }}>
                       You will receive: {(parseFloat(withdrawAmount) * 0.9).toLocaleString()} RWF
                     </p>
                   )}
                </div>
             </div>
             <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                Funds will be sent to your registered number after approval.
             </div>
             <button type="submit" className="btn-primary">Request Withdrawal</button>
          </form>
        </div>
      )}

      {activeTab === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'white', borderRadius: '16px', border: '1px solid var(--accent)' }}>
               <History size={40} color="var(--text-muted)" style={{ marginBottom: '1rem', opacity: 0.3 }} />
               <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No transactions found yet.</p>
            </div>
          ) : (
            history.map((tx) => {
              const style = getStatusStyle(tx.status);
              return (
                <div key={tx.id} className="premium-card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <div style={{ background: tx.type === 'DEPOSIT' ? '#dcfce7' : '#fee2e2', padding: '0.5rem', borderRadius: '10px' }}>
                       {tx.type === 'DEPOSIT' ? <ArrowDownCircle size={20} color="#16a34a" /> : <ArrowUpCircle size={20} color="#dc2626" /> }
                    </div>
                    <div>
                      <p style={{ fontSize: '0.85rem', fontWeight: '700' }}>{tx.type}</p>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(tx.createdAt).toLocaleDateString()} at {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '1rem', fontWeight: '800', color: tx.type === 'DEPOSIT' || tx.type === 'EARNINGS' ? 'var(--success)' : 'var(--danger)' }}>
                       {tx.type === 'DEPOSIT' || tx.type === 'EARNINGS' ? '+' : '-'}{tx.amount.toLocaleString()}
                    </p>
                    <span style={{ fontSize: '0.6rem', fontWeight: '800', background: style.bg, color: style.color, padding: '2px 8px', borderRadius: '6px' }}>{tx.status}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
