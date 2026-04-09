import { useState } from 'react';
import { ScrollText } from 'lucide-react';
import AdminTable from '../components/shared/AdminTable';
import { useAdminFetch } from '../hooks/useAdminFetch';

const PAGE_SIZE = 50;

const ACTION_COLORS = {
  'user.ban':       'adm-badge--red',
  'user.unban':     'adm-badge--green',
  'user.delete':    'adm-badge--red',
  'credits.update': 'adm-badge--yellow',
  'content.update': 'adm-badge--blue',
  'pricing.update': 'adm-badge--blue',
  'flag.toggle':    'adm-badge--blue',
  'admin.promote':  'adm-badge--yellow',
  'admin.demote':   'adm-badge--yellow',
};

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
}

function PayloadCell({ payload }) {
  const [expanded, setExpanded] = useState(false);
  if (!payload) return <span style={{ color: 'var(--text-muted)' }}>—</span>;
  const str = JSON.stringify(payload);
  const preview = str.length > 60 ? str.slice(0, 60) + '…' : str;
  return (
    <div
      className="adm-log-payload"
      onClick={() => setExpanded(e => !e)}
      title="Click to expand"
      style={{ whiteSpace: expanded ? 'pre-wrap' : 'nowrap', maxWidth: expanded ? '400px' : '280px' }}
    >
      {expanded ? JSON.stringify(payload, null, 2) : preview}
    </div>
  );
}

export default function LogsSection() {
  const [page, setPage]           = useState(1);
  const [actionFilter, setFilter] = useState('');

  const qs = new URLSearchParams({ page, limit: PAGE_SIZE, action: actionFilter }).toString();
  const { data, loading } = useAdminFetch(`/api/admin/logs?${qs}`);

  const logs  = data?.logs  ?? [];
  const total = data?.total ?? 0;

  const filterSelect = (
    <select
      className="adm-field-input adm-field-select"
      value={actionFilter}
      onChange={(e) => { setFilter(e.target.value); setPage(1); }}
      style={{ fontSize: '0.82rem', padding: '0.4rem 2rem 0.4rem 0.75rem', width: 'auto' }}
    >
      <option value="">All Actions</option>
      <option value="user.ban">Ban</option>
      <option value="user.unban">Unban</option>
      <option value="user.delete">Delete User</option>
      <option value="credits.update">Credits Update</option>
      <option value="content.update">Content Update</option>
      <option value="pricing.update">Pricing Update</option>
      <option value="flag.toggle">Flag Toggle</option>
      <option value="admin.promote">Admin Promote</option>
      <option value="admin.demote">Admin Demote</option>
    </select>
  );

  const columns = [
    {
      key: 'action', label: 'Action',
      render: (v) => <span className={`adm-badge ${ACTION_COLORS[v] ?? 'adm-badge--gray'}`}>{v}</span>
    },
    { key: 'admin_email', label: 'Admin',       render: (v) => <span style={{ color: 'var(--text-main)' }}>{v ?? '—'}</span> },
    { key: 'target_type', label: 'Target Type', render: (v) => v ? <span className="adm-badge adm-badge--gray">{v}</span> : '—' },
    { key: 'target_id',   label: 'Target ID',   render: (v) => <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{v?.slice(0, 20) ?? '—'}</span> },
    { key: 'payload',     label: 'Payload',      render: (v) => <PayloadCell payload={v} /> },
    { key: 'created_at',  label: 'Timestamp',    render: (v) => formatDate(v) },
  ];

  return (
    <div>
      <div className="adm-section-hd">
        <div className="adm-section-hd-left">
          <div className="adm-section-title">Audit Logs</div>
          <div className="adm-section-sub">Complete trail of all admin actions. Immutable — read only.</div>
        </div>
        <span className="adm-badge adm-badge--gray">{total.toLocaleString()} entries</span>
      </div>

      <AdminTable
        columns={columns}
        rows={logs}
        loading={loading}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
        onPage={(p) => setPage(p)}
        toolbar={filterSelect}
        emptyText="No audit logs yet. Admin actions will appear here."
      />
    </div>
  );
}
