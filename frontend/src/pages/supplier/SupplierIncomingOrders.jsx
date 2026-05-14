import { useEffect, useState } from 'react';
import { api } from '../../api';

const STATUS_BADGE = {
  PENDING:   { color: 'warn',    label: '⏳ Pending'   },
  APPROVED:  { color: 'info',    label: '✅ Approved'  },
  DISPATCHED:{ color: 'info',    label: '🚛 Dispatched'},
  DELIVERED: { color: 'success', label: '📦 Delivered' },
  REJECTED:  { color: 'danger',  label: '❌ Rejected'  },
};

export default function SupplierIncomingOrders({ user }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedWeight, setSelectedWeight] = useState({});
  const [selectedTransporter, setSelectedTransporter] = useState({});
  const [transporters, setTransporters] = useState([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [data, transList] = await Promise.all([
        api.supplierOrders(user.userId).catch(() => []),
        api.transporters().catch(() => [])
      ]);
      setOrders(data || []);
      setTransporters(transList || []);
    } catch (err) {
      console.error('Failed to load supplier orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [user]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const weight = selectedWeight[orderId];
      const transporterId = selectedTransporter[orderId];

      if (newStatus === 'APPROVED') {
        if (!weight || parseFloat(weight) <= 0) {
          alert('Please specify the order weight in Tons before approving.');
          return;
        }
        if (!transporterId) {
          alert('Please select a transporter to handle this delivery.');
          return;
        }
      }

      await api.updateOrderStatus(orderId, newStatus, weight);
      if (newStatus === 'APPROVED' && transporterId) {
        await api.assignTransporter(orderId, transporterId);
      }
      
      loadData();
    } catch (err) {
      alert('Failed to update order status');
    }
  };

  if (loading) return <div className="loading-ring" />;

  const pendingOrders = orders.filter(o => {
    const s = (o.orderStatus || '').toUpperCase().replace(/\"/g, '');
    return s === 'PENDING';
  });

  const activeOrders = orders.filter(o => {
    const s = (o.orderStatus || '').toUpperCase().replace(/\"/g, '');
    return s === 'APPROVED' || s === 'DISPATCHED';
  });

  const completedOrders = orders.filter(o => {
    const s = (o.orderStatus || '').toUpperCase().replace(/\"/g, '');
    return s === 'DELIVERED' || s === 'REJECTED';
  });

  return (
    <div>
      <div className="page-header">
        <div className="page-title">📥 Manage Client Orders</div>
        <div className="page-desc">Approve or reject incoming requests from distributors and retailers</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* Pending Requests */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">📬 New Pending Requests</div>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{pendingOrders.length} requests awaiting your approval</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr><th>ID</th><th>Client</th><th>Items</th><th>Weight (T)</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {pendingOrders.length > 0 ? pendingOrders.map(order => {
                  const client = order.distributor?.companyName || order.retailer?.shopName || 'Unknown Client';
                  return (
                    <tr key={order.orderId}>
                      <td><span className="tx-hash">#{order.orderId}</span></td>
                      <td className="primary">{client}</td>
                      <td>{order.items?.length || 0} Products</td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <input 
                              type="number" 
                              step="0.01" 
                              placeholder="Weight (Tons)" 
                              className="btn btn-ghost" 
                              style={{ width: 120, fontSize: 11, textAlign: 'left' }}
                              value={selectedWeight[order.orderId] || ''}
                              onChange={(e) => setSelectedWeight({...selectedWeight, [order.orderId]: e.target.value})}
                            />
                            <select 
                              className="btn btn-ghost" 
                              style={{ flex: 1, fontSize: 11, textAlign: 'left' }}
                              value={selectedTransporter[order.orderId] || ''}
                              onChange={(e) => setSelectedTransporter({...selectedTransporter, [order.orderId]: e.target.value})}
                            >
                              <option value="">-- Choose Transporter --</option>
                              {transporters.map(t => (
                                <option key={t.user.userId} value={t.user.userId}>
                                  {t.companyName} ({t.city})
                                </option>
                              ))}
                            </select>
                          </div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button className="btn btn-primary" style={{ padding: '6px 16px', fontSize: 11 }} onClick={() => handleStatusChange(order.orderId, 'APPROVED')}>Approve & Dispatch</button>
                            <button className="btn btn-ghost" style={{ padding: '6px 16px', fontSize: 11, color: 'var(--red)' }} onClick={() => handleStatusChange(order.orderId, 'REJECTED')}>Reject</button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan="4" style={{ textAlign: 'center', padding: 28, color: 'var(--text-muted)' }}>No new pending requests.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Active Orders */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">🚛 Active & Dispatched Orders</div>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Approved orders being processed or in transit</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr><th>ID</th><th>Client</th><th>Items</th><th>Status</th><th>Updated</th></tr>
              </thead>
              <tbody>
                {activeOrders.length > 0 ? activeOrders.map(order => {
                  const status = (order.orderStatus || '').replace(/\"/g, '');
                  const badge = STATUS_BADGE[status] || { color: 'info', label: status };
                  const client = order.distributor?.companyName || order.retailer?.shopName || 'Unknown Client';
                  return (
                    <tr key={order.orderId}>
                      <td><span className="tx-hash">#{order.orderId}</span></td>
                      <td className="primary">{client}</td>
                      <td>{order.items?.length || 0} Products</td>
                      <td><span className={`badge ${badge.color}`}>{badge.label}</span></td>
                      <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan="5" style={{ textAlign: 'center', padding: 28, color: 'var(--text-muted)' }}>No active orders in process.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* History */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">📜 Fulfillment History</div>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Successfully delivered or rejected historical orders</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr><th>ID</th><th>Client</th><th>Items</th><th>Status</th><th>Date</th></tr>
              </thead>
              <tbody>
                {completedOrders.length > 0 ? completedOrders.map(order => {
                  const status = (order.orderStatus || '').replace(/\"/g, '');
                  const badge = STATUS_BADGE[status] || { color: 'success', label: status };
                  const client = order.distributor?.companyName || order.retailer?.shopName || 'Unknown Client';
                  return (
                    <tr key={order.orderId} style={{ opacity: 0.8 }}>
                      <td><span className="tx-hash">#{order.orderId}</span></td>
                      <td className="primary">{client}</td>
                      <td>{order.items?.length || 0} Products</td>
                      <td><span className={`badge ${badge.color}`}>{badge.label}</span></td>
                      <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan="5" style={{ textAlign: 'center', padding: 28, color: 'var(--text-muted)' }}>No historical records found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
