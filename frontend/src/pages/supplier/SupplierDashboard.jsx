import { useEffect, useState } from 'react';
import { api } from '../../api';
import BlockchainLiveFeed from '../../components/BlockchainLiveFeed';

export default function SupplierDashboard({ user }) {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({ productName: '', category: '', unit: '' });
  
  const [kpis, setKpis] = useState({
    totalProducts: 0,
    pendingRequests: 0,
    activeShipments: 0,
    totalVolume: 0,
    trustScore: user.reputation?.score || 10.0,
    stake: user.reputation?.stakeBalance || 0.0
  });

  const [stakeAmount, setStakeAmount] = useState('');
  const [staking, setStaking] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [orderData, prodData, invData] = await Promise.all([
        api.supplierOrders(user.userId).catch(() => []),
        api.products().catch(() => []),
        api.inventory('SUPPLIER', user.userId).catch(() => [])
      ]);
      
      const oList = orderData || [];
      const pList = prodData || [];
      const iList = invData || [];
      
      // Filter products belonging to this supplier (assuming backend doesn't filter, we filter here for demo)
      const myProducts = pList.filter(p => p.supplier?.user?.userId === user.userId);
      
      setOrders(oList);
      setProducts(myProducts);
      setInventory(iList);

      const pending = oList.filter(o => {
          const s = (o.orderStatus || '').replace(/\"/g, '');
          return s === 'PENDING';
      }).length;
      
      const activeShip = oList.filter(o => {
          const s = (o.orderStatus || '').replace(/\"/g, '');
          return s === 'DISPATCHED';
      }).length;
      
      const totalVol = oList.filter(o => {
          const s = (o.orderStatus || '').replace(/\"/g, '');
          return s === 'DELIVERED';
      }).reduce((sum, o) => sum + (o.items?.length || 0), 0);

      setKpis({ 
        totalProducts: myProducts.length,
        pendingRequests: pending,
        activeShipments: activeShip,
        totalVolume: totalVol
      });
    } catch (err) {
      console.error('Failed to load supplier data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.userId) loadData();
  }, [user]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      loadData();
    } catch (err) {
      alert('Failed to update order');
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      await api.addProduct({
        supplier: { user: { userId: user.userId } },
        productName: newProduct.productName,
        category: newProduct.category,
        unit: newProduct.unit
      });
      setNewProduct({ productName: '', category: '', unit: '' });
      setShowAddProduct(false);
      loadData();
    } catch (err) {
      alert('Failed to add product');
    }
  };

  const handleStake = async (e) => {
    e.preventDefault();
    if (!stakeAmount || isNaN(stakeAmount)) return;
    setStaking(true);
    try {
      await api.stake(user.userId, parseFloat(stakeAmount));
      setStakeAmount('');
      alert('Stake successful!');
      window.location.reload();
    } catch (err) {
      alert('Staking failed.');
    } finally {
      setStaking(false);
    }
  };

  if (loading) return <div className="loading-ring" />;

  return (
    <div>
      <div className="page-header">
        <div className="page-title">🏭 Supplier / Manufacturer Panel</div>
        <div className="page-desc">Manage products, outgoing inventory, and distributor requests for {user.fullName}</div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card purple">
          <div className="kpi-label">Total Products</div>
          <div className="kpi-value">{kpis.totalProducts}</div>
          <div className="kpi-icon purple">📋</div>
        </div>
        <div className="kpi-card yellow">
          <div className="kpi-label">Pending Requests</div>
          <div className="kpi-value">{kpis.pendingRequests}</div>
          <div className="kpi-icon yellow">📥</div>
        </div>
        <div className="kpi-card green">
          <div className="kpi-label">Active Shipments</div>
          <div className="kpi-value">{kpis.activeShipments}</div>
          <div className="kpi-icon green">🚛</div>
        </div>
        <div className="kpi-card cyan">
          <div className="kpi-label">Completed Orders</div>
          <div className="kpi-value">{kpis.totalVolume}</div>
          <div className="kpi-icon cyan">📊</div>
        </div>
        <div className="kpi-card gold" style={{ background: 'linear-gradient(135deg, #FFD70020, #FFA50020)', border: '1px solid #FFD70040' }}>
          <div className="kpi-label">Trust Score</div>
          <div className="kpi-value">{user.reputation?.score?.toFixed(2) || '10.00'}</div>
          <div className="kpi-icon" style={{ color: '#FFD700' }}>🏆</div>
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div className="card">
                <div className="card-header">
                  <div className="card-title">Product Catalog</div>
                  <button className="btn btn-primary" style={{ fontSize: 10, padding: '4px 8px' }} onClick={() => setShowAddProduct(!showAddProduct)}>
                      {showAddProduct ? 'Cancel' : '+ Add Product'}
                  </button>
                </div>
                
                {showAddProduct && (
                    <form onSubmit={handleAddProduct} style={{ padding: 16, borderBottom: '1px solid var(--border)', background: 'var(--bg-hover)' }}>
                        <div style={{ marginBottom: 12 }}>
                            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Product Name</label>
                            <input className="btn btn-ghost" style={{ width: '100%', textAlign: 'left', cursor: 'text' }} value={newProduct.productName} onChange={e => setNewProduct({...newProduct, productName: e.target.value})} required />
                        </div>
                        <div style={{ marginBottom: 12 }}>
                            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Category</label>
                            <input className="btn btn-ghost" style={{ width: '100%', textAlign: 'left', cursor: 'text' }} value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} required />
                        </div>
                        <div style={{ marginBottom: 12 }}>
                            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Unit (e.g. METERS, BOXES)</label>
                            <input className="btn btn-ghost" style={{ width: '100%', textAlign: 'left', cursor: 'text' }} value={newProduct.unit} onChange={e => setNewProduct({...newProduct, unit: e.target.value})} required />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Save Product</button>
                    </form>
                )}

                <div style={{ padding: 16 }}>
                    {products.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {products.map(p => (
                                <div key={p.productId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: 13 }}>{p.productName}</div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.category}</div>
                                    </div>
                                    <div style={{ fontSize: 11, color: 'var(--primary)' }}>
                                        Unit: {p.unit}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No products in your catalog.</div>
                    )}
                </div>
              </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div className="card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div className="card-header" style={{ borderBottom: '1px solid var(--border)' }}>
                  <div className="card-title">🛡️ Supplier Reputation & Trust</div>
                </div>
                <div style={{ padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                    <div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Trust Score</div>
                      <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary)' }}>{user.reputation?.score?.toFixed(2) || '10.00'}</div>
                      <div style={{ fontSize: 11, marginTop: 4 }}>
                        <span className="badge success" style={{ fontSize: 9 }}>TOP RATED</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Active Stake</div>
                      <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--accent)' }}>${user.reputation?.stakeBalance?.toFixed(2) || '0.00'}</div>
                    </div>
                  </div>

                  <form onSubmit={handleStake} style={{ display: 'flex', gap: 10 }}>
                    <input
                      className="btn btn-ghost"
                      style={{ flex: 1, textAlign: 'left', cursor: 'text' }}
                      placeholder="Amount to stake..."
                      value={stakeAmount}
                      onChange={e => setStakeAmount(e.target.value)}
                      type="number"
                    />
                    <button type="submit" className="btn btn-primary" disabled={staking}>
                      {staking ? '...' : 'Stake'}
                    </button>
                  </form>
                </div>
              </div>

              <BlockchainLiveFeed />
              <div className="card">
                <div className="card-header">
                  <div className="card-title">Regional Demand Analytics</div>
                </div>
                <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                    <div style={{ fontSize: 40, marginBottom: 16 }}>📊</div>
                    Demand graphs will appear here once sufficient order data is collected across regions.
                </div>
              </div>
          </div>
      </div>
    </div>
  );
}
