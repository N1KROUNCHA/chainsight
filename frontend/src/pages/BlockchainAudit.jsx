import { useEffect, useState } from 'react';
import { api } from '../api';

const EVENT_META = {
  ORDER_CREATED:        { icon: '📝', color: 'var(--accent)',   bg: 'var(--blue-soft)' },
  DISPATCHED:           { icon: '🚀', color: 'var(--accent)',   bg: 'var(--blue-soft)' },
  DELIVERED:            { icon: '✅', color: 'var(--green)',    bg: 'var(--green-soft)' },
  STATUS_UPDATE:        { icon: '🔄', color: 'var(--accent-3)', bg: 'rgba(6,182,212,0.12)' },
  TRANSPORTER_ASSIGNED: { icon: '🤝', color: 'var(--accent-2)', bg: 'var(--purple-soft)' },
  SYSTEM_INIT:          { icon: '⚙️', color: 'var(--text-muted)', bg: 'var(--bg-card-2)' },
  INVENTORY_SYNC:       { icon: '📦', color: 'var(--yellow)',   bg: 'var(--yellow-soft)' },
};

function BlockchainBlock({ event }) {
  const meta = EVENT_META[event.eventType] || { icon: '📝', color: 'var(--text-muted)', bg: 'var(--bg-card-2)' };
  return (
    <div style={{
      display: 'flex', gap: 16, padding: '16px 0',
      borderBottom: '1px solid var(--border)', alignItems: 'flex-start',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 36, flexShrink: 0 }}>
        <div style={{ width: 36, height: 36, borderRadius: 9, background: meta.bg, border: `1px solid ${meta.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>
          {meta.icon}
        </div>
        <div style={{ width: 1, flex: 1, minHeight: 12, background: 'var(--border)', marginTop: 4 }} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: meta.color }}>{event.eventType.replace('_', ' ')}</span>
          <span className="tx-hash">{event.txHash}</span>
          <span className="badge ok" style={{ fontSize: 10 }}>✓ Immutable</span>
        </div>

        <div style={{ fontSize: 14, color: 'var(--text-primary)', marginBottom: 8, fontWeight: 500 }}>
          {event.details}
        </div>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 4 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Role: <strong style={{ color: 'var(--accent)' }}>{event.entityRole}</strong></span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Entity ID: <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--text-secondary)' }}>{event.entityId}</span></span>
        </div>

        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Timestamp: {new Date(event.timestamp).toLocaleString('en-IN')}</span>
        </div>
      </div>
    </div>
  );
}

export default function BlockchainAudit() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    api.blockchain()
      .then(d => { 
        setData(Array.isArray(d) ? d : []); 
        setLoading(false); 
      })
      .catch((err) => {
        console.error('Blockchain fetch error:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="loading-ring" />;
  
  const events = data || [];
  const contractInfo = {
    address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    chainId: '1337', // Geth/Hardhat Local
    total: events.length
  };

  const eventTypes = ['ALL', ...Object.keys(EVENT_META)];
  const filtered = filter === 'ALL' ? events : events.filter(e => e.eventType === filter);
  
  const typeCounts = {};
  events.forEach(e => { typeCounts[e.eventType] = (typeCounts[e.eventType] || 0) + 1; });

  return (
    <div>
      <div className="page-header">
        <div className="page-title">🔗 Blockchain Audit & Transparency Layer</div>
        <div className="page-desc">Tamper-proof, immutable on-chain event ledger — every supply chain action recorded</div>
      </div>

      {/* Contract info */}
      <div className="card" style={{ marginBottom: 24, background: 'var(--bg-card-2)', borderColor: '#3b82f640' }}>
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 4 }}>Smart Contract Address</div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: 'var(--accent)' }}>{contractInfo.address}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 4 }}>Chain ID</div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: 'var(--green)' }}>{contractInfo.chainId} (Local Devnet)</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 4 }}>Total Events</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>{contractInfo.total}</div>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {Object.entries(typeCounts).map(([type, count]) => (
              <div key={type} className="metric-chip">
                <span style={{ fontSize: 12 }}>{EVENT_META[type]?.icon}</span>
                <span className="lbl">{type}</span>
                <span className="val">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {eventTypes.map(t => (
          <button key={t} className={`btn ${filter === t ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter(t)} style={{ fontSize: 11 }}>
            {t === 'ALL' ? 'All Events' : `${EVENT_META[t]?.icon} ${t}`}
          </button>
        ))}
      </div>

      <div className="grid-3-1" style={{ gap: 20 }}>
        {/* Event log */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <div className="card-icon" style={{ background: 'var(--blue-soft)' }}>📜</div>
              On-Chain Event Log — {filtered.length} events
            </div>
          </div>
          <div>
            {filtered.length > 0 ? filtered.map(e => <BlockchainBlock key={e.id} event={e} />) : (
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                    No events found in the ledger. Start moving shipments to see data here.
                </div>
            )}
          </div>
        </div>

        {/* Side info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title"><div className="card-icon" style={{ background: 'var(--green-soft)' }}>🛡️</div>Security</div>
            </div>
            {[
              { label: 'Consensus', value: 'Proof of Stake' },
              { label: 'Hashing', value: 'SHA-256' },
              { label: 'Encryption', value: 'AES-256' },
              { label: 'Contract', value: 'Solidity 0.8.x' },
              { label: 'Tamper Proof', value: '✓ Yes' },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 12 }}>
                <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                <span style={{ color: 'var(--green)', fontWeight: 600 }}>{value}</span>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title"><div className="card-icon" style={{ background: 'var(--purple-soft)' }}>📊</div>Event Breakdown</div>
            </div>
            {Object.entries(typeCounts).map(([type, count]) => {
              const meta = EVENT_META[type] || {};
              const pct = contractInfo.total > 0 ? (count / contractInfo.total) * 100 : 0;
              return (
                <div key={type} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{meta.icon} {type}</span>
                    <span style={{ color: meta.color, fontWeight: 600 }}>{count}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${pct}%`, background: meta.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
