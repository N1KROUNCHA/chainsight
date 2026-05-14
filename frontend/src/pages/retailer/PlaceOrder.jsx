import { useState, useEffect } from 'react';
import { api } from '../../api';

export default function PlaceOrder({ user }) {
  const [vendors, setVendors] = useState([]); // Both Distributors and Suppliers
  const [availableProducts, setAvailableProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null); // { id, type: 'DISTRIBUTOR' | 'SUPPLIER' }
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [distList, suppList, orderList] = await Promise.all([
          api.distributors(),
          api.suppliers(),
          api.retailerOrders(user.userId)
        ]);
        
        // Combine into unified vendor list
        const allVendors = [
          ...distList.map(d => ({ ...d, type: 'DISTRIBUTOR', name: d.companyName })),
          ...suppList.map(s => ({ ...s, type: 'SUPPLIER', name: s.companyName }))
        ];
        
        setVendors(allVendors);
        setOrders(orderList || []);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };
    if (user && user.userId) fetchData();
  }, [user]);

  useEffect(() => {
    if (selectedVendor) {
      api.inventory(selectedVendor.type, selectedVendor.user.userId)
        .then(data => setAvailableProducts(data))
        .catch(err => console.error(err));
    } else {
      setAvailableProducts([]);
    }
  }, [selectedVendor]);

  const selectVendor = (vendor) => {
    if (!selectedVendor || selectedVendor.user.userId !== vendor.user.userId) {
      setSelectedVendor(vendor);
      setCart([]);
    }
  };

  const filteredItems = availableProducts.filter(item => 
    item.product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (inventoryItem) => {
    const product = inventoryItem.product;
    const existing = cart.find(item => item.productId === product.productId);
    if (existing) {
      updateCartQty(product.productId, existing.quantity + 1);
    } else {
      setCart([...cart, { ...product, quantity: 1, stock: inventoryItem.quantity }]);
    }
  };

  const updateCartQty = (productId, newQty) => {
    if (newQty <= 0) {
      setCart(cart.filter(item => item.productId !== productId));
    } else {
      setCart(cart.map(item => 
        item.productId === productId ? { ...item, quantity: newQty } : item
      ));
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedVendor || cart.length === 0) return;
    
    const orderData = {
      retailer: { user: { userId: user.userId } },
      distributor: selectedVendor.type === 'DISTRIBUTOR' ? { user: { userId: selectedVendor.user.userId } } : null,
      supplier: selectedVendor.type === 'SUPPLIER' ? { user: { userId: selectedVendor.user.userId } } : null,
      items: cart.map(item => ({
        product: { productId: item.productId },
        quantity: item.quantity
      }))
    };

    try {
      await api.createOrder(orderData);
      alert('Order Placed Successfully!');
      setCart([]);
      setSelectedVendor(null);
      const orderList = await api.retailerOrders(user.userId);
      setOrders(orderList || []);
    } catch (err) {
      console.error(err);
      alert('Failed to place order');
    }
  };

  const activeOrders = orders.filter(o => {
    const s = (o.orderStatus || '').toUpperCase().replace(/\"/g, '');
    return s === 'PENDING' || s === 'APPROVED' || s === 'DISPATCHED';
  });
  
  const pastOrders = orders.filter(o => {
    const s = (o.orderStatus || '').toUpperCase().replace(/\"/g, '');
    return s === 'DELIVERED' || s === 'REJECTED' || s === 'CANCELLED';
  });

  const getVendorName = (order) => {
    return order.distributor?.companyName || order.supplier?.companyName || 'Unknown Vendor';
  };

  if (loading) return <div className="loading-ring" />;

  return (
    <div>
      <div className="page-header">
        <div className="page-title">🛒 Order From Supply Chain</div>
        <div className="page-desc">Source directly from suppliers or regional hubs</div>
      </div>

      <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24 }}>
        <div>
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-header">
              <div className="card-title">1. Choose Your Source</div>
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
                {vendors.map(v => (
                  <div 
                    key={`${v.type}-${v.user.userId}`}
                    onClick={() => selectVendor(v)}
                    className={`card-interactive ${selectedVendor?.user.userId === v.user.userId ? 'selected' : ''}`}
                    style={{ minWidth: 180, padding: 12, cursor: 'pointer', border: selectedVendor?.user.userId === v.user.userId ? '2px solid var(--primary)' : '1px solid var(--border)' }}
                  >
                    <div style={{ fontSize: 10, color: v.type === 'SUPPLIER' ? 'var(--accent-2)' : 'var(--accent-3)', fontWeight: 700 }}>{v.type}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}>{v.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>📍 {v.city}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {selectedVendor ? (
            <div className="card">
              <div className="card-header">
                <div className="card-title">2. Available Inventory at {selectedVendor.name}</div>
                <input 
                  type="text" 
                  placeholder="Filter stock..." 
                  className="btn btn-ghost" 
                  style={{ fontSize: 12, padding: '4px 12px', border: '1px solid var(--border)' }}
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="product-list" style={{ padding: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {filteredItems.map(item => (
                  <div key={item.inventoryId} className="card" style={{ padding: 12, background: 'var(--bg-hover)', border: 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{item.product.productName}</div>
                      <div style={{ fontSize: 10, color: 'var(--primary)' }}>Stock: {item.quantity} {item.product.unit}</div>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.product.category}</div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                      <button className="btn btn-primary" style={{ padding: '4px 8px', fontSize: 10 }} onClick={() => addToCart(item)}>+ Add to List</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>👆</div>
              Please select a supplier or distributor to browse available stock.
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title">Items Requested</div>
              <button className="btn btn-ghost" style={{ fontSize: 10 }} onClick={() => setCart([])}>Clear</button>
            </div>
            <div style={{ padding: 16 }}>
              {cart.map(item => (
                <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, fontSize: 13 }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{item.productName}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        Quantity: 
                        <button className="btn btn-ghost" style={{ padding: '2px 6px', fontSize: 10 }} onClick={() => updateCartQty(item.productId, item.quantity - 1)}>-</button>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{item.quantity}</span>
                        <button className="btn btn-ghost" style={{ padding: '2px 6px', fontSize: 10 }} onClick={() => updateCartQty(item.productId, item.quantity + 1)}>+</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {cart.length === 0 && <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)', fontSize: 13 }}>No items selected yet.</div>}
              
              <div style={{ borderTop: '1px solid var(--border)', marginTop: 16, paddingTop: 16 }}>
                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%' }} 
                  disabled={!selectedVendor || cart.length === 0}
                  onClick={handlePlaceOrder}
                >
                  Place Order Request
                </button>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header" style={{ background: '#1e293b50' }}>
              <div className="card-title">Active Requests</div>
            </div>
            <div style={{ padding: 16 }}>
              {activeOrders.map(order => (
                <div key={order.orderId} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong>Req #{order.orderId}</strong>
                    <span className={`badge ${order.orderStatus.toLowerCase().replace(/\"/g, '')}`}>{order.orderStatus.replace(/\"/g, '')}</span>
                  </div>
                  <div style={{ color: 'var(--text-muted)', marginTop: 4 }}>
                    From: {getVendorName(order)} • {order.items?.length || 0} items
                  </div>
                </div>
              ))}
              {activeOrders.length === 0 && <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 11 }}>No active requests.</div>}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">Fulfilled History</div>
            </div>
            <div style={{ padding: 16 }}>
              {pastOrders.map(order => (
                <div key={order.orderId} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: 12, opacity: 0.7 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong>Req #{order.orderId}</strong>
                    <span className={`badge ${order.orderStatus.toLowerCase().replace(/\"/g, '')}`}>{order.orderStatus.replace(/\"/g, '')}</span>
                  </div>
                  <div style={{ color: 'var(--text-muted)', marginTop: 4 }}>
                    From: {getVendorName(order)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
