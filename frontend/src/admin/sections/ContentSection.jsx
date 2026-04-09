import { useState } from 'react';
import { Save, CheckCircle } from 'lucide-react';
import { useAdminFetch, useAdminAction } from '../hooks/useAdminFetch';

function formatDate(iso) {
  if (!iso) return 'Never';
  return new Date(iso).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
}

function ContentCard({ block, onSaved }) {
  const [value, setValue] = useState(block.value);
  const [saved, setSaved] = useState(false);
  const [err, setErr]     = useState('');
  const { call, loading } = useAdminAction();

  async function handleSave() {
    setErr('');
    const { ok } = await call(`/api/admin/content/${block.key}`, 'PATCH', { value });
    if (ok) { setSaved(true); setTimeout(() => setSaved(false), 2500); onSaved(); }
    else setErr('Save failed. Try again.');
  }

  const changed = value !== block.value;

  return (
    <div className="adm-content-card">
      <div className="adm-content-card-header">
        <div>
          <div className="adm-content-key">{block.key}</div>
          {block.description && <div className="adm-content-desc">{block.description}</div>}
        </div>
        {saved && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: 'var(--sys-success)' }}>
            <CheckCircle size={14} /> Saved
          </span>
        )}
      </div>

      <textarea
        className="adm-field-input adm-field-textarea"
        value={value}
        onChange={(e) => { setValue(e.target.value); setSaved(false); }}
        rows={value.length > 80 ? 3 : 2}
      />

      {err && <div className="adm-alert adm-alert--error">{err}</div>}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className="adm-content-meta">Last updated: {formatDate(block.updated_at)}</span>
        <button
          className="adm-btn adm-btn--primary adm-btn--sm"
          onClick={handleSave}
          disabled={loading || !changed}
        >
          <Save size={13} /> {loading ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  );
}

export default function ContentSection() {
  const { data, loading, refetch } = useAdminFetch('/api/admin/content');
  const blocks = data?.blocks ?? [];

  return (
    <div>
      <div className="adm-section-hd">
        <div className="adm-section-hd-left">
          <div className="adm-section-title">Content Blocks</div>
          <div className="adm-section-sub">Edit landing page text. Changes apply immediately on save.</div>
        </div>
      </div>

      {loading ? (
        <div className="adm-content-grid">
          {[1,2,3,4].map(i => (
            <div key={i} className="adm-content-card">
              <div className="adm-skeleton" style={{ width: '30%', marginBottom: '0.5rem' }} />
              <div className="adm-skeleton" style={{ width: '60%', marginBottom: '0.75rem' }} />
              <div className="adm-skeleton" style={{ height: 60 }} />
            </div>
          ))}
        </div>
      ) : blocks.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No content blocks found. Run the SQL migrations first.</p>
      ) : (
        <div className="adm-content-grid">
          {blocks.map(block => (
            <ContentCard key={block.key} block={block} onSaved={refetch} />
          ))}
        </div>
      )}
    </div>
  );
}
