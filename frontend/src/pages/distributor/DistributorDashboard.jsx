import { useEffect, useState } from 'react';
import { api } from '../../api';
import BlockchainLiveFeed from '../../components/BlockchainLiveFeed';

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
  const [stakeAmount, setStakeAmount] = useState('');
  const [staking, setStaking] = useState(false);

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

      const totalVolume = iList.reduce((sum, item) => sum + item.quantity, 0);
      const lowStockItems = iList.filter(item => item.quantity <= item.reorderPoint).length;
      const pendingOrders = oList.filter(o => ['PENDING', 'APPROVED'].includes((o.orderStatus || '').replace(/"/g, ''))).length;
      const activeShipments = oList.filter(o => ['DISPATCHED'].includes((o.orderStatus || '').replace(/"/g, ''))).length;

      setKpis({ totalVolume, pendingOrders, lowStockItems, activeShipments });
    } catch (err) {
      console.error('Failed to load distributor data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [user]);

  const handleStake = async (e) => {
    e.preventDefault();
    if (!stakeAmount || isNaN(stakeAmount)) return;
    setStaking(true);
    try {
      await api.stake(user.userId, parseFloat(stakeAmount));
      setStakeAmount('');
      alert('Stake successful! Your trust score is now backed by collateral.');
      window.location.reload();
    } catch (err) {
      alert('Staking failed.');
    } finally {
      setStaking(false);
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
        <div className="kpi-card gold">
          <div className="kpi-label">Trust Score</div>
          <div className="kpi-value">{user.reputation?.score?.toFixed(2) || '10.00'}</div>
          <div className="kpi-icon gold">🏆</div>
        </div>
        <div className="kpi-card green">
          <div className="kpi-label">Active Shipments</div>
          <div className="kpi-value">{kpis.activeShipments}</div>
          <div className="kpi-icon green">🚛</div>
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="card-header"><div className="card-title">🛡️ Distributor Trust & Collateral</div></div>
            <div style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Trust Score</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--gold)' }}>{user.reputation?.score?.toFixed(2) || '10.00'}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Inventory Stake</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--accent)' }}>${user.reputation?.stakeBalance?.toFixed(2) || '0.00'}</div>
                </div>
              </div>
              <form onSubmit={handleStake} style={{ display: 'flex', gap: 10 }}>
                <input className="btn btn-ghost" style={{ flex: 1 }} placeholder="Deposit Stake" value={stakeAmount} onChange={e => setStakeAmount(e.target.value)} type="number" />
                <button type="submit" className="btn btn-primary" disabled={staking}>{staking ? '...' : 'Stake'}</button>
              </form>
            </div>
          </div>
          <BlockchainLiveFeed />
        </div>
      </div>
    </div>
  );
}
