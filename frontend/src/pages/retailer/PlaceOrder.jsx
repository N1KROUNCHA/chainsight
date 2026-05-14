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
        let distList = [];
        let suppList = [];
        let orderList = [];

        if (user?.role === 'RETAILER') {
          distList = await api.distributors();
          orderList = await api.retailerOrders(user.userId) || [];
        } else if (user?.role === 'DISTRIBUTOR') {
          suppList = await api.suppliers();
          orderList = await api.distributorOrders(user.userId) || [];
        }
        
        // Combine into unified vendor list
        const allVendors = [
          ...distList.map(d => ({ ...d, type: 'DISTRIBUTOR', name: d.companyName })),
          ...suppList.map(s => ({ ...s, type: 'SUPPLIER', name: s.companyName }))
        ];
        
        setVendors(allVendors);
        setOrders(orderList);
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
    
    // Determine buyer based on role
    const isRetailer = user.role === 'RETAILER';
    const isDistributor = user.role === 'DISTRIBUTOR';

    const orderData = {
      retailer: isRetailer ? { user: { userId: user.userId } } : null,
      distributor: isDistributor ? { user: { userId: user.userId } } : 
                   (selectedVendor.type === 'DISTRIBUTOR' ? { user: { userId: selectedVendor.user.userId } } : null),
      supplier: selectedVendor.type === 'SUPPLIER' ? { user: { userId: selectedVendor.user.userId } } : null,
      weightTons: null, // Will be specified by transporter when assigning truck
      items: cart.map(item => ({
        product: { productId: item.productId },
        quantity: item.quantity,
        price: item.unitPrice || 0
      }))
    };

    console.log('Placing order payload:', JSON.stringify(orderData, null, 2));

    try {
      const result = await api.createOrder(orderData);
      console.log('Order response:', result);
      if (result?.orderId) {
        alert(`✅ Order #${result.orderId} placed successfully! Awaiting approval from ${selectedVendor.name}.`);
        setCart([]);
        setSelectedVendor(null);
        const orderList = isRetailer ? await api.retailerOrders(user.userId) : await api.distributorOrders(user.userId);
        setOrders(orderList || []);
      } else {
        alert('Order may have failed — check the browser console for details.');
      }
    } catch (err) {
      console.error('Order error:', err);
      alert(`Failed to place order: ${err.message}`);
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1000, margin: '0 auto' }}>
        <div className="card">
          <div className="card-header">
            <div className="card-title">1. Choose Your Source</div>
          </div>
          <div style={{ padding: 16 }}>
            {vendors.length === 0 && (
              <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: 24 }}>
                No suppliers or distributors found in the system.
              </div>
            )}
            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
              {vendors.map(v => (
                <div 
                  key={`${v.type}-${v.user.userId}`}
                  onClick={() => selectVendor(v)}
                  style={{ 
                    minWidth: 180, padding: 14, cursor: 'pointer', borderRadius: 10,
                    border: selectedVendor?.user.userId === v.user.userId ? '2px solid var(--accent)' : '1px solid var(--border)',
                    background: selectedVendor?.user.userId === v.user.userId ? 'var(--bg-hover)' : 'var(--bg-card-2)',
                    transition: 'all 0.2s',
                    flexShrink: 0
                  }}
                >
                  <div style={{ 
                    fontSize: 10, fontWeight: 700, marginBottom: 6,
                    color: v.type === 'SUPPLIER' ? 'var(--accent-2)' : 'var(--accent-3)',
                  }}>
                    {v.type === 'SUPPLIER' ? '🏭 SUPPLIER' : '🏗️ DISTRIBUTOR'}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{v.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>📍 {v.city}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 6 }}>
                    Approves: {v.type === 'SUPPLIER' ? 'Supplier' : 'Distributor'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24 }}>
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
        </div>
      </div>
    </div>
  );
}
