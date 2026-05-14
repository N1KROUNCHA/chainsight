import { useEffect, useState } from 'react';
import { api } from '../../api';

const STATUS_BADGE = {
  PENDING:   { color: 'warn',    label: '⏳ Pending'   },
  APPROVED:  { color: 'info',    label: '✅ Approved'  },
  DISPATCHED:{ color: 'info',    label: '🚛 Dispatched'},
  DELIVERED: { color: 'success', label: '📦 Delivered' },
  REJECTED:  { color: 'danger',  label: '❌ Rejected'  },
};

export default function DistributorDashboard({ user }) {
  const [orders, setOrders]       = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [kpis, setKpis]           = useState({ totalVolume: 0, pendingOrders: 0, lowStockItems: 0, activeShipments: 0 });

  const loadData = async () => {
    setLoading(true);
    try {
      const [orderData, invData] = await Promise.all([
        api.distributorOrders(user.userId).catch(() => []),
        api.inventory('DISTRIBUTOR', user.userId).catch(() => []),
      ]);

      const oList = orderData || [];
      const iList = invData   || [];
      setOrders(oList);
      setInventory(iList);

      const pending    = oList.filter(o => (o.orderStatus || '').replace(/"/g, '') === 'PENDING').length;
      const activeShip = oList.filter(o => ['APPROVED', 'DISPATCHED'].includes((o.orderStatus || '').replace(/"/g, ''))).length;
      const totalVol   = iList.reduce((sum, item) => sum + item.quantity, 0);
      const lowStock   = iList.filter(item => item.quantity <= item.reorderPoint).length;

      setKpis({ totalVolume: totalVol, pendingOrders: pending, lowStockItems: lowStock, activeShipments: activeShip });
    } catch (err) {
      console.error('Failed to load distributor data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [user]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      loadData();
    } catch (err) {
      alert('Failed to update order');
    }
  };

  if (loading) return <div className="loading-ring" />;

  // Split orders into two buckets
  const pendingRequests  = orders.filter(o => ['PENDING', 'REJECTED'].includes((o.orderStatus || '').replace(/"/g, '')));
  const activeShipments  = orders.filter(o => ['APPROVED', 'DISPATCHED', 'DELIVERED'].includes((o.orderStatus || '').replace(/"/g, '')));

  return (
    <div>
      <div className="page-header">
        <div className="page-title">🏗️ Distributor Hub</div>
        <div className="page-desc">Manage regional inventory, retailer fulfillments, and dispatch logic for {user.fullName}</div>
      </div>

      {/* KPIs */}
      <div className="kpi-grid">
        <div className="kpi-card blue">
          <div className="kpi-label">Inventory Volume</div>
          <div className="kpi-value">{kpis.totalVolume} units</div>
          <div className="kpi-icon blue">📦</div>
        </div>
        <div className="kpi-card yellow">
          <div className="kpi-label">Pending Requests</div>
          <div className="kpi-value">{kpis.pendingOrders}</div>
          <div className="kpi-icon yellow">📥</div>
        </div>
        <div className="kpi-card red">
          <div className="kpi-label">Low Stock Alerts</div>
          <div className="kpi-value">{kpis.lowStockItems}</div>
          <div className="kpi-icon red">🚨</div>
        </div>
        <div className="kpi-card green">
          <div className="kpi-label">Active Shipments</div>
          <div className="kpi-value">{kpis.activeShipments}</div>
          <div className="kpi-icon green">🚛</div>
        </div>
      </div>

      <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* ── Stock Forecast ── */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">📊 Inventory & Stock Forecasting</div>
          </div>
          <div style={{ padding: 16 }}>
            {inventory.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {inventory.map(item => (
                  <div key={item.inventoryId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{item.product.productName}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Qty: {item.quantity} • ROP: {item.reorderPoint}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      {item.quantity <= item.reorderPoint ? (
                        <span style={{ fontSize: 12, color: 'var(--red)', fontWeight: 600 }}>⚠️ Below Reorder Point</span>
                      ) : (
                        <span style={{ fontSize: 12, color: 'var(--green)', fontWeight: 600 }}>✅ Healthy</span>
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
