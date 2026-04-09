import { useState } from 'react';
import { ToggleLeft } from 'lucide-react';
import { useAdminFetch, useAdminAction } from '../hooks/useAdminFetch';

function FlagRow({ flag, onToggled }) {
  const [optimistic, setOptimistic] = useState(flag.enabled);
  const { call, loading, error }    = useAdminAction();

  async function handleToggle(e) {
    const next = e.target.checked;
    setOptimistic(next);
    const result = await call(`/api/admin/flags/${flag.key}`, 'PATCH', { enabled: next });
    if (!result?.ok) { setOptimistic(!next); } // revert on error
    else onToggled();
  }

  function formatDate(iso) {
    if (!iso) return 'Never';
    return new Date(iso).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' });
  }

  return (
    <div className="adm-flag-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="adm-flag-info">
          <div className="adm-flag-key">{flag.key}</div>
          {flag.description && <div className="adm-flag-desc">{flag.description}</div>}
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Updated: {formatDate(flag.updated_at)}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className={`adm-badge ${optimistic ? 'adm-badge--green' : 'adm-badge--gray'}`}>
            {optimistic ? 'ON' : 'OFF'}
          </span>
          <label className="adm-toggle" style={{ opacity: loading ? 0.6 : 1 }}>
            <input type="checkbox" checked={optimistic} onChange={handleToggle} disabled={loading} />
            <div className="adm-toggle-track" />
            <div className="adm-toggle-thumb" />
          </label>
        </div>
      </div>
      {error && <div className="adm-alert adm-alert--error" style={{ fontSize: '0.78rem', padding: '0.4rem 0.75rem' }}>{error}</div>}
    </div>
  );
}

export default function FeatureFlagsSection() {
  const { data, loading, refetch } = useAdminFetch('/api/admin/flags');
  const flags = data?.flags ?? [];

  const enabled  = flags.filter(f => f.enabled).length;
  const disabled = flags.filter(f => !f.enabled).length;

  return (
    <div>
      <div className="adm-section-hd">
        <div className="adm-section-hd-left">
          <div className="adm-section-title">Feature Flags</div>
          <div className="adm-section-sub">Toggle features on/off without a deployment. Changes are instant.</div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <span className="adm-badge adm-badge--green">{enabled} On</span>
          <span className="adm-badge adm-badge--gray">{disabled} Off</span>
        </div>
      </div>

      <div className="adm-table-wrap">
        {loading ? (
          <div style={{ padding: '2rem' }}>
            {[1,2,3,4,5].map(i => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ flex: 1 }}>
                  <div className="adm-skeleton" style={{ width: '25%', marginBottom: '0.4rem' }} />
                  <div className="adm-skeleton" style={{ width: '50%' }} />
                </div>
                <div className="adm-skeleton" style={{ width: 42, height: 22, borderRadius: 99 }} />
              </div>
            ))}
          </div>
        ) : flags.length === 0 ? (
          <p style={{ padding: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>No feature flags found. Run the SQL migrations first.</p>
        ) : (
          <div className="adm-flag-list">
            {flags.map(flag => (
              <FlagRow key={flag.key} flag={flag} onToggled={refetch} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
