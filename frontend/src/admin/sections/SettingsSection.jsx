import { Moon, Sun, Shield, Info } from 'lucide-react';
import { useState } from 'react';
import { useAdminFetch } from '../hooks/useAdminFetch';

export default function SettingsSection() {
  const [theme, setTheme] = useState(() => localStorage.getItem('peelify-theme') ?? 'dark');
  const { data, loading }  = useAdminFetch('/api/admin/settings/admins');
  const admins = data?.admins ?? [];

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.dataset.theme = next;
    localStorage.setItem('peelify-theme', next);
  }

  return (
    <div>
      <div className="adm-section-hd">
        <div className="adm-section-hd-left">
          <div className="adm-section-title">Settings</div>
          <div className="adm-section-sub">System preferences and SuperAdmin access list.</div>
        </div>
      </div>

      {/* Appearance */}
      <div className="adm-table-wrap" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="adm-settings-title">Appearance</div>
        <div className="adm-settings-desc">Switch between dark and light mode for the admin panel.</div>
        <div className="adm-toggle-wrap">
          <label className="adm-toggle">
            <input type="checkbox" checked={theme === 'light'} onChange={toggleTheme} />
            <div className="adm-toggle-track" />
            <div className="adm-toggle-thumb" />
          </label>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', color: 'var(--text-dim)' }}>
            {theme === 'dark' ? <Moon size={15} /> : <Sun size={15} />}
            {theme === 'dark' ? 'Dark mode' : 'Light mode'}
          </span>
        </div>
      </div>

      {/* SuperAdmin list */}
      <div className="adm-table-wrap" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <div className="adm-settings-title">SuperAdmin Accounts</div>
            <div className="adm-settings-desc">Accounts with full admin panel access.</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 'var(--r-md)', padding: '0.6rem 0.9rem', fontSize: '0.8rem', color: 'var(--acc-prim-lt)', maxWidth: 340 }}>
            <Info size={14} style={{ flexShrink: 0 }} />
            To add or remove admins, update <code style={{ background: 'rgba(255,255,255,0.08)', padding: '1px 5px', borderRadius: 4 }}>SUPERADMIN_EMAILS</code> in Supabase Edge Function secrets and redeploy.
          </div>
        </div>

        {loading ? (
          <div className="adm-admin-list">
            {[1, 2].map(i => (
              <div key={i} className="adm-admin-row">
                <div className="adm-skeleton" style={{ width: '40%' }} />
              </div>
            ))}
          </div>
        ) : admins.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No admins configured. Set SUPERADMIN_EMAILS in Edge Function secrets.</p>
        ) : (
          <div className="adm-admin-list">
            {admins.map((a) => (
              <div key={a.email} className="adm-admin-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div className="adm-sidebar-avatar" style={{ width: 28, height: 28, fontSize: '0.7rem' }}>
                    {a.email[0].toUpperCase()}
                  </div>
                  <div className="adm-admin-email">{a.email}</div>
                </div>
                <span className="adm-badge adm-badge--yellow">
                  <Shield size={10} /> SuperAdmin
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
