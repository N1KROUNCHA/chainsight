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

export default function Logistics({ user }) {
  const [data, setData] = useState(null);
  const [transporters, setTransporters] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [assigning, setAssigning] = useState({}); // orderId -> transporterUserId

  const loadData = async () => {
    setLoading(true);
    try {
      const [logData, transList, allOrders] = await Promise.all([
        api.logistics(),
        api.transporters(),
        user.role === 'SUPPLIER' 
          ? api.supplierOrders(user.userId) 
          : api.distributorInboundOrders(user.userId)
      ]);
      
      setData(logData);
      setTransporters(transList);
      
      // We only care about APPROVED orders that don't have a truck OR targetTransporter yet
      const unassigned = (allOrders || []).filter(o => 
        (o.orderStatus || '').replace(/"/g, '') === 'APPROVED' && !o.assignedTruck
      );
      setPendingOrders(unassigned);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleAssign = async (orderId) => {
    const transporterUserId = assigning[orderId];
    if (!transporterUserId) return;
    try {
      await api.assignTransporter(orderId, transporterUserId);
      alert('Transporter assigned! They will now see this order in their priority list.');
      loadData();
    } catch (err) {
      alert('Failed to assign transporter.');
    }
  };

  if (loading) return <div className="loading-ring" />;
  if (!data) return <div style={{ color: 'var(--text-muted)' }}>Failed to load logistics data.</div>;

  const filters = ['ALL', 'en_route', 'delayed', 'loading', 'idle', 'delivered'];
  const filtered = filter === 'ALL' ? data.trucks : data.trucks.filter(t => t.status === filter);

  return (
    <div>
      <div className="page-header">
        <div className="page-title">🚚 Logistics & Transporter Selection</div>
        <div className="page-desc">Monitor your fleet and assign approved orders to reliable transporters</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24, marginBottom: 24 }}>
        
        {/* Fleet KPIs & Monitoring (Existing) */}
        <div>
          <div className="kpi-grid" style={{ marginBottom: 24 }}>
            <div className="kpi-card blue"><div className="kpi-label">Total Fleet</div><div className="kpi-value">{data.summary.total}</div><div className="kpi-icon blue">🚛</div></div>
            <div className="kpi-card green"><div className="kpi-label">En Route</div><div className="kpi-value">{data.summary.enRoute}</div><div className="kpi-icon green">🟢</div></div>
            <div className="kpi-card red"><div className="kpi-label">Delayed</div><div className="kpi-value">{data.summary.delayed}</div><div className="kpi-icon red">⚠️</div></div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">🚛 Active Fleet Monitoring</div>
            </div>
            <div style={{ padding: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {filtered.map(t => <TruckCard key={t.id} truck={t} />)}
            </div>
          </div>
        </div>

        {/* Transporter Assignment (NEW) */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">🎯 Assign Transporter to Orders</div>
            <span style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 600 }}>{pendingOrders.length} pending</span>
          </div>
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {pendingOrders.map(order => {
              const client = order.retailer?.shopName || order.distributor?.companyName || 'Retailer';
              return (
                <div key={order.orderId} style={{ padding: 14, border: '1px solid var(--border)', borderRadius: 10, background: 'var(--bg-card-2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Order #{order.orderId}</div>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>To: {client}</div>
                      <div style={{ fontSize: 11, color: 'var(--accent)' }}>📦 {order.weightTons} Tons</div>
                    </div>
                    {order.targetTransporter ? (
                      <span className="badge info">Assigned to {order.targetTransporter.companyName}</span>
                    ) : (
                      <span className="badge warn">Unassigned</span>
                    )}
                  </div>
                  
                  {!order.targetTransporter && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                      <select 
                        className="btn btn-ghost" 
                        style={{ flex: 1, textAlign: 'left', fontSize: 11 }}
                        value={assigning[order.orderId] || ''}
                        onChange={e => setAssigning({ ...assigning, [order.orderId]: e.target.value })}
                      >
                        <option value="">-- Choose Transporter --</option>
                        {transporters.map(t => (
                          <option key={t.user.userId} value={t.user.userId}>
                            {t.companyName} ({t.city})
                          </option>
                        ))}
                      </select>
                      <button 
                        className="btn btn-primary" 
                        style={{ padding: '4px 12px', fontSize: 11 }}
                        onClick={() => handleAssign(order.orderId)}
                        disabled={!assigning[order.orderId]}
                      >
                        Assign
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
            {pendingOrders.length === 0 && (
              <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)', fontSize: 13 }}>
                All approved orders have been assigned to transporters.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Shipment table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">📋 Live Shipment Tracking</div>
        </div>
        <table className="data-table">
          <thead>
            <tr><th>Truck ID</th><th>Driver</th><th>Route</th><th>Cargo</th><th>Load %</th><th>ETA</th><th>Status</th></tr>
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
                <td><span className={`badge ${STATUS_META[t.status]?.badge || 'info'}`}>{STATUS_META[t.status]?.label || t.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
