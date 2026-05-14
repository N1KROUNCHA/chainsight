import { useEffect, useState } from 'react';
import { api } from '../../api';

const STATUS_BADGE = {
  PENDING:   { color: 'warn',    label: '⏳ Pending'   },
  APPROVED:  { color: 'info',    label: '✅ Approved'  },
  DISPATCHED:{ color: 'info',    label: '🚛 Dispatched'},
  DELIVERED: { color: 'success', label: '📦 Delivered' },
  REJECTED:  { color: 'danger',  label: '❌ Rejected'  },
};

export default function SupplierRequestStatus({ user }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch orders PLACED by this user (as buyer)
      const isRetailer = user.role === 'RETAILER';
      const data = isRetailer 
        ? await api.retailerOrders(user.userId).catch(() => [])
        : await api.distributorOrders(user.userId).catch(() => []);
      
      setOrders(data || []);
    } catch (err) {
      console.error('Failed to load supplier requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [user]);

  if (loading) return <div className="loading-ring" />;

  const activeRequests = orders.filter(o => {
    const s = (o.orderStatus || '').toUpperCase().replace(/\"/g, '');
    return ['PENDING', 'APPROVED', 'DISPATCHED'].includes(s);
  });
  
  const completedRequests = orders.filter(o => {
    const s = (o.orderStatus || '').toUpperCase().replace(/\"/g, '');
    return ['DELIVERED', 'REJECTED'].includes(s);
  });

  const getVendorName = (order) => {
    return order.supplier?.companyName || order.distributor?.companyName || 'Vendor';
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">📡 Outbound Order Status</div>
        <div className="page-desc">Track status of inventory orders placed to suppliers or distributors</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* Active Requests */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">🚛 Active Outbound Requests</div>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Orders awaiting fulfillment or currently in transit</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr><th>ID</th><th>Vendor</th><th>Items</th><th>Weight</th><th>Status</th><th>Updated</th></tr>
              </thead>
              <tbody>
                {activeRequests.length > 0 ? activeRequests.map(order => {
                  const status = (order.orderStatus || '').replace(/"/g, '');
                  const badge  = STATUS_BADGE[status] || { color: status.toLowerCase(), label: status };
                  return (
                    <tr key={order.orderId}>
                      <td><span className="tx-hash">#{order.orderId}</span></td>
                      <td className="primary">{getVendorName(order)}</td>
                      <td>{order.items?.length || 0} item(s)</td>
                      <td>{order.weightTons ? `${order.weightTons} tons` : 'Pending'}</td>
                      <td><span className={`badge ${badge.color}`}>{badge.label}</span></td>
                      <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: 28, color: 'var(--text-muted)' }}>
                    No active outbound requests.
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* History */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">📜 Order History</div>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Previously delivered or rejected orders</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr><th>ID</th><th>Vendor</th><th>Items</th><th>Status</th><th>Date</th></tr>
              </thead>
              <tbody>
                {completedRequests.length > 0 ? completedRequests.map(order => {
                  const status = (order.orderStatus || '').replace(/"/g, '');
                  const badge  = STATUS_BADGE[status] || { color: status.toLowerCase(), label: status };
                  return (
                    <tr key={order.orderId} style={{ opacity: 0.8 }}>
                      <td><span className="tx-hash">#{order.orderId}</span></td>
                      <td className="primary">{getVendorName(order)}</td>
                      <td>{order.items?.length || 0} item(s)</td>
                      <td><span className={`badge ${badge.color}`}>{badge.label}</span></td>
                      <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan="5" style={{ textAlign: 'center', padding: 28, color: 'var(--text-muted)' }}>
                    No historical orders.
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
