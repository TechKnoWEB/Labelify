import {
  Users, Database, FileText, CreditCard,
  ToggleLeft, ScrollText, Settings, LogOut, Shield,
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useNavigate } from 'react-router-dom';

const NAV = [
  {
    section: 'Manage',
    items: [
      { key: 'users',    label: 'Users',         icon: Users },
      { key: 'database', label: 'Database',       icon: Database },
    ],
  },
  {
    section: 'Frontend',
    items: [
      { key: 'content',  label: 'Content Blocks', icon: FileText },
      { key: 'pricing',  label: 'Pricing',        icon: CreditCard },
      { key: 'flags',    label: 'Feature Flags',  icon: ToggleLeft },
    ],
  },
  {
    section: 'System',
    items: [
      { key: 'logs',     label: 'Audit Logs',     icon: ScrollText },
      { key: 'settings', label: 'Settings',        icon: Settings },
    ],
  },
];

export default function AdminSidebar({ active, onNavigate, collapsed }) {
  const { adminUser, adminSignOut } = useAdminAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await adminSignOut();
    navigate('/admin/login', { replace: true });
  }

  const initial = (adminUser?.fullName ?? adminUser?.email ?? 'A')[0].toUpperCase();

  return (
    <aside className={`adm-sidebar ${collapsed ? 'adm-sidebar--collapsed' : ''}`}>
      {/* Header */}
      <div className="adm-sidebar-header">
        <Shield size={20} color="var(--sys-danger)" style={{ flexShrink: 0 }} />
        {!collapsed && (
          <>
            <span className="adm-sidebar-logo">PeelifyLabs</span>
            <span className="adm-sidebar-badge">SA</span>
          </>
        )}
      </div>

      {/* Nav */}
      <nav className="adm-nav">
        {NAV.map(({ section, items }) => (
          <div key={section}>
            {!collapsed && <div className="adm-nav-section">{section}</div>}
            {items.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                className={`adm-nav-item ${active === key ? 'adm-nav-item--active' : ''}`}
                onClick={() => onNavigate(key)}
                title={collapsed ? label : undefined}
              >
                <Icon size={18} className="adm-nav-icon" />
                {!collapsed && <span className="adm-nav-label">{label}</span>}
              </button>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="adm-sidebar-footer">
        {!collapsed && (
          <div className="adm-sidebar-user">
            <div className="adm-sidebar-avatar">{initial}</div>
            <div className="adm-sidebar-user-info">
              <div className="adm-sidebar-user-name">{adminUser?.fullName ?? adminUser?.email}</div>
              <div className="adm-sidebar-user-role">SuperAdmin</div>
            </div>
          </div>
        )}
        <button
          className="adm-nav-item"
          onClick={handleSignOut}
          title={collapsed ? 'Sign out' : undefined}
          style={{ marginTop: '0.25rem', color: 'var(--sys-danger)' }}
        >
          <LogOut size={18} className="adm-nav-icon" />
          {!collapsed && <span className="adm-nav-label">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
