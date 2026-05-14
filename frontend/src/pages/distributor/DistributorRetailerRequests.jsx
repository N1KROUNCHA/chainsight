import { useEffect, useState } from 'react';
import { api } from '../../api';

const STATUS_BADGE = {
  PENDING:   { color: 'warn',    label: '⏳ Pending'   },
  APPROVED:  { color: 'info',    label: '✅ Approved'  },
  DISPATCHED:{ color: 'info',    label: '🚛 Dispatched'},
  DELIVERED: { color: 'success', label: '📦 Delivered' },
  REJECTED:  { color: 'danger',  label: '❌ Rejected'  },
};

export default function DistributorRetailerRequests({ user }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedWeight, setSelectedWeight] = useState({});

  const loadData = async () => {
    setLoading(true);
    try {
      const orderData = await api.distributorInboundOrders(user.userId).catch(() => []);
      setOrders(orderData || []);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [user]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const weight = selectedWeight[orderId];
      if (newStatus === 'APPROVED' && (!weight || parseFloat(weight) <= 0)) {
        alert('Please specify the order weight in Tons before approving.');
        return;
      }
      await api.updateOrderStatus(orderId, newStatus, weight);
      loadData();
    } catch (err) {
      alert('Failed to update order');
    }
  };

  if (loading) return <div className="loading-ring" />;

  const pendingRequests  = orders.filter(o => ['PENDING', 'REJECTED'].includes((o.orderStatus || '').replace(/"/g, '')));
  const activeShipments  = orders.filter(o => ['APPROVED', 'DISPATCHED', 'DELIVERED'].includes((o.orderStatus || '').replace(/"/g, '')));

  return (
    <div>
      <div className="page-header">
        <div className="page-title">🤝 Manage Retailer Requests</div>
        <div className="page-desc">Approve or reject incoming order requests from retailers in your region</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* ── Pending Requests (need Approve / Reject) ── */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">📬 Pending Retailer Requests</div>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {pendingRequests.filter(o => (o.orderStatus || '').replace(/"/g, '') === 'PENDING').length} awaiting your decision
            </span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr><th>ID</th><th>Retailer</th><th>Items</th><th>Weight (T)</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {pendingRequests.length > 0 ? pendingRequests.map(order => {
                  const status = (order.orderStatus || '').replace(/"/g, '');
                  const badge  = STATUS_BADGE[status] || { color: status.toLowerCase(), label: status };
                  return (
                    <tr key={order.orderId}>
                      <td><span className="tx-hash">#{order.orderId}</span></td>
                      <td className="primary">{order.retailer?.shopName || 'Retailer'}</td>
                      <td>{order.items?.length || 0} item(s)</td>
                      <td>
                        {status === 'PENDING' ? (
                          <input 
                            type="number" 
                            step="0.1" 
                            placeholder="0.0"
                            style={{ width: 60, padding: '4px 8px', fontSize: 11, border: '1px solid var(--border)', borderRadius: 4, background: 'var(--bg-card-2)' }}
                            value={selectedWeight[order.orderId] || ''}
                            onChange={e => setSelectedWeight({ ...selectedWeight, [order.orderId]: e.target.value })}
                          />
                        ) : (
                          <span>{order.weightTons || '—'}</span>
                        )}
                      </td>
                      <td><span className={`badge ${badge.color}`}>{badge.label}</span></td>
                      <td>
                        {status === 'PENDING' && (
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              className="btn btn-primary"
                              style={{ padding: '4px 10px', fontSize: 11 }}
                              onClick={() => handleStatusChange(order.orderId, 'APPROVED')}
                            >
                              Approve
                            </button>
                            <button
                              className="btn btn-ghost"
                              style={{ padding: '4px 10px', fontSize: 11, color: 'var(--red)' }}
                              onClick={() => handleStatusChange(order.orderId, 'REJECTED')}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        {status === 'REJECTED' && (
                          <span style={{ fontSize: 11, color: 'var(--red)' }}>Request Rejected</span>
                        )}
                      </td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan="5" style={{ textAlign: 'center', padding: 28, color: 'var(--text-muted)' }}>
                    No pending requests at this time.
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Active Shipments ── */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">🚛 Active Shipments to Retailers</div>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Approved orders and ongoing deliveries</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr><th>ID</th><th>Retailer</th><th>Items</th><th>Truck</th><th>Status</th></tr>
              </thead>
              <tbody>
                {activeShipments.length > 0 ? activeShipments.map(order => {
                  const status = (order.orderStatus || '').replace(/"/g, '');
                  const badge  = STATUS_BADGE[status] || { color: status.toLowerCase(), label: status };
                  return (
                    <tr key={order.orderId}>
                      <td><span className="tx-hash">#{order.orderId}</span></td>
                      <td className="primary">{order.retailer?.shopName || 'Retailer'}</td>
                      <td>{order.items?.length || 0} item(s)</td>
                      <td style={{ fontSize: 12 }}>{order.assignedTruck?.truckNumber || <span style={{ color: 'var(--text-muted)' }}>Awaiting truck</span>}</td>
                      <td><span className={`badge ${badge.color}`}>{badge.label}</span></td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan="5" style={{ textAlign: 'center', padding: 28, color: 'var(--text-muted)' }}>
                    No active shipments yet.
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
