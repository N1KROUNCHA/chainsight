import { useEffect, useState } from 'react';
import { api } from '../api';

function StockBar({ onHand, reorderPoint, safetyStock }) {
  const max = Math.max(onHand, reorderPoint * 2, 100);
  const pctOnHand = (onHand / max) * 100;
  const pctRop    = (reorderPoint / max) * 100;
  const pctSS     = (safetyStock / max) * 100;
  const barColor  = onHand <= safetyStock ? '#ef4444' : onHand <= reorderPoint ? '#f59e0b' : '#10b981';

  return (
    <div style={{ position: 'relative', height: 8, background: 'var(--bg-hover)', borderRadius: 99, overflow: 'visible', width: '100%' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${pctOnHand}%`, background: barColor, borderRadius: 99, transition: 'width 0.5s ease' }} />
      <div style={{ position: 'absolute', top: -3, left: `${pctRop}%`, width: 2, height: 14, background: '#f59e0b', borderRadius: 1 }} title={`ROP: ${reorderPoint}`} />
      <div style={{ position: 'absolute', top: -3, left: `${pctSS}%`, width: 2, height: 14, background: '#ef4444', borderRadius: 1 }} title={`SS: ${safetyStock}`} />
    </div>
  );
}

export default function Inventory({ user }) {
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState({ productId: '', quantity: 0, reorderPoint: 50, safetyStock: 20 });

  const loadData = async () => {
    setLoading(true);
    try {
      // For retailer, we need their retailerId. For now let's assume userId is ownerId for demo
      // In a real app we'd fetch the retailer record first
      const data = await api.inventory(user.role, user.userId);
      setItems(data);
      const prodList = await api.products();
      setProducts(prodList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newItem.productId) return;
    
    await api.addInventory({
      ownerType: user.role,
      ownerId: user.userId,
      product: { productId: parseInt(newItem.productId) },
      quantity: parseInt(newItem.quantity),
      reorderPoint: parseInt(newItem.reorderPoint),
      safetyStock: parseInt(newItem.safetyStock)
    });
    setShowAdd(false);
    loadData();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this item from your inventory?')) return;
    await api.deleteInventory(id);
    loadData();
  };

  const handleUpdateQty = async (id, newQty) => {
    await api.updateStock(id, newQty);
    loadData();
  };

  if (loading) return <div className="loading-ring" />;

  return (
    <div>
      <div className="page-header">
        <div className="page-title">📦 My Inventory</div>
        <div className="page-desc">Track and manage stock levels for {user.fullName}</div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <div className="card-title">Manage Stock</div>
          <button className="btn btn-primary" onClick={() => setShowAdd(!showAdd)}>
            {showAdd ? 'Cancel' : '+ Add New Item'}
          </button>
        </div>
        
        {showAdd && (
          <form onSubmit={handleAdd} style={{ padding: 16, borderBottom: '1px solid var(--border)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, alignItems: 'flex-end' }}>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>PRODUCT</label>
              <select 
                className="btn btn-ghost" 
                style={{ width: '100%', textAlign: 'left' }}
                value={newItem.productId}
                onChange={e => setNewItem({...newItem, productId: e.target.value})}
                required
              >
                <option value="">Select Product...</option>
                {products.map(p => (
                  <option key={p.productId} value={p.productId}>{p.productName} ({p.category})</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>QUANTITY</label>
              <input 
                type="number" 
                className="btn btn-ghost" 
                style={{ width: '100%', textAlign: 'left' }}
                value={newItem.quantity}
                onChange={e => setNewItem({...newItem, quantity: e.target.value})}
                required
              />
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>ROP</label>
              <input 
                type="number" 
                className="btn btn-ghost" 
                style={{ width: '100%', textAlign: 'left' }}
                value={newItem.reorderPoint}
                onChange={e => setNewItem({...newItem, reorderPoint: e.target.value})}
              />
            </div>
            <button className="btn btn-primary" type="submit">Confirm Add</button>
          </form>
        )}

        <table className="data-table">
          <thead>
            <tr>
              <th>SKU</th><th>Product</th><th>Category</th>
              <th>Quantity</th><th>ROP</th><th>Safety Stock</th>
              <th style={{ minWidth: 140 }}>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.inventoryId}>
                <td><span className="tx-hash">#{item.product.productId}</span></td>
                <td className="primary">{item.product.productName}</td>
                <td>{item.product.category}</td>
                <td style={{ fontWeight: 600 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {item.quantity}
                    <button className="btn btn-ghost" style={{ padding: '2px 6px', fontSize: 10 }} onClick={() => handleUpdateQty(item.inventoryId, item.quantity + 10)}>+</button>
                    <button className="btn btn-ghost" style={{ padding: '2px 6px', fontSize: 10 }} onClick={() => handleUpdateQty(item.inventoryId, Math.max(0, item.quantity - 10))}>-</button>
                  </div>
                </td>
                <td style={{ color: 'var(--yellow)' }}>{item.reorderPoint}</td>
                <td style={{ color: 'var(--red)' }}>{item.safetyStock}</td>
                <td>
                  <StockBar onHand={item.quantity} reorderPoint={item.reorderPoint} safetyStock={item.safetyStock} />
                </td>
                <td>
                  <button className="btn btn-ghost" style={{ color: 'var(--red)' }} onClick={() => handleDelete(item.inventoryId)}>🗑️</button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No items in inventory. Add your first product above!</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
