import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import BlockchainLiveFeed from '../components/BlockchainLiveFeed';

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

export default function Dashboard({ user }) {
  const { data: kpis, loading: kLoading } = useData(api.kpis);
  const { data: alertsData, loading: aLoading } = useData(api.alerts);
  
  // Role-specific configuration
  const roleConfig = {
    SUPPLIER: {
      title: "🏭 Manufacturing & Supply Hub",
      desc: "Manage production throughput and distributor fulfillment.",
      kpis: [
        { label: "Active Production", value: "85%", icon: "⚙️", color: "blue" },
        { label: "Pending Distributor Orders", value: "4", icon: "📬", color: "purple" },
        { label: "Material Stock", value: "92%", icon: "📦", color: "green" }
      ],
      actions: [
        { label: "Approve Distributor Orders", to: "/orders/incoming", icon: "✅" },
        { label: "Update Product Inventory", to: "/inventory", icon: "📦" },
        { label: "Check Demand Forecast", to: "/forecast", icon: "📈" }
      ]
    },
    DISTRIBUTOR: {
      title: "🏢 Regional Distribution Center",
      desc: "Optimize inventory flow and logistics coordination.",
      kpis: [
        { label: "Warehouse Capacity", value: "72%", icon: "🏭", color: "blue" },
        { label: "Retailer Requests", value: "12", icon: "📥", color: "purple" },
        { label: "Outbound Shipments", value: "8", icon: "🚚", color: "green" }
      ],
      actions: [
        { label: "Approve Retailer Requests", to: "/orders/retailer-requests", icon: "🤝" },
        { label: "Reorder from Supplier", to: "/orders/place", icon: "🛒" },
        { label: "Monitor Fleet", to: "/logistics", icon: "🚛" }
      ]
    },
    RETAILER: {
      title: "🏪 Retail Operational Hub",
      desc: "Track sales velocity and inventory replenishment.",
      kpis: [
        { label: "Store Inventory", value: "94%", icon: "🏪", color: "blue" },
        { label: "Incoming Deliveries", value: "2", icon: "🚛", color: "purple" },
        { label: "Sales Velocity", value: "+14%", icon: "📈", color: "green" }
      ],
      actions: [
        { label: "Place Replenishment Order", to: "/orders/place", icon: "🛒" },
        { label: "Confirm Received Shipments", to: "/shipments/incoming", icon: "📦" },
        { label: "View Sales Analytics", to: "/forecast", icon: "📊" }
      ]
    },
    TRUCK_OWNER: {
      title: "🚛 Logistics Command Center",
      desc: "Fleet dispatching and delivery fulfillment.",
      kpis: [
        { label: "Total Fleet", value: "6", icon: "🚚", color: "blue" },
        { label: "Available Trucks", value: "2", icon: "✅", color: "green" },
        { label: "Active Jobs", value: "4", icon: "📍", color: "purple" }
      ],
      actions: [
        { label: "Accept New Shipment Jobs", to: "/trucks/dashboard", icon: "📦" },
        { label: "Manage My Fleet", to: "/trucks/dashboard", icon: "🚛" },
        { label: "View Route Analytics", to: "/bottleneck", icon: "⚠️" }
      ]
    },
    ADMIN: {
      title: "⬡ Global Admin Center",
      desc: "System-wide intelligence and blockchain governance.",
      kpis: [
        { label: "Platform Throughput", value: "88%", icon: "🛒", color: "blue" },
        { label: "Network Health", value: "100%", icon: "🌐", color: "green" },
        { label: "Blockchain Events", value: "1.2k", icon: "🔗", color: "purple" }
      ],
      actions: [
        { label: "Blockchain Audit Trail", to: "/blockchain", icon: "🔗" },
        { label: "Bottleneck Analysis", to: "/bottleneck", icon: "⚠️" },
        { label: "Demand Forecasting", to: "/forecast", icon: "📈" }
      ]
    }
  };

  const config = roleConfig[user.role] || roleConfig.ADMIN;

  return (
    <div>
      <div className="page-header">
        <div className="page-title">{config.title}</div>
        <div className="page-desc">{config.desc}</div>
      </div>

      <div className="kpi-grid">
        {config.kpis.map((k, i) => (
          <KpiCard key={i} label={k.label} value={k.value} icon={k.icon} color={k.color} />
        ))}
      </div>

      <div className="grid-2" style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* Next Actions (Workflow Driven) */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <div className="card-icon" style={{ background: 'var(--blue-soft)' }}>⚡</div>
                Required Actions
              </div>
            </div>
            <div style={{ padding: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {config.actions.map((a, i) => (
                <Link key={i} to={a.to} style={{ textDecoration: 'none' }}>
                  <div style={{
                    background: 'var(--bg-card-2)', border: '1px solid var(--border)', borderRadius: 10,
                    padding: '16px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 12
                  }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                  >
                    <div style={{ fontSize: 24 }}>{a.icon}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{a.label}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <div className="card-icon" style={{ background: 'var(--accent-3-soft)' }}>🔗</div>
                Real-time Audit Stream
              </div>
            </div>
            <div style={{ padding: 16 }}>
                 <BlockchainStream />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <div className="card-icon" style={{ background: 'var(--yellow-soft)' }}>🔔</div>
                Operational Alerts
              </div>
            </div>
            {aLoading ? <div className="loading-ring" /> : <RecentAlerts alerts={alertsData?.alerts} />}
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <div className="card-icon" style={{ background: 'var(--purple-soft)' }}>📊</div>
                Live Metrics
              </div>
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ height: 120, display: 'flex', alignItems: 'flex-end', gap: 8, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
                {[40, 70, 45, 90, 65, 80, 95].map((h, i) => (
                  <div key={i} style={{ flex: 1, height: `${h}%`, background: 'var(--primary)', borderRadius: '4px 4px 0 0', opacity: 0.7 + (i * 0.05) }} />
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 10, color: 'var(--text-muted)' }}>
                <span>MON</span><span>WED</span><span>FRI</span><span>SUN</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
