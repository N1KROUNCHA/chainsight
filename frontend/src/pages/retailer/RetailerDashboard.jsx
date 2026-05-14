import { useEffect, useState } from 'react';
import { api } from '../../api';

const STATUS_BADGE = {
  PENDING:   { color: 'warn',    label: '⏳ Pending'   },
  APPROVED:  { color: 'info',    label: '✅ Approved'  },
  DISPATCHED:{ color: 'info',    label: '🚛 Dispatched'},
  DELIVERED: { color: 'success', label: '📦 Delivered' },
  REJECTED:  { color: 'danger',  label: '❌ Rejected'  },
};

export default function RetailerDashboard({ user }) {
  const [loading, setLoading]   = useState(true);
  const [orders, setOrders]     = useState([]);
  const [inventory, setInventory] = useState([]);
  const [kpis, setKpis]         = useState({ currentStock: 0, lowStockAlerts: 0, pendingOrders: 0, incomingDeliveries: 0 });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [orderData, invData] = await Promise.all([
        api.retailerOrders(user.userId).catch(() => []),
        api.inventory('RETAILER', user.userId).catch(() => []),
      ]);

      const oList = orderData || [];
      const iList = invData  || [];
      setOrders(oList);
      setInventory(iList);

      const currentStock = iList.reduce((sum, item) => sum + item.quantity, 0);
      const lowStock     = iList.filter(item => item.quantity <= item.reorderPoint).length;
      const pending      = oList.filter(o => ['PENDING', 'APPROVED'].includes((o.orderStatus || '').replace(/"/g, ''))).length;
      const incoming     = oList.filter(o => ['DISPATCHED'].includes((o.orderStatus || '').replace(/"/g, ''))).length;

      setKpis({ currentStock, lowStockAlerts: lowStock, pendingOrders: pending, incomingDeliveries: incoming });
    } catch (err) {
      console.error('Failed to load retailer dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user?.userId) fetchData(); }, [user]);

  if (loading) return <div className="loading-ring" />;

  // Split orders by status
  const requestOrders  = orders.filter(o => ['PENDING', 'REJECTED'].includes((o.orderStatus || '').replace(/"/g, '')));
  const activeShipments = orders.filter(o => ['APPROVED', 'DISPATCHED', 'DELIVERED'].includes((o.orderStatus || '').replace(/"/g, '')));

  const OrderRow = ({ o }) => {
    const status = (o.orderStatus || '').replace(/"/g, '');
    const badge  = STATUS_BADGE[status] || { color: status.toLowerCase(), label: status };
    const source = o.supplier?.companyName || o.distributor?.companyName || 'Unknown';
    return (
      <tr>
        <td><span className="tx-hash">#{o.orderId}</span></td>
        <td className="primary">{source}</td>
        <td>{o.items?.length || 0} item(s)</td>
        <td><span className={`badge ${badge.color}`}>{badge.label}</span></td>
      </tr>
    );
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">🏪 Retailer Command Center</div>
        <div className="page-desc">Manage your shop inventory and orders for {user.fullName}</div>
      </div>

      {/* KPIs */}
      <div className="kpi-grid">
        <div className="kpi-card blue">
          <div className="kpi-label">Current Stock</div>
          <div className="kpi-value">{kpis.currentStock}</div>
          <div className="kpi-icon blue">📦</div>
        </div>
        <div className="kpi-card red">
          <div className="kpi-label">Low Stock Alerts</div>
          <div className="kpi-value">{kpis.lowStockAlerts}</div>
          <div className="kpi-icon red">🚨</div>
        </div>
        <div className="kpi-card yellow">
          <div className="kpi-label">Pending Requests</div>
          <div className="kpi-value">{kpis.pendingOrders}</div>
          <div className="kpi-icon yellow">🛒</div>
        </div>
        <div className="kpi-card green">
          <div className="kpi-label">Incoming Deliveries</div>
          <div className="kpi-value">{kpis.incomingDeliveries}</div>
          <div className="kpi-icon green">🚚</div>
        </div>
      </div>

      <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* ── Pending / Rejected Requests ── */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">📬 My Order Requests</div>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Awaiting approval from supplier / distributor</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr><th>ID</th><th>Sent To</th><th>Items</th><th>Status</th></tr>
              </thead>
              <tbody>
                {requestOrders.length > 0 ? requestOrders.map(o => <OrderRow key={o.orderId} o={o} />) : (
                  <tr><td colSpan="4" style={{ textAlign: 'center', padding: 28, color: 'var(--text-muted)' }}>No pending or rejected requests.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Active Shipments ── */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">🚛 Active Shipments</div>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Approved, in transit, or delivered orders</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr><th>ID</th><th>From</th><th>Items</th><th>Status</th></tr>
              </thead>
              <tbody>
                {activeShipments.length > 0 ? activeShipments.map(o => <OrderRow key={o.orderId} o={o} />) : (
                  <tr><td colSpan="4" style={{ textAlign: 'center', padding: 28, color: 'var(--text-muted)' }}>No active shipments yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Stock Forecast ── */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">📊 Stock Forecast</div>
          </div>
          <div style={{ padding: 16 }}>
            {inventory.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {inventory.slice(0, 5).map(item => (
                  <div key={item.inventoryId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{item.product.productName}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Stock: {item.quantity} {item.product.unit}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      {item.quantity <= item.reorderPoint ? (
                        <span style={{ fontSize: 12, color: 'var(--red)', fontWeight: 600 }}>⚠️ Reorder Now</span>
                      ) : (
                        <span style={{ fontSize: 12, color: 'var(--green)', fontWeight: 600 }}>✅ Sufficient</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: 24 }}>
                No inventory configured yet.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
