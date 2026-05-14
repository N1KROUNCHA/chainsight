import { useState, useEffect } from 'react';
import { api } from '../api';

const EVENT_ICONS = {
  ORDER_CREATED: '📝',
  DISPATCHED: '🚀',
  DELIVERED: '✅',
  STATUS_UPDATE: '🔄',
  TRANSPORTER_ASSIGNED: '🤝',
  SYSTEM_INIT: '⚙️',
  INVENTORY_SYNC: '📦',
};

export default function BlockchainLiveFeed() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      const data = await api.blockchain();
      setEvents(data.events.slice(0, 10)); // Top 10 recent
    } catch (err) {
      console.error('Feed failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, []);

  if (loading && events.length === 0) return <div className="loading-ring-small" />;

  return (
    <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div className="card-header" style={{ padding: '12px 16px', background: 'rgba(59,130,246,0.05)' }}>
        <div className="card-title" style={{ fontSize: 13 }}>
          <span className="live-indicator" /> 🔗 Live Blockchain Ledger
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px', maxHeight: 400 }}>
        {events.map((e, idx) => (
          <div key={e.txHash || idx} className="feed-item" style={{ 
            padding: '12px 0', 
            borderBottom: idx === events.length - 1 ? 'none' : '1px solid var(--border)',
            animation: idx === 0 ? 'slideIn 0.3s ease-out' : 'none'
          }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ 
                width: 32, height: 32, borderRadius: 8, 
                background: 'var(--bg-card-2)', border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                {EVENT_ICONS[e.eventType] || '⛓️'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)' }}>{e.eventType.replace('_', ' ')}</span>
                  <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>{new Date(e.timestamp).toLocaleTimeString()}</span>
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--text-primary)', lineHeight: '1.4' }}>
                  {e.details}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                   <span style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
                    {e.txHash.substring(0, 14)}...
                  </span>
                  <span style={{ fontSize: 8, padding: '1px 4px', background: 'var(--green-soft)', color: 'var(--green)', borderRadius: 4, fontWeight: 700 }}>IMMUTABLE</span>
                </div>
              </div>
            </div>
          </div>
        ))}
        {events.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: 11 }}>
            <div style={{ fontSize: 24, marginBottom: 12 }}>⛓️</div>
            Waiting for on-chain events...
          </div>
        )}
      </div>
      <div style={{ padding: 12, textAlign: 'center', borderTop: '1px solid var(--border)', background: 'var(--bg-card-2)' }}>
        <a href="/blockchain" style={{ fontSize: 11, color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>VIEW FULL AUDIT TRAIL →</a>
      </div>
      <style>{`
        .live-indicator {
          width: 8px; height: 8px; background: #10b981; border-radius: 50%; display: inline-block;
          margin-right: 8px; box-shadow: 0 0 8px #10b981; animation: pulse 2s infinite;
        }
        @keyframes pulse { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.2); } 100% { opacity: 1; transform: scale(1); } }
        @keyframes slideIn { from { transform: translateX(-10px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .feed-item:hover { background: var(--bg-hover-soft); cursor: default; }
      `}</style>
    </div>
  );
}
