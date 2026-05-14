import { useEffect, useState } from 'react';
import { api } from '../../api';

export default function RetailerDashboard({ user }) {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [kpis, setKpis] = useState({
    currentStock: 0,
    lowStockAlerts: 0,
    pendingOrders: 0,
    incomingDeliveries: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [orderData, invData] = await Promise.all([
          api.retailerOrders(user.userId),
          api.inventory('RETAILER', user.userId)
        ]);

        const oList = orderData || [];
        const iList = invData || [];

        setOrders(oList);
        setInventory(iList);

        const currentStock = iList.reduce((sum, item) => sum + item.quantity, 0);
        const lowStock = iList.filter(item => item.quantity <= item.reorderPoint).length;
        const pending = oList.filter(o => {
            const s = (o.orderStatus || '').replace(/\"/g, '');
            return s === 'PENDING' || s === 'APPROVED';
        }).length;
        const incoming = oList.filter(o => {
            const s = (o.orderStatus || '').replace(/\"/g, '');
            return s === 'DISPATCHED';
        }).length;

        setKpis({
          currentStock,
          lowStockAlerts: lowStock,
          pendingOrders: pending,
          incomingDeliveries: incoming
        });
      } catch (err) {
        console.error('Failed to load retailer dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.userId) fetchData();
  }, [user]);

  const recentOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  if (loading) return <div className="loading-ring" />;

  return (
    <div>
      <div className="page-header">
        <div className="page-title">🏪 Retailer Command Center</div>
        <div className="page-desc">Manage your shop inventory and orders for {user.fullName}</div>
      </div>

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
          <div className="kpi-label">Pending Orders</div>
          <div className="kpi-value">{kpis.pendingOrders}</div>
          <div className="kpi-icon yellow">🛒</div>
        </div>
        <div className="kpi-card green">
          <div className="kpi-label">Incoming Deliveries</div>
          <div className="kpi-value">{kpis.incomingDeliveries}</div>
          <div className="kpi-icon green">🚚</div>
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: 24 }}>
        <div className="card">
          <div className="card-header">
            <div className="card-title">Recent Orders</div>
          </div>
          <div>
             {recentOrders.length > 0 ? (
                 <table className="data-table">
                     <thead>
                         <tr><th>ID</th><th>Source</th><th>Status</th></tr>
                     </thead>
                     <tbody>
                         {recentOrders.map(o => {
                             const status = (o.orderStatus || '').replace(/\"/g, '');
                             const source = o.supplier?.companyName || o.distributor?.companyName || 'Unknown';
                             return (
                                 <tr key={o.orderId}>
                                     <td><span className="tx-hash">#{o.orderId}</span></td>
                                     <td className="primary">{source}</td>
                                     <td><span className={`badge ${status.toLowerCase()}`}>{status}</span></td>
                                 </tr>
                             );
                         })}
                     </tbody>
                 </table>
             ) : (
                 <div style={{ padding: 16, color: 'var(--text-muted)', fontSize: 13, textAlign: 'center' }}>No recent orders found. Place an order to get started!</div>
             )}
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <div className="card-title">Stock Forecast</div>
          </div>
          <div style={{ padding: 16 }}>
             {inventory.length > 0 ? (
                 <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                     {inventory.slice(0,4).map(item => (
                         <div key={item.inventoryId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                             <div>
                                 <div style={{ fontSize: 13, fontWeight: 600 }}>{item.product.productName}</div>
                                 <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Currently {item.quantity} {item.product.unit}</div>
                             </div>
                             <div style={{ textAlign: 'right' }}>
                                 {item.quantity <= item.reorderPoint ? (
                                     <span style={{ fontSize: 12, color: 'var(--red)', fontWeight: 600 }}>Order Now</span>
                                 ) : (
                                     <span style={{ fontSize: 12, color: 'var(--green)', fontWeight: 600 }}>Sufficient</span>
                                 )}
                             </div>
                         </div>
                     ))}
                 </div>
             ) : (
                 <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center' }}>No inventory tracking configured. Add products to your inventory!</div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
