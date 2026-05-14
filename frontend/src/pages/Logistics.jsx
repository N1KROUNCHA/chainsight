import { useEffect, useState } from 'react';
import { api } from '../api';

const STATUS_META = {
  en_route: { label: 'En Route',  badge: 'ok',   icon: '🟢' },
  loading:  { label: 'Loading',   badge: 'warn',  icon: '🟡' },
  delivered:{ label: 'Delivered', badge: 'cyan',  icon: '✅' },
  delayed:  { label: 'Delayed',   badge: 'crit',  icon: '🔴' },
  idle:     { label: 'Idle',      badge: 'info',  icon: '⚪' },
};

function TruckCard({ truck }) {
  const meta = STATUS_META[truck.status] || { label: truck.status, badge: 'info', icon: '❓' };
  const etaColor = truck.etaMinutes > 120 ? 'var(--red)' : truck.etaMinutes > 60 ? 'var(--yellow)' : 'var(--green)';
  return (
    <div className="card" style={{
      borderColor: truck.status === 'delayed' ? '#ef444430' : truck.status === 'en_route' ? '#10b98130' : 'var(--border)',
      transition: 'all 0.2s',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>{truck.id}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{truck.driver}</div>
        </div>
        <span className={`badge ${meta.badge}`}>{meta.icon} {meta.label}</span>
      </div>

      {truck.origin && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, fontSize: 13 }}>
          <span style={{ background: 'var(--bg-hover)', padding: '3px 8px', borderRadius: 6, color: 'var(--text-secondary)' }}>{truck.origin}</span>
          <span style={{ color: 'var(--accent)', fontWeight: 700 }}>→</span>
          <span style={{ background: 'var(--bg-hover)', padding: '3px 8px', borderRadius: 6, color: 'var(--text-secondary)' }}>{truck.destination}</span>
        </div>
      )}

      {truck.cargo && (
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
          📦 <span style={{ color: 'var(--text-secondary)' }}>{truck.cargo}</span>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {truck.etaMinutes !== null && (
          <div className="metric-chip">
            <span className="lbl">ETA</span>
            <span className="val" style={{ color: etaColor }}>{truck.etaMinutes}m</span>
          </div>
        )}
        <div className="metric-chip">
          <span className="lbl">Load</span>
          <span className="val">{truck.loadPct}%</span>
        </div>
      </div>

      {truck.loadPct > 0 && (
        <div style={{ marginTop: 10 }}>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${truck.loadPct}%`, background: truck.loadPct > 90 ? 'var(--accent-2)' : 'var(--accent)' }} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function Logistics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    api.logistics().then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-ring" />;
  if (!data) return <div style={{ color: 'var(--text-muted)' }}>Failed to load logistics data.</div>;

  const filters = ['ALL', 'en_route', 'delayed', 'loading', 'idle', 'delivered'];
  const filtered = filter === 'ALL' ? data.trucks : data.trucks.filter(t => t.status === filter);

  return (
    <div>
      <div className="page-header">
        <div className="page-title">🚚 Logistics & Truck Allocation</div>
        <div className="page-desc">Real-time fleet monitoring, ETA tracking, and route coordination</div>
      </div>

      {/* Fleet KPIs */}
      <div className="kpi-grid" style={{ marginBottom: 24 }}>
        <div className="kpi-card blue"><div className="kpi-label">Total Fleet</div><div className="kpi-value">{data.summary.total}</div><div className="kpi-icon blue">🚛</div></div>
        <div className="kpi-card green"><div className="kpi-label">En Route</div><div className="kpi-value">{data.summary.enRoute}</div><div className="kpi-icon green">🟢</div></div>
        <div className="kpi-card red"><div className="kpi-label">Delayed</div><div className="kpi-value">{data.summary.delayed}</div><div className="kpi-icon red">⚠️</div></div>
        <div className="kpi-card yellow"><div className="kpi-label">Idle</div><div className="kpi-value">{data.summary.idle}</div><div className="kpi-icon yellow">⏸️</div></div>
      </div>

      {/* Filter buttons */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {filters.map(f => (
          <button key={f} className={`btn ${filter === f ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter(f)} style={{ fontSize: 11, textTransform: 'capitalize' }}>
            {f === 'ALL' ? 'All Trucks' : STATUS_META[f]?.label || f}
          </button>
        ))}
      </div>

      {/* Truck cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16, marginBottom: 24 }}>
        {filtered.map(t => <TruckCard key={t.id} truck={t} />)}
      </div>

      {/* Shipment table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title"><div className="card-icon" style={{ background: 'var(--blue-soft)' }}>📋</div>Shipment Details</div>
        </div>
        <table className="data-table">
          <thead>
            <tr><th>Truck ID</th><th>Driver</th><th>Route</th><th>Cargo</th><th>Load %</th><th>ETA</th><th>Coordinates</th><th>Status</th></tr>
          </thead>
          <tbody>
            {filtered.map(t => (
              <tr key={t.id}>
                <td className="primary">{t.id}</td>
                <td>{t.driver}</td>
                <td style={{ color: 'var(--accent-3)', fontSize: 12 }}>{t.origin}{t.destination ? ` → ${t.destination}` : ''}</td>
                <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{t.cargo || '—'}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div className="progress-bar" style={{ width: 50 }}>
                      <div className="progress-fill" style={{ width: `${t.loadPct}%`, background: 'var(--accent)' }} />
                    </div>
                    <span style={{ fontSize: 11 }}>{t.loadPct}%</span>
                  </div>
                </td>
                <td style={{ color: t.etaMinutes > 120 ? 'var(--red)' : t.etaMinutes > 60 ? 'var(--yellow)' : 'var(--green)', fontWeight: 600 }}>
                  {t.etaMinutes !== null ? `${t.etaMinutes}m` : '—'}
                </td>
                <td><span className="tx-hash" style={{ fontSize: 10 }}>{t.lat.toFixed(2)}, {t.lng.toFixed(2)}</span></td>
                <td><span className={`badge ${STATUS_META[t.status]?.badge || 'info'}`}>{STATUS_META[t.status]?.label || t.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
