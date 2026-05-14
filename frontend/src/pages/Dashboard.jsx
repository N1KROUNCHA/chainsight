import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

function useData(fetcher) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetcher().then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);
  return { data, loading };
}

function KpiCard({ label, value, change, changeDir, icon, color, prefix = '', suffix = '' }) {
  return (
    <div className={`kpi-card ${color}`}>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{prefix}{value}{suffix}</div>
      {change !== undefined && (
        <div className={`kpi-change ${changeDir}`}>
          {changeDir === 'up' ? '▲' : changeDir === 'down' ? '▼' : '—'} {Math.abs(change)}%
          <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: 4 }}>vs last week</span>
        </div>
      )}
      <div className={`kpi-icon ${color}`}>{icon}</div>
    </div>
  );
}

function RecentAlerts({ alerts }) {
  if (!alerts?.length) return <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>No recent alerts.</div>;
  const icons = { critical: '🔴', warning: '🟡', info: '🔵' };
  return (
    <div>
      {alerts.slice(0, 5).map(a => (
        <div key={a.id} className="alert-item">
          <div className={`alert-icon ${a.severity}`}>{icons[a.severity]}</div>
          <div className="alert-body">
            <div className={`alert-type ${a.severity}`}>{a.type}</div>
            <div className="alert-msg">{a.message}</div>
            <div className="alert-time">{new Date(a.ts).toLocaleString('en-IN')}</div>
          </div>
          {!a.read && <span className="badge crit" style={{ flexShrink: 0, alignSelf: 'center' }}>New</span>}
        </div>
      ))}
    </div>
  );
}

function ModuleCards() {
  const modules = [
    { to: '/forecast',      icon: '📈', label: 'Demand Forecasting',  desc: 'XGBoost + ARIMA predictions',     color: 'var(--accent)' },
    { to: '/bottleneck',    icon: '⚠️', label: 'Bottleneck Detection', desc: 'Delay & throughput analysis',     color: 'var(--red)' },
    { to: '/logistics',     icon: '🚚', label: 'Logistics & Trucks',   desc: 'Fleet tracking & ETA',            color: 'var(--yellow)' },
    { to: '/blockchain',    icon: '🔗', label: 'Blockchain Audit',     desc: 'Tamper-proof event ledger',       color: 'var(--accent-3)' }
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
      {modules.map(m => (
        <Link key={m.to} to={m.to} style={{ textDecoration: 'none' }}>
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12,
            padding: '16px', cursor: 'pointer', transition: 'all 0.2s', height: '100%'
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = m.color; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <div style={{ fontSize: 22, marginBottom: 8 }}>{m.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{m.label}</div>
            <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{m.desc}</div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { data: kpis, loading: kLoading } = useData(api.kpis);
  const { data: alertsData, loading: aLoading } = useData(api.alerts);
  const { data: bData, loading: bLoading } = useData(api.bottleneck);

  return (
    <div>
      <div className="page-header">
        <div className="page-title">⬡ Global Admin Center</div>
        <div className="page-desc">System-wide intelligence, predictive analytics, and blockchain governance.</div>
      </div>

      {kLoading ? <div className="loading-ring" /> : kpis && (
        <div className="kpi-grid">
          <KpiCard label="Total Platform Orders" value={kpis.ordersToday * 14} change={12} changeDir="up" icon="🛒" color="blue" />
          <KpiCard label="System-wide Delays" value="1.2%" change={0.4} changeDir="down" icon="⚠️" color="red" />
          <KpiCard label="Inventory Health" value="94%" change={2} changeDir="up" icon="📦" color="green" />
          <KpiCard label="Forecast Accuracy" value={kpis.forecastAccuracy} suffix="%" icon="🎯" color="purple" />
        </div>
      )}

      <div className="grid-2" style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <div className="card-icon" style={{ background: 'var(--blue-soft)' }}>🧭</div>
                System Modules
              </div>
            </div>
            <div style={{ padding: 16 }}>
                <ModuleCards />
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <div className="card-icon" style={{ background: 'var(--red-soft)' }}>🔴</div>
                Top Global Bottlenecks
              </div>
            </div>
            <div style={{ padding: 16 }}>
              {bLoading ? <div className="loading-ring" /> : bData?.length ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {bData.slice(0, 3).map(b => (
                    <div key={b.nodeId} style={{ display: 'flex', gap: 12, alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
                      <div style={{ fontSize: 24 }}>{b.severity === 'CRITICAL' ? '🔴' : '🟡'}</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{b.nodeName}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{b.issueType} • Est. Delay: {b.estimatedDelayHrs}h</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center' }}>No active bottlenecks.</div>}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <div className="card-icon" style={{ background: 'var(--accent-3-soft)' }}>🔗</div>
                Blockchain Audit Stream
              </div>
            </div>
            <div style={{ padding: 16 }}>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                     <div style={{ fontSize: 12, display: 'flex', gap: 8 }}>
                         <span style={{ color: 'var(--accent)' }}>[0x8a92...b4f1]</span>
                         <span>Order #42 Approved by <b>North Regional Hub</b></span>
                     </div>
                     <div style={{ fontSize: 12, display: 'flex', gap: 8 }}>
                         <span style={{ color: 'var(--accent)' }}>[0x1f34...c9a0]</span>
                         <span>Shipment JOB-901 Accepted by <b>Swift Transporters</b></span>
                     </div>
                     <div style={{ fontSize: 12, display: 'flex', gap: 8 }}>
                         <span style={{ color: 'var(--accent)' }}>[0x9b4e...d221]</span>
                         <span>Inventory Restock Confirmed by <b>Supplier A</b></span>
                     </div>
                     <div style={{ fontSize: 12, display: 'flex', gap: 8 }}>
                         <span style={{ color: 'var(--accent)' }}>[0x4c21...a8f8]</span>
                         <span>Order #39 Delivered to <b>City Supermarket #1</b></span>
                     </div>
                 </div>
                 <div style={{ marginTop: 16, textAlign: 'center' }}>
                     <Link to="/blockchain" className="btn btn-ghost" style={{ fontSize: 11, padding: '4px 10px' }}>View Full Ledger</Link>
                 </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <div className="card-icon" style={{ background: 'var(--yellow-soft)' }}>🔔</div>
                Recent Alerts
              </div>
              <Link to="/notifications" className="btn btn-ghost" style={{ fontSize: 11, padding: '4px 10px' }}>View All</Link>
            </div>
            {aLoading ? <div className="loading-ring" /> : <RecentAlerts alerts={alertsData?.alerts} />}
          </div>
        </div>
      </div>
    </div>
  );
}
