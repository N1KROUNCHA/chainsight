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
  me: (id) => get(`/users/${id}`),
  
  createOrder: (data) => post('/orders', data),
  retailerOrders: (id) => get(`/orders/retailer/${id}`),
  distributorInboundOrders: (id) => get(`/orders/distributor/${id}/inbound`),
  distributorOutboundOrders: (id) => get(`/orders/distributor/${id}/outbound`),
  supplierOrders: (id) => get(`/orders/supplier/${id}`),
  updateOrderStatus: (id, status, weight) => {
    const url = weight ? `/orders/${id}/status?weight=${weight}` : `/orders/${id}/status`;
    return patch(url, status);
  },
  
  bottleneck: () => get('/bottleneck'),
  logistics:  () => get('/logistics'),
  blockchain: () => get('/blockchain/events'),
  getBlockchainByOrder: (orderId) => get(`/blockchain/order/${orderId}`),
  alerts:     () => get('/alerts'),
  qr:         () => get('/qr'),
  qrCode:   (code) => get(`/qr/${code}`),

  // Transporter Module
  transporters: () => get('/orders/transporters'),
  assignTransporter: (orderId, userId) => patch(`/orders/${orderId}/assign-transporter/${userId}`, {}),
  trucks: (ownerId) => get(`/trucks/owner/${ownerId}`),
  addTruck: (data) => post('/trucks', data),
  openRequests: (transporterUserId) => {
    const url = transporterUserId ? `/orders/open-requests?transporterUserId=${transporterUserId}` : '/orders/open-requests';
    return get(url);
  },
  activeJobs: (ownerId) => get(`/orders/truck-owner/${ownerId}/active-jobs`),
  assignTruck: (orderId, truckId) => patch(`/orders/${orderId}/assign-truck/${truckId}`, {}),
  stake: (userId, amount) => post(`/users/${userId}/stake`, { amount }),
};

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || `POST ${path} failed: ${res.status}`);
  return data;
}

async function put(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || `PUT ${path} failed: ${res.status}`);
  return data;
}

async function patch(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || `PATCH ${path} failed: ${res.status}`);
  return data;
}

async function del(path) {
  const res = await fetch(`${BASE}${path}`, { method: 'DELETE' });
  return res.ok;
}
