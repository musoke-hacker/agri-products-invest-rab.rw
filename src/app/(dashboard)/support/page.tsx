"use client";

import { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, Clock, CheckCheck, Headphones } from 'lucide-react';
import '@/styles/design-system.css';

export default function SupportPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/support/messages');
      const data = await res.json();
      if (Array.isArray(data)) setMessages(data);
    } catch (e) {}
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 8000); // poll every 8s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    setSending(true);
    try {
      const res = await fetch('/api/support/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessages(prev => [...prev, data]);
        setInput('');
      } else {
        alert(data.error || 'Failed to send message');
      }
    } catch (e) {
      alert('Network error. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #083d22 0%, #1b5e38 100%)',
        padding: '1rem 1.25rem',
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        boxShadow: '0 2px 10px rgba(0,0,0,0.15)'
      }}>
        <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '12px', padding: '0.5rem' }}>
          <Headphones size={22} color="white" />
        </div>
        <div>
          <p style={{ color: 'white', fontWeight: '800', fontSize: '1rem' }}>Support Center</p>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.7rem' }}>Admin team is here to help you</p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 6px #22c55e' }}></span>
          <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.65rem', fontWeight: '700' }}>Online</span>
        </div>
      </div>

      {/* Messages Area */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '1rem',
        background: '#f8faf9', display: 'flex', flexDirection: 'column', gap: '0.75rem'
      }}>
        {/* Welcome bubble */}
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <div style={{
            background: 'white', border: '1px solid #e2e8f0',
            padding: '0.85rem 1rem', borderRadius: '0 16px 16px 16px',
            maxWidth: '80%', boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}>
            <p style={{ fontSize: '0.85rem', color: '#1e293b', lineHeight: 1.5 }}>
              👋 Hello! Welcome to AGRI-PRODUCTS Support. How can we help you today?
            </p>
            <p style={{ fontSize: '0.6rem', color: '#94a3b8', marginTop: '0.35rem' }}>Admin Team</p>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem', padding: '2rem' }}>
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <MessageCircle size={40} color="#cbd5e1" style={{ marginBottom: '0.75rem' }} />
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No messages yet. Send your first message below!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} style={{ display: 'flex', justifyContent: msg.fromAdmin ? 'flex-start' : 'flex-end' }}>
              <div style={{
                padding: '0.75rem 1rem',
                borderRadius: msg.fromAdmin ? '0 16px 16px 16px' : '16px 0 16px 16px',
                maxWidth: '80%',
                background: msg.fromAdmin ? 'white' : 'var(--primary)',
                color: msg.fromAdmin ? '#1e293b' : 'white',
                border: msg.fromAdmin ? '1px solid #e2e8f0' : 'none',
                boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
              }}>
                <p style={{ fontSize: '0.85rem', lineHeight: 1.5 }}>{msg.message}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '0.3rem', justifyContent: 'flex-end' }}>
                  <Clock size={10} color={msg.fromAdmin ? '#94a3b8' : 'rgba(255,255,255,0.7)'} />
                  <p style={{ fontSize: '0.6rem', color: msg.fromAdmin ? '#94a3b8' : 'rgba(255,255,255,0.7)' }}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  {!msg.fromAdmin && <CheckCheck size={12} color={msg.isRead ? '#22c55e' : 'rgba(255,255,255,0.6)'} />}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div style={{
        background: 'white', borderTop: '1px solid #e2e8f0',
        padding: '0.75rem 1rem', display: 'flex', gap: '0.75rem', alignItems: 'center'
      }}>
        <input
          type="text"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !sending && handleSend()}
          style={{
            flex: 1, padding: '0.75rem 1rem', borderRadius: '20px',
            border: '1.5px solid #e2e8f0', outline: 'none', fontSize: '0.9rem',
            background: '#f8faf9'
          }}
        />
        <button
          onClick={handleSend}
          disabled={sending || !input.trim()}
          style={{
            width: '44px', height: '44px', borderRadius: '50%',
            background: input.trim() ? 'var(--primary)' : '#e2e8f0',
            border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: input.trim() ? 'pointer' : 'default', transition: 'all 0.2s',
            flexShrink: 0
          }}
        >
          <Send size={18} color={input.trim() ? 'white' : '#94a3b8'} />
        </button>
      </div>
    </div>
  );
}
