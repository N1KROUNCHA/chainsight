import { useEffect, useState } from 'react';
import { api } from '../../api';

const STATUS_BADGE = {
  PENDING:   { color: 'warn',    label: '⏳ Pending'   },
  APPROVED:  { color: 'info',    label: '✅ Approved'  },
  DISPATCHED:{ color: 'primary', label: '🚛 Dispatched'},
  IN_TRANSIT:{ color: 'primary', label: '🚚 In Transit'},
  DELIVERED: { color: 'success', label: '📦 Delivered' },
  REJECTED:  { color: 'danger',  label: '❌ Rejected'  },
};

export default function IncomingShipments({ user }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = user.role === 'RETAILER' 
        ? await api.retailerOrders(user.userId)
        : await api.distributorOutboundOrders(user.userId);
      
      // We only care about orders that are at least APPROVED or better
      const active = (data || []).filter(o => 
        ['APPROVED', 'DISPATCHED', 'IN_TRANSIT', 'DELIVERED'].includes((o.orderStatus || '').replace(/"/g, ''))
      );
      setOrders(active);
    } catch (err) {
      console.error('Failed to load incoming shipments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [user]);

  const handleMarkReceived = async (orderId) => {
    try {
      await api.updateOrderStatus(orderId, 'DELIVERED');
      loadData();
    } catch (err) {
      alert('Failed to mark order as delivered.');
    }
  };

  if (loading) return <div className="loading-ring" />;

  const getVendorName = (order) => order.supplier?.companyName || order.distributor?.companyName || 'Vendor';

  return (
    <div>
      <div className="page-header">
        <div className="page-title">📦 Incoming Shipments & Tracking</div>
        <div className="page-desc">Track live deliveries, assigned trucks, and estimated arrival times for your orders</div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">🚛 Active Deliveries</div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{orders.length} shipments tracked</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr><th>Order ID</th><th>Vendor</th><th>Truck #</th><th>Driver</th><th>ETA</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {orders.map(order => {
                const status = (order.orderStatus || '').replace(/"/g, '');
                const badge = STATUS_BADGE[status] || { color: 'info', label: status };
                const hasTruck = !!order.assignedTruck;
                
                let eta = '—';
                if (status === 'DISPATCHED') eta = '2.5 hrs';
                if (status === 'IN_TRANSIT') eta = '45 mins';
                if (status === 'DELIVERED')  eta = 'Arrived';
                if (status === 'APPROVED' && !hasTruck) eta = 'Awaiting Pickup';

                return (
                  <tr key={order.orderId}>
                    <td><span className="tx-hash">#{order.orderId}</span></td>
                    <td className="primary">{getVendorName(order)}</td>
                    <td style={{ fontWeight: 600 }}>
                      {hasTruck ? order.assignedTruck.truckNumber : <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>Not assigned yet</span>}
                    </td>
                    <td>{hasTruck ? (order.assignedTruck.owner?.user?.fullName || 'Transporter') : '—'}</td>
                    <td style={{ color: eta.includes('hrs') ? 'var(--yellow)' : eta.includes('mins') ? 'var(--green)' : 'var(--text)' }}>
                      {eta}
                    </td>
                    <td><span className={`badge ${badge.color}`}>{badge.label}</span></td>
                    <td>
                      {['DISPATCHED', 'IN_TRANSIT'].includes(status) && (
                        <button 
                          className="btn btn-primary" 
                          style={{ padding: '4px 10px', fontSize: 10 }}
                          onClick={() => handleMarkReceived(order.orderId)}
                        >
                          Confirm Receipt
                        </button>
                      )}
                      {status === 'DELIVERED' && (
                        <span style={{ fontSize: 10, color: 'var(--green)', fontWeight: 600 }}>✅ Completed</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {orders.length === 0 && (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🛰️</div>
                  No active incoming shipments found.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
