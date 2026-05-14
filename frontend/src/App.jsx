import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import TopBar from './components/TopBar.jsx';
import Login from './pages/Login.jsx';

// Existing Pages (Refactor to generic/admin for now)
import RetailerDashboard from './pages/retailer/RetailerDashboard.jsx';
import PlaceOrder from './pages/retailer/PlaceOrder.jsx';
import SupplierDashboard from './pages/supplier/SupplierDashboard.jsx';
import DistributorDashboard from './pages/distributor/DistributorDashboard.jsx';
import DistributorRetailerRequests from './pages/distributor/DistributorRetailerRequests.jsx';
import SupplierRequestStatus from './pages/distributor/SupplierRequestStatus.jsx';
import TruckOwnerDashboard from './pages/truckOwner/TruckOwnerDashboard.jsx';

import Dashboard from './pages/Dashboard.jsx';
import DemandForecasting from './pages/DemandForecasting.jsx';
import Inventory from './pages/Inventory.jsx';
import Bottleneck from './pages/Bottleneck.jsx';
import Logistics from './pages/Logistics.jsx';
import BlockchainAudit from './pages/BlockchainAudit.jsx';
import Notifications from './pages/Notifications.jsx';
import QRTracking from './pages/QRTracking.jsx';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
    setLoading(false);
  }, []);

  const handleLogin = (u) => {
    console.log('User logged in:', u);
    setUser(u);
    localStorage.setItem('user', JSON.stringify(u));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  if (loading) return null;

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const renderDashboard = () => {
    switch (user.role) {
      case 'SUPPLIER':    return <SupplierDashboard user={user} />;
      case 'DISTRIBUTOR': return <DistributorDashboard user={user} />;
      case 'RETAILER':    return <RetailerDashboard user={user} />;
      case 'TRUCK_OWNER': return <TruckOwnerDashboard user={user} />;
      default:            return <Dashboard user={user} />;
    }
  };

  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar user={user} onLogout={handleLogout} />
        <div className="main-content">
          <TopBar user={user} />
          <div className="page-body">
            <Routes>
              {/* Common Routes */}
              <Route path="/" element={renderDashboard()} />
              <Route path="/place-order" element={<PlaceOrder user={user} />} />
              <Route path="/retailer-requests" element={<DistributorRetailerRequests user={user} />} />
              <Route path="/supplier-requests" element={<SupplierRequestStatus user={user} />} />
              <Route path="/notifications" element={<Notifications />} />
              
              {/* Role Specific Logic can be added here */}
              <Route path="/forecast" element={<DemandForecasting />} />
              <Route path="/inventory" element={<Inventory user={user} />} />
              <Route path="/bottleneck" element={<Bottleneck />} />
              <Route path="/logistics" element={<Logistics />} />
              <Route path="/blockchain" element={<BlockchainAudit />} />
              <Route path="/qr" element={<QRTracking />} />
              
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}
