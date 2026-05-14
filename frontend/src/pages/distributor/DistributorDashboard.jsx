import { useEffect, useState } from 'react';
import { api } from '../../api';

export default function DistributorDashboard({ user }) {
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [bottlenecks, setBottlenecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({
    totalVolume: 0,
    pendingOrders: 0,
    lowStockItems: 0,
    activeShipments: 0
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [orderData, invData, bottleneckData] = await Promise.all([
        api.distributorOrders(user.userId).catch(() => []),
        api.inventory('DISTRIBUTOR', user.userId).catch(() => []),
        api.bottleneck().catch(() => [])
      ]);
      
      const oList = orderData || [];
      const iList = invData || [];
      const bList = bottleneckData || [];
      
      setOrders(oList);
      setInventory(iList);
      setBottlenecks(bList.slice(0, 3)); // Top 3 bottlenecks

      const pending = oList.filter(o => {
          const s = (o.orderStatus || '').replace(/\"/g, '');
          return s === 'PENDING';
      }).length;
      
      const activeShip = oList.filter(o => {
          const s = (o.orderStatus || '').replace(/\"/g, '');
          return s === 'DISPATCHED';
      }).length;
      
      const totalVol = iList.reduce((sum, item) => sum + item.quantity, 0);
      const lowStock = iList.filter(item => item.quantity <= item.reorderPoint).length;

      setKpis({ 
        totalVolume: totalVol,
        pendingOrders: pending,
        lowStockItems: lowStock,
        activeShipments: activeShip
      });
    } catch (err) {
      console.error('Failed to load distributor data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      loadData();
    } catch (err) {
      alert('Failed to update order');
    }
  };

  if (loading) return <div className="loading-ring" />;

  return (
    <div>
      <div className="page-header">
        <div className="page-title">🏗️ Distributor Hub</div>
        <div className="page-desc">Manage regional inventory, retailer fulfillments, and dispatch logic for {user.fullName}</div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card blue">
          <div className="kpi-label">Inventory Volume</div>
          <div className="kpi-value">{kpis.totalVolume} units</div>
          <div className="kpi-icon blue">📦</div>
        </div>
        <div className="kpi-card yellow">
          <div className="kpi-label">Pending Fulfillments</div>
          <div className="kpi-value">{kpis.pendingOrders}</div>
          <div className="kpi-icon yellow">📥</div>
        </div>
        <div className="kpi-card red">
          <div className="kpi-label">Low Stock Alerts</div>
          <div className="kpi-value">{kpis.lowStockItems}</div>
          <div className="kpi-icon red">🚨</div>
        </div>
        <div className="kpi-card green">
          <div className="kpi-label">Active Fleet</div>
          <div className="kpi-value">{kpis.activeShipments}</div>
          <div className="kpi-icon green">🚛</div>
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: 24 }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title">Incoming Retailer Orders</div>
            </div>
            <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th><th>Retailer</th><th>Items</th><th>Status</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => {
                      const status = (order.orderStatus || '').replace(/\"/g, '');
                      return (
                      <tr key={order.orderId}>
                        <td><span className="tx-hash">#{order.orderId}</span></td>
                        <td className="primary">{order.retailer?.shopName || 'Retailer'}</td>
                        <td>{order.items?.length || 0} Products</td>
                        <td>
                          <span className={`badge ${status.toLowerCase()}`}>{status}</span>
                        </td>
                        <td>
                          {status === 'PENDING' && (
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button className="btn btn-primary" style={{ padding: '4px 8px', fontSize: 10 }} onClick={() => handleStatusChange(order.orderId, 'APPROVED')}>Approve</button>
                              <button className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: 10, color: 'var(--red)' }} onClick={() => handleStatusChange(order.orderId, 'REJECTED')}>Reject</button>
                            </div>
                          )}
                          {status === 'APPROVED' && (
                            <button className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: 10, color: 'var(--accent)' }}>Create Shipment</button>
                          )}
                        </td>
                      </tr>
                    )})}
                    {orders.length === 0 && (
                      <tr><td colSpan="5" style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No incoming orders yet.</td></tr>
                    )}
                  </tbody>
                </table>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div className="card">
                <div className="card-header">
                  <div className="card-title">Regional Bottlenecks</div>
                </div>
                <div style={{ padding: 16 }}>
                    {bottlenecks.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {bottlenecks.map(b => (
                                <div key={b.nodeId} style={{ display: 'flex', gap: 12, alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
                                    <div style={{ fontSize: 24 }}>{b.severity === 'CRITICAL' ? '🔴' : '🟡'}</div>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: 13 }}>{b.nodeName}</div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Issue: {b.issueType}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No active bottlenecks detected in your region.</div>
                    )}
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <div className="card-title">Stock Forecasting Insights</div>
                </div>
                <div style={{ padding: 16 }}>
                    {inventory.filter(i => i.quantity <= i.reorderPoint).slice(0, 3).map(item => (
                        <div key={item.inventoryId} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 12 }}>
                            <div>
                                <strong style={{ color: 'var(--text-primary)' }}>{item.product.productName}</strong>
                                <div style={{ color: 'var(--text-muted)' }}>Current: {item.quantity} {item.product.unit}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ color: 'var(--red)' }}>Below ROP</div>
                                <button className="btn btn-ghost" style={{ padding: '2px 8px', fontSize: 10, marginTop: 4 }}>Order Bulk</button>
                            </div>
                        </div>
                    ))}
                    {inventory.filter(i => i.quantity <= i.reorderPoint).length === 0 && (
                        <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>All inventory levels are healthy.</div>
                    )}
                </div>
              </div>
          </div>
      </div>
    </div>
  );
}
