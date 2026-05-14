import { useEffect, useState } from 'react';
import { api } from '../api';

const EVENT_META = {
  Dispatch:        { icon: '🚀', color: 'var(--accent)',   bg: 'var(--blue-soft)' },
  Delivery:        { icon: '✅', color: 'var(--green)',    bg: 'var(--green-soft)' },
  InventoryUpdate: { icon: '📦', color: 'var(--accent-3)', bg: 'rgba(6,182,212,0.12)' },
  DelayEvent:      { icon: '⚠️', color: 'var(--yellow)',   bg: 'var(--yellow-soft)' },
  ReorderAction:   { icon: '🔄', color: 'var(--accent-2)', bg: 'var(--purple-soft)' },
};

function BlockchainBlock({ event }) {
  const meta = EVENT_META[event.type] || { icon: '📝', color: 'var(--text-muted)', bg: 'var(--bg-card-2)' };
  return (
    <div style={{
      display: 'flex', gap: 16, padding: '16px 0',
      borderBottom: '1px solid var(--border)', alignItems: 'flex-start',
    }}>
      {/* Connector line */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 36, flexShrink: 0 }}>
        <div style={{ width: 36, height: 36, borderRadius: 9, background: meta.bg, border: `1px solid ${meta.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>
          {meta.icon}
        </div>
        <div style={{ width: 1, flex: 1, minHeight: 12, background: 'var(--border)', marginTop: 4 }} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: meta.color }}>{event.type}</span>
          <span className="tx-hash">{event.txHash}</span>
          {event.verified && <span className="badge ok" style={{ fontSize: 10 }}>✓ Verified</span>}
        </div>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 4 }}>
          {event.shipmentId && (
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Shipment: <strong style={{ color: 'var(--text-secondary)' }}>{event.shipmentId}</strong></span>
          )}
          {event.sku && (
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>SKU: <strong style={{ color: 'var(--text-secondary)' }}>{event.sku}</strong></span>
          )}
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Actor: <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--accent)' }}>{event.actor}</span></span>
        </div>

        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Block #{event.blockNumber.toLocaleString()}</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(event.timestamp).toLocaleString('en-IN')}</span>
        </div>
      </div>
    </div>
  );
}

export default function BlockchainAudit() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    api.blockchain().then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-ring" />;
  if (!data) return <div style={{ color: 'var(--text-muted)' }}>Failed to load blockchain data.</div>;

  const eventTypes = ['ALL', ...Object.keys(EVENT_META)];
  const filtered = filter === 'ALL' ? data.events : data.events.filter(e => e.type === filter);
  const typeCounts = {};
  data.events.forEach(e => { typeCounts[e.type] = (typeCounts[e.type] || 0) + 1; });

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
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: 'var(--accent)' }}>{data.contractAddress}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 4 }}>Chain ID</div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: 'var(--green)' }}>{data.chainId} (Mainnet)</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 4 }}>Total Events</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>{data.totalEvents}</div>
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
            {filtered.map(e => <BlockchainBlock key={e.id} event={e} />)}
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
              const pct = (count / data.totalEvents) * 100;
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
