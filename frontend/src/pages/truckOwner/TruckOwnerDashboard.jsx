import { useState, useEffect } from 'react';
import { api } from '../../api';

export default function TruckOwnerDashboard({ user }) {
  const [kpis, setKpis] = useState({
    availableTrucks: 4,
    activeDeliveries: 2,
    completedShipments: 18,
    totalDistance: '2,450 km'
  });
  
  const [activeJobs, setActiveJobs] = useState([
    { id: 'JOB-901', from: 'North India Logistics Hub', to: 'City Supermarket #1', status: 'IN_TRANSIT', eta: '2 Hours', items: 120 },
    { id: 'JOB-902', from: 'Supplier A', to: 'South Regional Hub', status: 'LOADING', eta: 'Tomorrow', items: 500 }
  ]);

  const [availableRequests, setAvailableRequests] = useState([
    { id: 'REQ-101', from: 'Supplier B', to: 'East Logistics Hub', weight: '2.5 Tons', payout: 'Standard Rate' },
    { id: 'REQ-102', from: 'West Regional Hub', to: 'Downtown Retailer', weight: '0.8 Tons', payout: 'Express Rate' }
  ]);

  return (
    <div>
      <div className="page-header">
        <div className="page-title">🚛 Transporter Command Center</div>
        <div className="page-desc">Manage fleet dispatch, accept shipment jobs, and track deliveries for {user.fullName}</div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card green">
          <div className="kpi-label">Available Fleet</div>
          <div className="kpi-value">{kpis.availableTrucks}</div>
          <div className="kpi-icon green">🚚</div>
        </div>
        <div className="kpi-card blue">
          <div className="kpi-label">Active Deliveries</div>
          <div className="kpi-value">{kpis.activeDeliveries}</div>
          <div className="kpi-icon blue">📍</div>
        </div>
        <div className="kpi-card purple">
          <div className="kpi-label">Completed Shipments</div>
          <div className="kpi-value">{kpis.completedShipments}</div>
          <div className="kpi-icon purple">✅</div>
        </div>
        <div className="kpi-card cyan">
          <div className="kpi-label">Total Distance Covered</div>
          <div className="kpi-value">{kpis.totalDistance}</div>
          <div className="kpi-icon cyan">🛣️</div>
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title">Live Tracking & Active Jobs</div>
            </div>
            <div>
                 <table className="data-table">
                     <thead>
                         <tr><th>Job ID</th><th>Route</th><th>ETA</th><th>Status</th><th>Actions</th></tr>
                     </thead>
                     <tbody>
                         {activeJobs.map(job => (
                             <tr key={job.id}>
                                 <td><span className="tx-hash">{job.id}</span></td>
                                 <td>
                                     <div style={{ fontWeight: 600, fontSize: 12 }}>{job.from}</div>
                                     <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>↓ to {job.to}</div>
                                 </td>
                                 <td>{job.eta}</td>
                                 <td><span className={`badge ${job.status === 'IN_TRANSIT' ? 'info' : 'warn'}`}>{job.status}</span></td>
                                 <td>
                                     <button className="btn btn-primary" style={{ padding: '4px 8px', fontSize: 10 }}>Update ETA</button>
                                 </td>
                             </tr>
                         ))}
                     </tbody>
                 </table>
            </div>
          </div>
          
          <div className="card">
            <div className="card-header">
              <div className="card-title">Open Shipment Requests</div>
            </div>
            <div style={{ padding: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {availableRequests.map(req => (
                        <div key={req.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--bg-card-2)' }}>
                            <div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Req {req.id} • {req.weight} • {req.payout}</div>
                                <div style={{ fontSize: 13, fontWeight: 600 }}>{req.from}</div>
                                <div style={{ fontSize: 13, fontWeight: 600 }}>→ {req.to}</div>
                            </div>
                            <div>
                                <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: 11 }}>Accept Load</button>
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
