import { useEffect, useState } from 'react';
import { api } from '../api';

const SEV_META = {
  critical: { icon: '🔴', color: 'var(--red)',    bg: 'var(--red-soft)',    label: 'Critical' },
  warning:  { icon: '🟡', color: 'var(--yellow)', bg: 'var(--yellow-soft)', label: 'Warning'  },
  info:     { icon: '🔵', color: 'var(--accent)',  bg: 'var(--blue-soft)',   label: 'Info'     },
};

export default function Notifications() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [readFilter, setReadFilter] = useState('ALL');

  useEffect(() => {
    api.alerts().then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-ring" />;
  if (!data) return <div style={{ color: 'var(--text-muted)' }}>Failed to load alerts.</div>;

  let alerts = data.alerts;
  if (filter !== 'ALL') alerts = alerts.filter(a => a.severity === filter);
  if (readFilter === 'UNREAD') alerts = alerts.filter(a => !a.read);
  if (readFilter === 'READ')   alerts = alerts.filter(a => a.read);

  const counts = { critical: 0, warning: 0, info: 0 };
  data.alerts.forEach(a => { counts[a.severity] = (counts[a.severity] || 0) + 1; });

  return (
    <div>
      <div className="page-header">
        <div className="page-title">🔔 Notifications & Automation Layer</div>
        <div className="page-desc">Automated alerts, reorder triggers, delay notifications and workflow events</div>
      </div>

      {/* Summary KPIs */}
      <div className="kpi-grid" style={{ marginBottom: 24 }}>
        <div className="kpi-card red">
          <div className="kpi-label">Critical</div>
          <div className="kpi-value">{counts.critical}</div>
          <div className="kpi-icon red">🚨</div>
        </div>
        <div className="kpi-card yellow">
          <div className="kpi-label">Warnings</div>
          <div className="kpi-value">{counts.warning}</div>
          <div className="kpi-icon yellow">⚠️</div>
        </div>
        <div className="kpi-card blue">
          <div className="kpi-label">Info</div>
          <div className="kpi-value">{counts.info}</div>
          <div className="kpi-icon blue">ℹ️</div>
        </div>
        <div className="kpi-card purple">
          <div className="kpi-label">Unread</div>
          <div className="kpi-value">{data.unreadCount}</div>
          <div className="kpi-icon purple">📬</div>
        </div>
      </div>

      {/* Automation flows info */}
      <div className="card" style={{ marginBottom: 24, background: 'var(--bg-card-2)' }}>
        <div className="card-header">
          <div className="card-title"><div className="card-icon" style={{ background: 'var(--purple-soft)' }}>⚡</div>Automation Workflows (n8n)</div>
          <span className="badge ok">Active</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {[
            { icon: '📦', label: 'Auto Reorder', trigger: 'Stock < ROP', channel: 'Email + WhatsApp' },
            { icon: '🚚', label: 'Delay Alert',  trigger: 'ETA > 2h late', channel: 'SMS + Dashboard' },
            { icon: '🔗', label: 'Blockchain Log', trigger: 'Any event', channel: 'On-chain record' },
            { icon: '📈', label: 'Forecast Update', trigger: 'Weekly', channel: 'Dashboard + Report' },
          ].map(w => (
            <div key={w.label} style={{ padding: '12px', background: 'var(--bg-card)', borderRadius: 10, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>{w.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3 }}>{w.label}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 3 }}>Trigger: {w.trigger}</div>
              <div style={{ fontSize: 11, color: 'var(--accent-3)' }}>→ {w.channel}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {['ALL', 'critical', 'warning', 'info'].map(f => (
          <button key={f} className={`btn ${filter === f ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter(f)} style={{ fontSize: 11, textTransform: 'capitalize' }}>
            {f === 'ALL' ? 'All' : `${SEV_META[f]?.icon} ${f}`}
          </button>
        ))}
        <div style={{ width: 1, background: 'var(--border)', margin: '0 4px' }} />
        {['ALL', 'UNREAD', 'READ'].map(f => (
          <button key={f} className={`btn ${readFilter === f ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setReadFilter(f)} style={{ fontSize: 11 }}>
            {f === 'ALL' ? 'All Status' : f}
          </button>
        ))}
      </div>

      {/* Alert list */}
      <div className="card">
        <div className="card-header">
          <div className="card-title"><div className="card-icon" style={{ background: 'var(--yellow-soft)' }}>📋</div>Alert Feed — {alerts.length} alerts</div>
        </div>
        {alerts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
            <div>No alerts matching your filters.</div>
          </div>
        ) : (
          <div>
            {alerts.map(a => {
              const meta = SEV_META[a.severity] || SEV_META.info;
              return (
                <div key={a.id} className="alert-item" style={{ opacity: a.read ? 0.65 : 1 }}>
                  <div className={`alert-icon ${a.severity}`} style={{ background: meta.bg }}>{meta.icon}</div>
                  <div className="alert-body">
                    <div className={`alert-type ${a.severity}`} style={{ color: meta.color }}>{a.type}</div>
                    <div className="alert-msg">{a.message}</div>
                    <div className="alert-time">{new Date(a.ts).toLocaleString('en-IN')}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end', flexShrink: 0 }}>
                    {!a.read && <span className="badge crit" style={{ fontSize: 10 }}>New</span>}
                    <span className={`badge ${a.severity === 'critical' ? 'crit' : a.severity === 'warning' ? 'warn' : 'info'}`} style={{ fontSize: 10 }}>{meta.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
