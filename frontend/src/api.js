// Central API layer — all data fetched from localhost:4000
const BASE = 'http://localhost:4000/api';

async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export const api = {
  health:     () => get('/health'),
  kpis:       () => get('/kpis'),
  forecast:   () => get('/forecast'),
  
  // Multi-role Inventory
  inventory:  (role, id) => get(`/inventory/${role}/${id}`),
  addInventory: (data) => post('/inventory', data),
  deleteInventory: (id) => del(`/inventory/${id}`),
  updateStock: (id, qty) => put(`/inventory/${id}`, qty),
  
  products:   () => get('/products'),
  addProduct: (data) => post('/products', data),
  suppliers:  () => get('/users/suppliers'),
  distributors: () => get('/users/distributors'),
  
  createOrder: (data) => post('/orders', data),
  retailerOrders: (id) => get(`/orders/retailer/${id}`),
  distributorOrders: (id) => get(`/orders/distributor/${id}`),
  supplierOrders: (id) => get(`/orders/supplier/${id}`),
  updateOrderStatus: (id, status) => patch(`/orders/${id}/status`, status),
  
  bottleneck: () => get('/bottleneck'),
  logistics:  () => get('/logistics'),
  blockchain: () => get('/blockchain/events'),
  alerts:     () => get('/alerts'),
  qr:         () => get('/qr'),
  qrCode:   (code) => get(`/qr/${code}`),

  // Transporter Module
  trucks: (ownerId) => get(`/trucks/owner/${ownerId}`),
  addTruck: (data) => post('/trucks', data),
  openRequests: () => get('/orders/open-requests'),
  activeJobs: (ownerId) => get(`/orders/truck-owner/${ownerId}/active-jobs`),
  assignTruck: (orderId, truckId) => patch(`/orders/${orderId}/assign-truck/${truckId}`, {}),
};

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return res.json();
}

async function put(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return res.json();
}

async function patch(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return res.json();
}

async function del(path) {
  const res = await fetch(`${BASE}${path}`, { method: 'DELETE' });
  return res.ok;
}
