import { useState, useEffect } from 'react';
import { api } from '../../api';

const TRUCK_SIZES = [
  { label: 'Small — 5 Ton', capacity: '5.00', icon: '🚐', color: 'cyan' },
  { label: 'Medium — 15 Ton', capacity: '15.00', icon: '🚚', color: 'green' },
  { label: 'Large — 25 Ton', capacity: '25.00', icon: '🚛', color: 'purple' },
];

const COMMON_ROUTES = [
  'Mumbai → Pune → Hyderabad',
  'Delhi → Jaipur → Ahmedabad',
  'Surat → Indore → Bhopal',
  'Chennai → Bangalore → Mysore',
  'Kolkata → Patna → Varanasi',
];

export default function TruckOwnerDashboard({ user }) {
  const [trucks, setTrucks] = useState([]);
  const [openRequests, setOpenRequests] = useState([]);
  const [activeJobs, setActiveJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Accept Load state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedTruck, setSelectedTruck] = useState('');

  // Add Truck form state
  const [showAddTruck, setShowAddTruck] = useState(false);
  const [addTruckLoading, setAddTruckLoading] = useState(false);
  const [newTruck, setNewTruck] = useState({
    truckNumber: '',
    selectedSize: null,
    currentCity: '',
    route: '',
    customRoute: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [trucksData, reqData, jobsData] = await Promise.all([
        api.trucks(user.userId).catch(() => []),
        api.openRequests().catch(() => []),
        api.activeJobs(user.userId).catch(() => []),
      ]);
      setTrucks(trucksData || []);
      setOpenRequests(reqData || []);
      setActiveJobs(jobsData || []);
    } catch (err) {
      console.error('Failed to load transporter data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.userId) loadData();
  }, [user]);

  const handleAcceptLoad = async (e) => {
    e.preventDefault();
    if (!selectedOrder || !selectedTruck) return;
    try {
      await api.assignTruck(selectedOrder.orderId, selectedTruck);
      setSelectedOrder(null);
      setSelectedTruck('');
      loadData();
    } catch (err) {
      alert('Failed to accept load. Truck might be full.');
    }
  };

  const handleAddTruck = async (e) => {
    e.preventDefault();
    if (!newTruck.selectedSize) { alert('Please select a truck size.'); return; }
    setAddTruckLoading(true);
    const route = newTruck.route === '__custom__' ? newTruck.customRoute : newTruck.route;
    try {
      await api.addTruck({
        owner: { user: { userId: user.userId } },
        truckNumber: newTruck.truckNumber,
        capacityTons: newTruck.selectedSize.capacity,
        currentCity: newTruck.currentCity,
        route: route,
        availabilityStatus: 'AVAILABLE',
      });
      setNewTruck({ truckNumber: '', selectedSize: null, currentCity: '', route: '', customRoute: '' });
      setShowAddTruck(false);
      loadData();
    } catch (err) {
      alert('Failed to add truck.');
    } finally {
      setAddTruckLoading(false);
    }
  };

  if (loading) return <div className="loading-ring" />;

  const availableCount = trucks.filter(t => t.availabilityStatus !== 'FULL').length;
  const totalCapacity = trucks.reduce((sum, t) => sum + parseFloat(t.capacityTons || 0), 0);
  const usedCapacity = trucks.reduce((sum, t) => sum + (parseFloat(t.capacityTons || 0) - parseFloat(t.availableCapacityTons || 0)), 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">🚛 Transporter Command Center</div>
          <div className="page-desc">Manage fleet dispatch, accept shipment jobs, and track deliveries for {user.fullName}</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddTruck(!showAddTruck)}>
          {showAddTruck ? '✕ Cancel' : '+ Add Truck'}
        </button>
      </div>

      {/* ── Add Truck Form ── */}
      {showAddTruck && (
        <div className="card" style={{ marginBottom: 24, border: '1px solid var(--primary)' }}>
          <div className="card-header">
            <div className="card-title">Register New Truck</div>
          </div>
          <form onSubmit={handleAddTruck} style={{ padding: 20 }}>
            {/* Size Selection */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 10 }}>Select Truck Size</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {TRUCK_SIZES.map(size => (
                  <div
                    key={size.capacity}
                    onClick={() => setNewTruck({ ...newTruck, selectedSize: size })}
                    style={{
                      padding: '16px 12px',
                      border: `2px solid ${newTruck.selectedSize?.capacity === size.capacity ? 'var(--primary)' : 'var(--border)'}`,
                      borderRadius: 10,
                      cursor: 'pointer',
                      textAlign: 'center',
                      background: newTruck.selectedSize?.capacity === size.capacity ? 'var(--bg-hover)' : 'var(--bg-card-2)',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ fontSize: 28, marginBottom: 6 }}>{size.icon}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: newTruck.selectedSize?.capacity === size.capacity ? 'var(--primary)' : 'var(--text)' }}>
                      {size.capacity} Tons
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{size.label.split('—')[0].trim()}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Truck Number (Registration)</label>
                <input
                  className="btn btn-ghost"
                  style={{ width: '100%', textAlign: 'left', cursor: 'text' }}
                  placeholder="e.g. MH-04-AB-1234"
                  value={newTruck.truckNumber}
                  onChange={e => setNewTruck({ ...newTruck, truckNumber: e.target.value })}
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Current Location / City</label>
                <input
                  className="btn btn-ghost"
                  style={{ width: '100%', textAlign: 'left', cursor: 'text' }}
                  placeholder="e.g. Mumbai"
                  value={newTruck.currentCity}
                  onChange={e => setNewTruck({ ...newTruck, currentCity: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Route</label>
              <select
                className="btn btn-ghost"
                style={{ width: '100%', textAlign: 'left', marginBottom: newTruck.route === '__custom__' ? 10 : 0 }}
                value={newTruck.route}
                onChange={e => setNewTruck({ ...newTruck, route: e.target.value })}
                required
              >
                <option value="" disabled>-- Select a Route --</option>
                {COMMON_ROUTES.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
                <option value="__custom__">✏️ Enter Custom Route</option>
              </select>
              {newTruck.route === '__custom__' && (
                <input
                  className="btn btn-ghost"
                  style={{ width: '100%', textAlign: 'left', cursor: 'text' }}
                  placeholder="e.g. Surat → Bhopal → Agra"
                  value={newTruck.customRoute}
                  onChange={e => setNewTruck({ ...newTruck, customRoute: e.target.value })}
                  required
                />
              )}
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={addTruckLoading}>
              {addTruckLoading ? 'Adding...' : '🚛 Register Truck'}
            </button>
          </form>
        </div>
      )}

      {/* ── KPIs ── */}
      <div className="kpi-grid">
        <div className="kpi-card green">
          <div className="kpi-label">Total Trucks</div>
          <div className="kpi-value">{trucks.length}</div>
          <div className="kpi-icon green">🚚</div>
        </div>
        <div className="kpi-card blue">
          <div className="kpi-label">Available Trucks</div>
          <div className="kpi-value">{availableCount}</div>
          <div className="kpi-icon blue">✅</div>
        </div>
        <div className="kpi-card purple">
          <div className="kpi-label">Active Deliveries</div>
          <div className="kpi-value">{activeJobs.length}</div>
          <div className="kpi-icon purple">📍</div>
        </div>
        <div className="kpi-card cyan">
          <div className="kpi-label">Fleet Capacity Used</div>
          <div className="kpi-value">{usedCapacity.toFixed(1)} / {totalCapacity.toFixed(1)} T</div>
          <div className="kpi-icon cyan">📦</div>
        </div>
      </div>

      <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

        {/* ── My Fleet ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title">My Fleet</div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{trucks.length} trucks registered</span>
            </div>
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {trucks.map(truck => {
                const cap = parseFloat(truck.capacityTons || 0);
                const avail = parseFloat(truck.availableCapacityTons || 0);
                const usedPct = cap > 0 ? Math.round(((cap - avail) / cap) * 100) : 0;
                const sizeIcon = cap <= 5 ? '🚐' : cap <= 15 ? '🚚' : '🚛';
                const statusColor = truck.availabilityStatus === 'FULL' ? 'var(--red)' :
                  truck.availabilityStatus === 'PARTIAL_LOAD' ? 'var(--yellow)' : 'var(--green)';
                return (
                  <div key={truck.truckId} style={{ padding: 14, border: '1px solid var(--border)', borderRadius: 10, background: 'var(--bg-card-2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 22 }}>{sizeIcon}</span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13 }}>{truck.truckNumber}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>📍 {truck.currentCity || 'Unknown'}</div>
                        </div>
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 700, color: statusColor, background: `${statusColor}20`, padding: '3px 8px', borderRadius: 20 }}>
                        {truck.availabilityStatus}
                      </span>
                    </div>
                    {truck.route && (
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10, padding: '6px 10px', background: 'var(--bg-hover)', borderRadius: 6 }}>
                        🗺️ {truck.route}
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 6 }}>
                      <span style={{ color: 'var(--text-muted)' }}>{cap} Ton truck</span>
                      <span style={{ fontWeight: 600, color: statusColor }}>{avail.toFixed(1)} T remaining</span>
                    </div>
                    {/* Capacity bar */}
                    <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${usedPct}%`, background: usedPct >= 100 ? 'var(--red)' : usedPct >= 70 ? 'var(--yellow)' : 'var(--green)', borderRadius: 3, transition: 'width 0.4s' }} />
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4, textAlign: 'right' }}>{usedPct}% loaded</div>
                  </div>
                );
              })}
              {trucks.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, padding: 32 }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🚛</div>
                  No trucks registered yet. Click "+ Add Truck" to get started.
                </div>
              )}
            </div>
          </div>

          {/* ── Active Jobs ── */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Live Tracking & Active Jobs</div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr><th>Order #</th><th>Truck</th><th>Load</th><th>Route</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {activeJobs.map(job => {
                    const status = (job.orderStatus || '').replace(/"/g, '');
                    return (
                      <tr key={job.orderId}>
                        <td><span className="tx-hash">#{job.orderId}</span></td>
                        <td style={{ fontWeight: 600 }}>{job.assignedTruck?.truckNumber || 'N/A'}</td>
                        <td>{job.weightTons ? job.weightTons + ' T' : '—'}</td>
                        <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{job.assignedTruck?.route || '—'}</td>
                        <td><span className={`badge ${status === 'DISPATCHED' ? 'info' : 'warn'}`}>{status}</span></td>
                      </tr>
                    );
                  })}
                  {activeJobs.length === 0 && (
                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>No active deliveries.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── Open Shipment Requests ── */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Open Shipment Requests</div>
            <span style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 600 }}>{openRequests.length} available</span>
          </div>
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {openRequests.map(req => {
              const weight = req.weightTons;
              const isSelected = selectedOrder?.orderId === req.orderId;
              return (
                <div key={req.orderId} style={{ padding: 14, border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`, borderRadius: 10, background: 'var(--bg-card-2)', transition: 'border 0.2s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>
                        Order <span className="tx-hash">#{req.orderId}</span>
                        {weight && <span style={{ marginLeft: 8, background: 'var(--primary-dim)', color: 'var(--primary)', padding: '1px 8px', borderRadius: 20, fontWeight: 600 }}>{weight} Tons</span>}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>Supplier: {req.supplier?.companyName || 'N/A'}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>🧾 {req.items?.length || 0} item(s) in order</div>
                    </div>
                    {!isSelected ? (
                      <button className="btn btn-primary" style={{ padding: '6px 14px', fontSize: 11 }} onClick={() => setSelectedOrder(req)}>
                        Accept Load
                      </button>
                    ) : (
                      <button className="btn btn-ghost" style={{ padding: '6px 14px', fontSize: 11, color: 'var(--red)' }} onClick={() => { setSelectedOrder(null); setSelectedTruck(''); }}>
                        Cancel
                      </button>
                    )}
                  </div>

                  {isSelected && (
                    <form onSubmit={handleAcceptLoad} style={{ marginTop: 12, padding: 14, background: 'var(--bg-hover)', borderRadius: 8 }}>
                      <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>
                        Assign a Truck {weight && <span style={{ color: 'var(--yellow)' }}>(need ≥ {weight}T capacity)</span>}
                      </label>
                      <select
                        className="btn btn-ghost"
                        style={{ width: '100%', textAlign: 'left', marginBottom: 10 }}
                        value={selectedTruck}
                        onChange={e => setSelectedTruck(e.target.value)}
                        required
                      >
                        <option value="" disabled>-- Select Truck --</option>
                        {trucks
                          .filter(t => !weight || parseFloat(t.availableCapacityTons || 0) >= parseFloat(weight))
                          .map(t => {
                            const cap = parseFloat(t.capacityTons || 0);
                            const sizeIcon = cap <= 5 ? '🚐' : cap <= 15 ? '🚚' : '🚛';
                            return (
                              <option key={t.truckId} value={t.truckId}>
                                {sizeIcon} {t.truckNumber} — {t.availableCapacityTons} T free
                              </option>
                            );
                          })}
                      </select>
                      {trucks.filter(t => !weight || parseFloat(t.availableCapacityTons || 0) >= parseFloat(weight)).length === 0 && (
                        <div style={{ fontSize: 12, color: 'var(--red)', marginBottom: 10 }}>⚠️ No trucks with enough capacity for this load.</div>
                      )}
                      <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Confirm Assignment</button>
                    </form>
                  )}
                </div>
              );
            })}
            {openRequests.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, padding: 40 }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                No open shipment requests at this time.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
