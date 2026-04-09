import { useState } from 'react';
import { Save, CheckCircle } from 'lucide-react';
import { useAdminFetch, useAdminAction } from '../hooks/useAdminFetch';

function PricingCard({ pack, onSaved }) {
  const [form, setForm] = useState({ ...pack });
  const [saved, setSaved] = useState(false);
  const [err, setErr]     = useState('');
  const { call, loading } = useAdminAction();

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); setSaved(false); }

  async function handleSave() {
    setErr('');
    const payload = {
      name:         form.name,
      credits:      parseInt(form.credits, 10),
      price_usd:    parseFloat(form.price_usd),
      amount_paise: parseInt(form.amount_paise, 10),
      labels_count: form.labels_count,
      per_credit:   parseFloat(form.per_credit),
      saving_label: form.saving_label || null,
      is_popular:   form.is_popular,
      is_active:    form.is_active,
    };
    if (isNaN(payload.credits) || isNaN(payload.price_usd) || isNaN(payload.amount_paise)) {
      setErr('Credits, price, and paise must be valid numbers.'); return;
    }
    const { ok } = await call(`/api/admin/pricing/${pack.pack_id}`, 'PATCH', payload);
    if (ok) { setSaved(true); setTimeout(() => setSaved(false), 2500); onSaved(); }
    else setErr('Save failed. Try again.');
  }

  return (
    <div className={`adm-pricing-card ${!form.is_active ? 'adm-pricing-card--inactive' : ''}`}>
      <div className="adm-pricing-card-header">
        <span className="adm-pricing-card-name">{form.name}</span>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {saved && <CheckCircle size={14} color="var(--sys-success)" />}
          <label className="adm-toggle-wrap" style={{ gap: '0.4rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Active</span>
            <label className="adm-toggle">
              <input type="checkbox" checked={form.is_active} onChange={(e) => set('is_active', e.target.checked)} />
              <div className="adm-toggle-track" />
              <div className="adm-toggle-thumb" />
            </label>
          </label>
        </div>
      </div>

      <div className="adm-pricing-fields">
        <div className="adm-field" style={{ margin: 0 }}>
          <label className="adm-field-label">Pack Name</label>
          <input className="adm-field-input" value={form.name} onChange={(e) => set('name', e.target.value)} />
        </div>
        <div className="adm-field" style={{ margin: 0 }}>
          <label className="adm-field-label">Credits</label>
          <input className="adm-field-input" type="number" min="1" value={form.credits} onChange={(e) => set('credits', e.target.value)} />
        </div>
        <div className="adm-field" style={{ margin: 0 }}>
          <label className="adm-field-label">Price (USD)</label>
          <input className="adm-field-input" type="number" step="0.01" min="0" value={form.price_usd} onChange={(e) => set('price_usd', e.target.value)} />
        </div>
        <div className="adm-field" style={{ margin: 0 }}>
          <label className="adm-field-label">Amount (Paise)</label>
          <input className="adm-field-input" type="number" min="0" value={form.amount_paise} onChange={(e) => set('amount_paise', e.target.value)} />
        </div>
        <div className="adm-field" style={{ margin: 0 }}>
          <label className="adm-field-label">Labels Count (display)</label>
          <input className="adm-field-input" value={form.labels_count} onChange={(e) => set('labels_count', e.target.value)} placeholder="e.g. 3,000" />
        </div>
        <div className="adm-field" style={{ margin: 0 }}>
          <label className="adm-field-label">Per Credit</label>
          <input className="adm-field-input" type="number" step="0.001" min="0" value={form.per_credit} onChange={(e) => set('per_credit', e.target.value)} />
        </div>
        <div className="adm-field" style={{ margin: 0 }}>
          <label className="adm-field-label">Saving Label</label>
          <input className="adm-field-input" value={form.saving_label ?? ''} onChange={(e) => set('saving_label', e.target.value)} placeholder="e.g. Save 25%" />
        </div>
        <div className="adm-field" style={{ margin: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <label className="adm-field-label">Popular</label>
          <label className="adm-toggle" style={{ marginTop: '0.4rem' }}>
            <input type="checkbox" checked={form.is_popular} onChange={(e) => set('is_popular', e.target.checked)} />
            <div className="adm-toggle-track" />
            <div className="adm-toggle-thumb" />
          </label>
        </div>
      </div>

      {err && <div className="adm-alert adm-alert--error">{err}</div>}

      <div className="adm-pricing-card-footer">
        <button className="adm-btn adm-btn--primary adm-btn--sm" onClick={handleSave} disabled={loading}>
          <Save size={13} /> {loading ? 'Saving…' : 'Save Pack'}
        </button>
      </div>
    </div>
  );
}

export default function PricingSection() {
  const { data, loading, refetch } = useAdminFetch('/api/admin/pricing');
  const packs = data?.packs ?? [];

  return (
    <div>
      <div className="adm-section-hd">
        <div className="adm-section-hd-left">
          <div className="adm-section-title">Pricing Config</div>
          <div className="adm-section-sub">Edit credit pack prices, names, and visibility.</div>
        </div>
      </div>

      {loading ? (
        <div className="adm-pricing-grid">
          {[1,2,3,4].map(i => (
            <div key={i} className="adm-pricing-card">
              <div className="adm-skeleton" style={{ height: 200 }} />
            </div>
          ))}
        </div>
      ) : packs.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No pricing config found. Run the SQL migrations first.</p>
      ) : (
        <div className="adm-pricing-grid">
          {[...packs].sort((a, b) => a.sort_order - b.sort_order).map(pack => (
            <PricingCard key={pack.pack_id} pack={pack} onSaved={refetch} />
          ))}
        </div>
      )}
    </div>
  );
}
