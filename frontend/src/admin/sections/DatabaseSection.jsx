import { useState } from 'react';
import { Database, Download } from 'lucide-react';
import AdminTable    from '../components/shared/AdminTable';
import AdminStatCard from '../components/shared/AdminStatCard';
import { useAdminFetch } from '../hooks/useAdminFetch';

const PAGE_SIZE = 25;

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
}

export default function DatabaseSection({ search: globalSearch }) {
  const [page, setPage]       = useState(1);
  const [search, setSearch]   = useState('');
  const [sortKey, setSortKey] = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');
  const [tierFilter, setTierFilter] = useState('');

  const qs = new URLSearchParams({
    page, limit: PAGE_SIZE, sort: sortKey, dir: sortDir,
    search: search || globalSearch || '',
    tier: tierFilter,
  }).toString();

  const { data, loading } = useAdminFetch(`/api/admin/profiles?${qs}`);

  const profiles = data?.profiles ?? [];
  const total    = data?.total ?? 0;
  const stats    = data?.stats ?? {};

  function handleSort(key) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
    setPage(1);
  }

  function exportCSV() {
    const headers = ['id', 'email', 'credits', 'subscription_tier', 'is_banned', 'created_at'];
    const rows = profiles.map(p => headers.map(h => JSON.stringify(p[h] ?? '')).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url; a.download = `peelify_profiles_${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  const columns = [
    { key: 'id',          label: 'User ID',   render: (v) => <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{v?.slice(0,8)}…</span>, width: '110px' },
    { key: 'email',       label: 'Email',      sortable: true, render: (v) => <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{v ?? '—'}</span> },
    { key: 'credits',     label: 'Credits',    sortable: true, render: (v) => <span style={{ color: 'var(--sys-warn)', fontWeight: 600 }}>{v ?? 0}</span> },
    { key: 'subscription_tier', label: 'Tier', sortable: true, render: (v) => <span className={`adm-badge ${v === 'pro' ? 'adm-badge--blue' : 'adm-badge--gray'}`}>{v ?? 'free'}</span> },
    { key: 'is_banned',   label: 'Banned',     render: (v) => v ? <span className="adm-badge adm-badge--red">Yes</span> : <span className="adm-badge adm-badge--green">No</span> },
    { key: 'created_at',  label: 'Joined',     sortable: true, render: (v) => formatDate(v) },
  ];

  const tierSelect = (
    <select
      className="adm-field-input adm-field-select"
      value={tierFilter}
      onChange={(e) => { setTierFilter(e.target.value); setPage(1); }}
      style={{ fontSize: '0.82rem', padding: '0.4rem 2rem 0.4rem 0.75rem', width: 'auto' }}
    >
      <option value="">All Tiers</option>
      <option value="free">Free</option>
      <option value="pro">Pro</option>
    </select>
  );

  return (
    <div>
      <div className="adm-stats-grid">
        <AdminStatCard label="Total Profiles" value={total}           icon={<Database size={18} />} />
        <AdminStatCard label="Total Credits"  value={stats.totalCredits?.toLocaleString()} sub="Across all accounts" />
        <AdminStatCard label="Free Tier"      value={stats.freeTier} />
        <AdminStatCard label="Pro Tier"       value={stats.proTier} />
      </div>

      <div className="adm-section-hd">
        <div className="adm-section-hd-left">
          <div className="adm-section-title">Profiles Table</div>
          <div className="adm-section-sub">Read-only view of all user profiles in the database.</div>
        </div>
        <button className="adm-btn adm-btn--outline" onClick={exportCSV}>
          <Download size={14} /> Export CSV
        </button>
      </div>

      <AdminTable
        columns={columns}
        rows={profiles}
        loading={loading}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
        onPage={(p) => setPage(p)}
        sortKey={sortKey}
        sortDir={sortDir}
        onSort={handleSort}
        search={search}
        onSearch={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder="Search by email or ID…"
        toolbar={tierSelect}
        emptyText="No profiles found."
      />
    </div>
  );
}
