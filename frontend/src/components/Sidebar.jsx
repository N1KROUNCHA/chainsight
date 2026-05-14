import { NavLink, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { api } from '../api';

const navItems = [
  { to: '/',             icon: '⬡',  label: 'Dashboard',        section: 'OVERVIEW', roles: ['ADMIN', 'SUPPLIER', 'DISTRIBUTOR', 'RETAILER', 'TRUCK_OWNER'] },
  { to: '/place-order',  icon: '🛒', label: 'Place Order',      section: 'OVERVIEW', roles: ['RETAILER', 'DISTRIBUTOR'] },
  { to: '/forecast',     icon: '📈', label: 'Demand Forecasting', section: 'ANALYTICS', roles: ['ADMIN', 'DISTRIBUTOR'] },
  { to: '/inventory',    icon: '📦', label: 'Inventory',          section: 'ANALYTICS', roles: ['ADMIN', 'SUPPLIER', 'DISTRIBUTOR', 'RETAILER'] },
  { to: '/bottleneck',   icon: '⚠️', label: 'Bottleneck Detection',section: 'ANALYTICS', roles: ['ADMIN', 'DISTRIBUTOR'] },
  { to: '/logistics',    icon: '🚚', label: 'Logistics & Trucks', section: 'OPERATIONS', roles: ['ADMIN', 'TRUCK_OWNER', 'DISTRIBUTOR'] },
  { to: '/blockchain',   icon: '🔗', label: 'Blockchain Audit',   section: 'OPERATIONS', roles: ['ADMIN'] },
  { to: '/notifications',icon: '🔔', label: 'Notifications',      section: 'OPERATIONS', roles: ['ADMIN', 'SUPPLIER', 'DISTRIBUTOR', 'RETAILER', 'TRUCK_OWNER'], badgeKey: 'alerts' },
  { to: '/qr',           icon: '📱', label: 'QR Tracking',        section: 'OPERATIONS', roles: ['ADMIN', 'SUPPLIER', 'DISTRIBUTOR', 'RETAILER', 'TRUCK_OWNER'] },
];


const sections = ['OVERVIEW', 'ANALYTICS', 'OPERATIONS'];

export default function Sidebar({ user, onLogout }) {
  const [unread, setUnread] = useState(0);
  const location = useLocation();

  useEffect(() => {
    api.alerts().then(d => setUnread(d.unreadCount || 0)).catch(() => {});
  }, [location]);

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="brand">
          <div className="logo-icon">⛓</div>
          <div>
            <div className="brand-name">ChainSight</div>
            <div className="brand-sub">{user.role} PANEL</div>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {sections.map(section => {
          const items = navItems.filter(n => n.section === section && n.roles.includes(user.role));
          if (items.length === 0) return null;
          
          return (
            <div key={section}>
              <div className="sidebar-section-label">{section}</div>
              {items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                >
                  <span style={{ fontSize: 15 }}>{item.icon}</span>
                  {item.label}
                  {item.badgeKey === 'alerts' && unread > 0 && (
                    <span className="nav-badge">{unread}</span>
                  )}
                </NavLink>
              ))}
            </div>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div style={{ padding: '0 12px 12px' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{user.fullName}</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 12 }}>{user.email}</div>
          <button onClick={onLogout} className="btn btn-ghost" style={{ width: '100%', fontSize: 11, padding: '6px' }}>Sign Out</button>
        </div>
        <div className="status-pill">
          <div className="status-dot" />
          <div className="status-text">
            API: <strong>Online</strong>
          </div>
        </div>
      </div>
    </aside>
  );
}
