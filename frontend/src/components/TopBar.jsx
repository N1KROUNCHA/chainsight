import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const pageMeta = {
  '/':             { title: 'Dashboard',           subtitle: 'Overview of all supply chain operations' },
  '/forecast':     { title: 'Demand Forecasting',  subtitle: 'XGBoost + ARIMA ensemble predictions' },
  '/inventory':    { title: 'Inventory Management',subtitle: 'Real-time stock levels and ROP analysis' },
  '/bottleneck':   { title: 'Bottleneck Detection',subtitle: 'Operational constraint identification' },
  '/logistics':    { title: 'Logistics & Trucks',  subtitle: 'Fleet tracking and ETA monitoring' },
  '/blockchain':   { title: 'Blockchain Audit',    subtitle: 'Tamper-proof event ledger on-chain' },
  '/notifications':{ title: 'Notifications',       subtitle: 'Automated alerts and workflow triggers' },
  '/qr':           { title: 'QR / Barcode Tracking',subtitle: 'Shipment scanning and verification' },
};

function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="topbar-time">
      {time.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
      {' '}
      {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
    </div>
  );
}

export default function TopBar({ user }) {
  const { pathname } = useLocation();
  const meta = pageMeta[pathname] || { title: 'ChainSight', subtitle: '' };

  return (
    <header className="topbar">
      <div>
        <div className="topbar-title">{meta.title}</div>
        <span className="topbar-subtitle">{meta.subtitle}</span>
      </div>
      <div className="topbar-spacer" />
      <LiveClock />
      <button className="topbar-btn" title="Refresh" onClick={() => window.location.reload()}>
        ↻
      </button>
      <button className="topbar-btn" title="Alerts" style={{ position: 'relative' }}>
        🔔
        <span className="topbar-alert-dot" />
      </button>
      <div className="topbar-avatar" title={user.fullName}>{user.fullName.charAt(0)}</div>
    </header>
  );
}
