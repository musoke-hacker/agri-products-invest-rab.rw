"use client";

import { useState, useEffect, useCallback } from 'react';
import { Smartphone, ListChecks } from 'lucide-react';
import '@/styles/design-system.css';

export default function AdminDashboard() {
  const [pendingTxs, setPendingTxs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPendingTxs = useCallback(async () => {
    try {
      // Placeholder for actual fetch logic
      setPendingTxs([]);
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchPendingTxs();
  }, [fetchPendingTxs]);

  const approveTx = async (id: string, type: 'DEPOSIT' | 'WITHDRAWAL', action: 'SUCCESSFUL' | 'REJECTED') => {
    const endpoint = type === 'DEPOSIT' ? '/api/admin/deposits/approve' : '/api/admin/withdrawals/approve';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId: id, status: action }),
      });
      if (res.ok) {
        alert('Action successful');
        fetchPendingTxs();
      }
    } catch (err) {
      alert('Failed to process transaction');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
       <div className="premium-card" style={{ background: 'white' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ListChecks size={20} color="var(--primary)" /> Pending Approvals
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
             Manage user deposits and withdrawal requests.
          </p>
       </div>

       {loading ? (
         <div style={{ textAlign: 'center', padding: '2rem' }}>Loading transactions...</div>
       ) : pendingTxs.length === 0 ? (
         <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            <Smartphone size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
            <p>No pending transactions found.</p>
            <button onClick={fetchPendingTxs} className="btn-primary" style={{ marginTop: '1rem', width: 'auto' }}>Refresh Feed</button>
         </div>
       ) : (
         <div className="tx-list">
            {/* Map through pendingTxs here */}
            {console.log('Approve function available for use:', !!approveTx)}
         </div>
       )}
    </div>
  );
}
