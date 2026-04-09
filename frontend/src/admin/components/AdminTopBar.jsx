import { useState, useEffect } from 'react';
import { Menu, Search, Bell, Moon, Sun, RefreshCw } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

const SECTION_LABELS = {
  users:    'Users',
  database: 'Database',
  content:  'Content Blocks',
  pricing:  'Pricing Config',
  flags:    'Feature Flags',
  logs:     'Audit Logs',
  settings: 'Settings',
};

export default function AdminTopBar({ active, onToggleSidebar, search, onSearch, onRefresh }) {
  const { adminUser } = useAdminAuth();
  const [theme, setTheme] = useState(() => localStorage.getItem('peelify-theme') ?? 'dark');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('peelify-theme', theme);
  }, [theme]);

  const initial = (adminUser?.fullName ?? adminUser?.email ?? 'A')[0].toUpperCase();

  return (
    <header className="adm-topbar">
      <button className="adm-topbar-toggle" onClick={onToggleSidebar} title="Toggle sidebar">
        <Menu size={18} />
      </button>

      <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
        {SECTION_LABELS[active] ?? 'Admin'}
      </span>

      {onSearch && (
        <div className="adm-search-wrap">
          <Search size={14} color="var(--text-muted)" />
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search…"
          />
        </div>
      )}

      <div className="adm-topbar-right">
        {onRefresh && (
          <button className="adm-topbar-btn" onClick={onRefresh} title="Refresh">
            <RefreshCw size={15} />
          </button>
        )}

        <button
          className="adm-topbar-btn"
          onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
          title="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        <button className="adm-topbar-btn" title="Notifications" style={{ position: 'relative' }}>
          <Bell size={15} />
          <span className="adm-notif-dot" />
        </button>

        <div className="adm-profile-chip">
          <div className="adm-profile-avatar">{initial}</div>
          <span className="adm-profile-email">{adminUser?.email}</span>
        </div>
      </div>
    </header>
  );
}
