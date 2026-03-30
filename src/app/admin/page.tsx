"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  Share2,
  MessageSquare,
  Send,
  ArrowLeft,
  Clock
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
  lastSeen?: string;
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
    profileImage?: string;
  }
}

interface SupportConversation {
  user: {
    id: string;
    phone: string;
    name?: string;
    profileImage?: string;
    lastSeen: string;
  };
  messages: any[];
  unreadCount: number;
  lastMessage: any;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'TRANSACTIONS' | 'CLIENTS' | 'REFERRALS' | 'SUPPORT' | 'SYSTEM'>('TRANSACTIONS');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [conversations, setConversations] = useState<SupportConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [txFilter, setTxFilter] = useState<'ALL' | 'PENDING' | 'SUCCESSFUL' | 'REJECTED' | 'PROCESSING'>('PENDING');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [activeChat, setActiveChat] = useState<SupportConversation | null>(null);
  const [replyText, setReplyText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [txsRes, usersRes, supportRes] = await Promise.all([
        fetch('/api/admin/transactions').catch(() => null),
        fetch('/api/admin/users').catch(() => null),
        fetch('/api/admin/support').catch(() => null)
      ]);
      
      if (txsRes && txsRes.ok) setTransactions(await txsRes.json());
      if (usersRes && usersRes.ok) setUsers(await usersRes.json());
      if (supportRes && supportRes.ok) setConversations(await supportRes.json());
      
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetch('/api/admin/support').then(res => res.json()).then(data => {
        if(Array.isArray(data)) {
          setConversations(data);
          // Auto-update active chat if open
          setActiveChat(prev => {
            if(!prev) return null;
            const updated = data.find((c: any) => c.user.id === prev.user.id);
            return updated || prev;
          });
        }
      });
    }, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    if(activeChat) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeChat?.messages]);

  const stats = useMemo(() => {
    return {
      totalUsers: users.length,
      totalBalance: users.reduce((acc, u) => acc + (u.balance || 0), 0),
      pendingDeposits: transactions.filter(t => t.type === 'DEPOSIT' && t.status === 'PENDING').length,
      pendingWithdrawals: transactions.filter(t => t.type === 'WITHDRAWAL' && t.status === 'PENDING').length,
      unreadMessages: conversations.reduce((acc, c) => acc + c.unreadCount, 0)
    };
  }, [users, transactions, conversations]);

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

  const filteredConversations = useMemo(() => {
    return conversations.filter(c => 
      c.user.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.user.name && c.user.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [conversations, searchQuery]);

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

  const handleDeleteUser = async (id: string, phone: string) => {
    if (!confirm(`🚨 CRITICAL: Are you sure you want to PERMANENTLY delete client ${phone}? This will erase all their transactions, investments, notifications, and balance. This action cannot be undone.`)) return;
    
    setProcessing(id);
    try {
      const res = await fetch('/api/admin/users/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id }),
      });
      if (res.ok) {
        setUsers(prev => prev.filter(u => u.id !== id));
        if (selectedUser?.id === id) setSelectedUser(null);
        alert('Client removed successfully');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to remove client');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setProcessing(null);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !activeChat) return;
    setProcessing('reply');
    try {
      const res = await fetch('/api/admin/support/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: activeChat.user.id, message: replyText.trim() })
      });
      const data = await res.json();
      if (res.ok) {
        setReplyText('');
        // Refresh conversations manually
        fetch('/api/admin/support').then(r => r.json()).then(d => {
           setConversations(d);
           const updated = d.find((c: any) => c.user.id === activeChat.user.id);
           if(updated) setActiveChat(updated);
        });
      } else {
        alert(data.error || 'Failed to send reply');
      }
    } catch(err) {
      alert('Network error');
    } finally {
      setProcessing(null);
    }
  };

  const isUserOnline = (lastSeen?: string) => {
    if (!lastSeen) return false;
    const diff = new Date().getTime() - new Date(lastSeen).getTime();
    return diff < 60000; // less than 1 min ago
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
      <div style={{ display: 'flex', gap: '0.5rem', background: '#f1f5f9', padding: '0.35rem', borderRadius: '14px', border: '1px solid #e2e8f0', overflowX: 'auto' }}>
         {(['TRANSACTIONS', 'CLIENTS', 'SUPPORT', 'REFERRALS', 'SYSTEM'] as const).map(tab => (
           <button 
             key={tab}
             onClick={() => setActiveTab(tab)}
             style={{ 
               flex: 1, padding: '0.7rem 1rem', borderRadius: '10px', border: 'none', 
               background: activeTab === tab ? 'white' : 'transparent',
               color: activeTab === tab ? 'var(--primary-dark)' : 'var(--text-muted)',
               fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer',
               boxShadow: activeTab === tab ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
               display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
               whiteSpace: 'nowrap'
             }}
           >
             {tab.charAt(0) + tab.slice(1).toLowerCase()}
             {tab === 'SUPPORT' && stats.unreadMessages > 0 && (
               <span style={{ background: '#e11d48', color: 'white', padding: '2px 6px', borderRadius: '10px', fontSize: '0.6rem' }}>
                 {stats.unreadMessages}
               </span>
             )}
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
                     <div style={{ width: '42px', height: '42px', borderRadius: '10px', overflow: 'hidden', border: '1.5px solid #f1f5f9', flexShrink: 0 }}>
                        {tx.user.profileImage ? (
                           <img src={tx.user.profileImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                           <div style={{ width: '100%', height: '100%', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                              <Users size={20} />
                           </div>
                        )}
                     </div>
                     <div>
                        <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>{tx.user.phone}</p>
                        <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                           <span style={{ color: tx.type === 'DEPOSIT' ? '#16a34a' : '#e11d48', fontWeight: 800 }}>{tx.type}</span> • {new Date(tx.createdAt).toLocaleString()}
                        </p>
                     </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: 800 }}>{tx.amount.toLocaleString()} <span style={{fontSize: '0.6rem'}}>RWF</span></p>
                    <span style={{ fontSize: '0.6rem', padding: '2px 8px', borderRadius: '4px', background: '#f1f5f9', fontWeight: 800 }}>{tx.status}</span>
                  </div>
               </div>
               {tx.status === 'PENDING' && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => handleTxAction(tx.id, tx.type, 'SUCCESSFUL')} className="btn-primary" style={{ flex: 1, fontSize: '0.75rem', height: '34px', background: '#16a34a' }}>Approve {tx.type === 'DEPOSIT' ? 'Deposit' : 'Withdrawal'}</button>
                    <button onClick={() => handleTxAction(tx.id, tx.type, 'REJECTED')} style={{ flex: 1, height: '34px', background: 'transparent', color: '#e11d48', border: '1px solid #e11d48', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700 }}>Reject {tx.type === 'DEPOSIT' ? 'Deposit' : 'Withdrawal'}</button>
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
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)' }}>PIC</th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)' }}>CLIENT</th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)' }}>STATUS</th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)' }}>BALANCE</th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)' }}>INVESTED</th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.5rem 1rem' }}>
                      <div 
                        onClick={() => setSelectedUser(u)}
                        style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', background: '#f1f5f9', border: '1px solid #e2e8f0', cursor: 'pointer' }}
                      >
                        {u.profileImage ? (
                          <img src={u.profileImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: '#94a3b8', fontWeight: 800 }}>
                            {u.phone.slice(-2)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <p style={{ fontWeight: 700, fontSize: '0.85rem' }}>{u.phone}</p>
                      <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{u.name || 'No Name'}</p>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {isUserOnline(u.lastSeen) ? (
                        <span style={{ fontSize: '0.7rem', color: '#22c55e', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e'}}></span> Online</span>
                      ) : (
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{u.lastSeen ? new Date(u.lastSeen).toLocaleDateString() : 'Never'}</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 800, fontSize: '0.85rem' }}>{u.balance.toLocaleString()}</td>
                    <td style={{ padding: '1rem', fontSize: '0.85rem' }}>{u.totalInvestment.toLocaleString()}</td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button 
                          onClick={() => setSelectedUser(u)}
                          style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(u.id, u.phone)}
                          disabled={!!processing}
                          style={{ background: 'none', border: 'none', color: '#e11d48', cursor: 'pointer', opacity: processing === u.id ? 0.5 : 1 }}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
           </table>
        </div>
      )}

      {/* TAB CONTENT: SUPPORT */}
      {activeTab === 'SUPPORT' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
           {filteredConversations.length === 0 ? <div className="premium-card" style={{ textAlign: 'center', padding: '4rem' }}>No conversations found.</div> :
           filteredConversations.map(conv => (
            <div 
              key={conv.user.id} 
              onClick={() => setActiveChat(conv)}
              className="premium-card" 
              style={{ background: 'white', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', transition: 'all 0.2s', border: conv.unreadCount > 0 ? '1px solid var(--primary-light)' : '1px solid #f1f5f9' }}
            >
               <div style={{ position: 'relative' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                    {conv.user.profileImage ? <img src={conv.user.profileImage} alt="" style={{width: '100%', height: '100%', objectFit: 'cover'}} /> : <Users size={20} color="var(--text-muted)" />}
                  </div>
                  {isUserOnline(conv.user.lastSeen) && (
                    <div style={{ position: 'absolute', bottom: '-4px', right: '-4px', width: '12px', height: '12px', background: '#22c55e', borderRadius: '50%', border: '2px solid white' }}></div>
                  )}
               </div>
               <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <p style={{ fontWeight: 800, fontSize: '0.9rem' }}>{conv.user.name || conv.user.phone}</p>
                     <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                     </p>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.2rem' }}>
                     <p style={{ fontSize: '0.8rem', color: conv.unreadCount > 0 ? 'var(--text)' : 'var(--text-muted)', fontWeight: conv.unreadCount > 0 ? 700 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                        {conv.lastMessage.fromAdmin ? 'You: ' : ''}{conv.lastMessage.message}
                     </p>
                     {conv.unreadCount > 0 && (
                        <div style={{ background: '#e11d48', color: 'white', fontSize: '0.65rem', fontWeight: 800, padding: '2px 6px', borderRadius: '10px' }}>
                           {conv.unreadCount} NEW
                        </div>
                     )}
                  </div>
               </div>
            </div>
           ))}
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

      {/* CLIENT DETAIL MODAL */}
      {selectedUser && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          padding: '1rem'
        }} onClick={() => setSelectedUser(null)}>
          <div className="premium-card" style={{ 
            background: 'white', width: '100%', maxWidth: '450px', 
            borderRadius: '24px', overflow: 'hidden',
            animation: 'modalFadeUp 0.3s ease-out'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ position: 'relative', height: '140px', background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)' }}>
               <button 
                 onClick={() => setSelectedUser(null)}
                 style={{ 
                   position: 'absolute', top: '15px', right: '15px', 
                   background: 'rgba(255,255,255,0.2)', border: 'none', 
                   color: 'white', width: '30px', height: '30px', borderRadius: '15px',
                   cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                 }}
               >
                 <LogOut size={16} />
               </button>
            </div>
            
            <div style={{ padding: '0 2rem 2rem', marginTop: '-60px', position: 'relative', textAlign: 'center' }}>
               <div style={{ 
                 width: '120px', height: '120px', borderRadius: '40px', 
                 margin: '0 auto 1.5rem', overflow: 'hidden', 
                 border: '6px solid white', background: '#f8fafc',
                 boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
               }}>
                 {selectedUser.profileImage ? (
                   <img src={selectedUser.profileImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                 ) : (
                   <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', color: 'var(--text-muted)' }}>
                     <Users size={48} />
                   </div>
                 )}
               </div>
               
               <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>{selectedUser.name || 'Anonymous Client'}</h2>
               <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{selectedUser.phone}</p>
               
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                  <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '16px', textAlign: 'left' }}>
                     <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>TOTAL BALANCE</p>
                     <p style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.1rem' }}>{selectedUser.balance.toLocaleString()} <span style={{fontSize: '0.6rem'}}>RWF</span></p>
                  </div>
                  <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '16px', textAlign: 'left' }}>
                     <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>TOTAL INVESTED</p>
                     <p style={{ fontWeight: 800, fontSize: '1.1rem' }}>{selectedUser.totalInvestment.toLocaleString()} <span style={{fontSize: '0.6rem'}}>RWF</span></p>
                  </div>
               </div>
               
               <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                 <button 
                   onClick={() => setSelectedUser(null)}
                   className="btn-primary" 
                   style={{ width: '100%', height: '48px', borderRadius: '14px' }}
                 >
                   Back to Dashboard
                 </button>
                 <button 
                   onClick={() => handleDeleteUser(selectedUser.id, selectedUser.phone)}
                   style={{ 
                     width: '100%', height: '48px', borderRadius: '14px',
                     background: 'transparent', color: '#e11d48', border: '1px solid #e11d48',
                     fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                   }}
                 >
                   <Trash2 size={16} /> Delete Permanent Account
                 </button>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* SUPPORT CHAT MODAL */}
      {activeChat && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 1100,
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
          animation: 'fadeIn 0.2s ease-out'
        }} onClick={() => setActiveChat(null)}>
          <div style={{ 
            background: '#f8fafc', width: '100%', height: '85vh', 
            borderTopLeftRadius: '24px', borderTopRightRadius: '24px',
            display: 'flex', flexDirection: 'column',
            animation: 'slideUp 0.3s ease-out'
          }} onClick={e => e.stopPropagation()}>
            
            {/* Chat header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'white', borderBottom: '1px solid #e2e8f0', borderTopLeftRadius: '24px', borderTopRightRadius: '24px' }}>
              <button onClick={() => setActiveChat(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}>
                 <ArrowLeft size={20} color="var(--text)" />
              </button>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f1f5f9', overflow: 'hidden' }}>
                {activeChat.user.profileImage ? <img src={activeChat.user.profileImage} style={{width:'100%', height:'100%', objectFit:'cover'}} alt="" /> : <Users size={20} style={{margin:'10px'}} />}
              </div>
              <div style={{ flex: 1 }}>
                 <p style={{ fontWeight: 800 }}>{activeChat.user.name || activeChat.user.phone}</p>
                 <p style={{ fontSize: '0.7rem', color: isUserOnline(activeChat.user.lastSeen) ? '#22c55e' : 'var(--text-muted)' }}>
                   {isUserOnline(activeChat.user.lastSeen) ? 'Online' : (activeChat.user.lastSeen ? `Last seen ${new Date(activeChat.user.lastSeen).toLocaleDateString()}` : 'Offline')}
                 </p>
              </div>
            </div>

            {/* Messages Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
               {[...activeChat.messages].reverse().map(msg => (
                 <div key={msg.id} style={{ display: 'flex', justifyContent: msg.fromAdmin ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      background: msg.fromAdmin ? 'var(--primary)' : 'white',
                      color: msg.fromAdmin ? 'white' : 'var(--text)',
                      padding: '0.75rem 1rem',
                      borderRadius: msg.fromAdmin ? '16px 16px 0 16px' : '16px 16px 16px 0',
                      maxWidth: '80%', border: msg.fromAdmin ? 'none' : '1px solid #e2e8f0',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                    }}>
                       <p style={{ fontSize: '0.85rem', lineHeight: 1.4 }}>{msg.message}</p>
                       <p style={{ fontSize: '0.6rem', color: msg.fromAdmin ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)', textAlign: 'right', marginTop: '0.2rem' }}>
                         {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                       </p>
                    </div>
                 </div>
               ))}
               <div ref={messagesEndRef} />
            </div>

            {/* Input block */}
            <div style={{ padding: '1rem', background: 'white', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '0.5rem' }}>
               <input 
                 type="text" 
                 value={replyText}
                 onChange={e => setReplyText(e.target.value)}
                 onKeyDown={e => e.key === 'Enter' && handleSendReply()}
                 placeholder="Type your reply..."
                 style={{ flex: 1, padding: '0.8rem 1rem', borderRadius: '20px', border: '1px solid #cbd5e1', outline: 'none', background: '#f8fafc' }}
               />
               <button 
                 onClick={handleSendReply}
                 disabled={!replyText.trim() || processing === 'reply'}
                 style={{ 
                   width: '46px', height: '46px', borderRadius: '50%', background: replyText.trim() ? 'var(--primary)' : '#e2e8f0',
                   border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: replyText.trim() ? 'pointer' : 'default'
                 }}
               >
                 <Send size={18} color={replyText.trim() ? 'white' : '#94a3b8'} />
               </button>
            </div>
            
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes modalFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .spin { animation: spin 1s linear infinite; }
        .premium-card { box-shadow: 0 4px 20px rgba(0,0,0,0.04); border: 1px solid #f1f5f9; }
        
        button::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
