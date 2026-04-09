import { useState, useCallback } from 'react';
import { Users, Coins, ShieldBan, ShieldCheck, Trash2 } from 'lucide-react';
import AdminTable    from '../components/shared/AdminTable';
import AdminModal    from '../components/shared/AdminModal';
import AdminStatCard from '../components/shared/AdminStatCard';
import { useAdminFetch, useAdminAction } from '../hooks/useAdminFetch';

const PAGE_SIZE = 20;

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function UsersSection({ search: globalSearch }) {
  const [page, setPage]         = useState(1);
  const [search, setSearch]     = useState('');
  const [sortKey, setSortKey]   = useState('created_at');
  const [sortDir, setSortDir]   = useState('desc');

  // Modals
  const [creditsModal, setCreditsModal] = useState(null); // { user }
  const [banModal, setBanModal]         = useState(null); // { user }
  const [deleteModal, setDeleteModal]   = useState(null); // { user }

  const [newCredits, setNewCredits]   = useState('');
  const [banReason, setBanReason]     = useState('');
  const [actionErr, setActionErr]     = useState('');

  const { call, loading: actLoading } = useAdminAction();

  const qs = new URLSearchParams({ page, limit: PAGE_SIZE, sort: sortKey, dir: sortDir, search: search || globalSearch || '' }).toString();
  const { data, loading, refetch } = useAdminFetch(`/api/admin/users?${qs}`);

  const users = data?.users ?? [];
  const total = data?.total ?? 0;
  const stats = data?.stats ?? {};

  function handleSort(key) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
    setPage(1);
  }

  async function doCredits() {
    setActionErr('');
    const n = parseInt(newCredits, 10);
    if (isNaN(n) || n < 0) { setActionErr('Enter a valid non-negative number.'); return; }
    const { ok } = await call(`/api/admin/users/${creditsModal.user.id}/credits`, 'PATCH', { credits: n });
    if (ok) { setCreditsModal(null); setNewCredits(''); refetch(); }
    else setActionErr('Failed to update credits.');
  }

  async function doBan() {
    setActionErr('');
    const banned = !banModal.user.is_banned;
    const { ok } = await call(`/api/admin/users/${banModal.user.id}/ban`, 'PATCH', { banned, reason: banReason });
    if (ok) { setBanModal(null); setBanReason(''); refetch(); }
    else setActionErr('Failed to update ban status.');
  }

  async function doDelete() {
    setActionErr('');
    const { ok } = await call(`/api/admin/users/${deleteModal.user.id}`, 'DELETE');
    if (ok) { setDeleteModal(null); refetch(); }
    else setActionErr('Failed to delete user.');
  }

  const columns = [
    { key: 'email',      label: 'Email',    sortable: true, render: (v) => <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{v ?? '—'}</span> },
    { key: 'full_name',  label: 'Name',     sortable: true },
    { key: 'credits',    label: 'Credits',  sortable: true, render: (v) => <span style={{ color: 'var(--sys-warn)', fontWeight: 600 }}>{v ?? 0}</span> },
    { key: 'subscription_tier', label: 'Tier', render: (v) => <span className={`adm-badge ${v === 'pro' ? 'adm-badge--blue' : 'adm-badge--gray'}`}>{v ?? 'free'}</span> },
    { key: 'is_banned',  label: 'Status',   render: (v) => v
        ? <span className="adm-badge adm-badge--red">Banned</span>
        : <span className="adm-badge adm-badge--green">Active</span> },
    { key: 'created_at', label: 'Joined',   sortable: true, render: (v) => formatDate(v) },
    {
      key: '_actions', label: 'Actions', render: (_, row) => (
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          <button className="adm-btn adm-btn--outline adm-btn--sm" onClick={() => { setNewCredits(String(row.credits ?? 0)); setCreditsModal({ user: row }); setActionErr(''); }} title="Edit credits">
            <Coins size={13} /> Credits
          </button>
          <button
            className={`adm-btn adm-btn--sm ${row.is_banned ? 'adm-btn--success' : 'adm-btn--outline'}`}
            onClick={() => { setBanModal({ user: row }); setBanReason(''); setActionErr(''); }}
            title={row.is_banned ? 'Unban' : 'Ban'}
          >
            {row.is_banned ? <ShieldCheck size={13} /> : <ShieldBan size={13} />}
            {row.is_banned ? 'Unban' : 'Ban'}
          </button>
          <button className="adm-btn adm-btn--danger adm-btn--sm adm-btn--icon" onClick={() => { setDeleteModal({ user: row }); setActionErr(''); }} title="Delete user">
            <Trash2 size={13} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* Stats */}
      <div className="adm-stats-grid">
        <AdminStatCard label="Total Users"  value={total}            icon={<Users size={18} />} />
        <AdminStatCard label="Active"       value={stats.active}     icon={<ShieldCheck size={18} />} sub="Not banned" />
        <AdminStatCard label="Banned"       value={stats.banned}     icon={<ShieldBan size={18} />} />
        <AdminStatCard label="Total Credits" value={stats.totalCredits?.toLocaleString()} icon={<Coins size={18} />} sub="Across all accounts" />
      </div>

      {/* Section header */}
      <div className="adm-section-hd">
        <div className="adm-section-hd-left">
          <div className="adm-section-title">All Users</div>
          <div className="adm-section-sub">Manage user accounts, credits, and access.</div>
        </div>
      </div>

      <AdminTable
        columns={columns}
        rows={users}
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
        searchPlaceholder="Search by email or name…"
        emptyText="No users found."
      />

      {/* Edit Credits Modal */}
      <AdminModal
        open={!!creditsModal}
        title={`Edit Credits — ${creditsModal?.user?.email}`}
        onClose={() => setCreditsModal(null)}
        footer={
          <>
            <button className="adm-btn adm-btn--outline" onClick={() => setCreditsModal(null)}>Cancel</button>
            <button className="adm-btn adm-btn--primary" onClick={doCredits} disabled={actLoading}>
              {actLoading ? 'Saving…' : 'Save Credits'}
            </button>
          </>
        }
      >
        {actionErr && <div className="adm-alert adm-alert--error" style={{ marginBottom: '1rem' }}>{actionErr}</div>}
        <div className="adm-field">
          <label className="adm-field-label">Credit Balance</label>
          <input type="number" min="0" className="adm-field-input" value={newCredits} onChange={(e) => setNewCredits(e.target.value)} />
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>1 credit = 30 labels. Current: {creditsModal?.user?.credits ?? 0}</p>
      </AdminModal>

      {/* Ban/Unban Modal */}
      <AdminModal
        open={!!banModal}
        title={banModal?.user?.is_banned ? `Unban User` : `Ban User`}
        onClose={() => setBanModal(null)}
        footer={
          <>
            <button className="adm-btn adm-btn--outline" onClick={() => setBanModal(null)}>Cancel</button>
            <button className={`adm-btn ${banModal?.user?.is_banned ? 'adm-btn--success' : 'adm-btn--danger'}`} onClick={doBan} disabled={actLoading}>
              {actLoading ? 'Updating…' : (banModal?.user?.is_banned ? 'Confirm Unban' : 'Confirm Ban')}
            </button>
          </>
        }
      >
        {actionErr && <div className="adm-alert adm-alert--error" style={{ marginBottom: '1rem' }}>{actionErr}</div>}
        <p style={{ marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--text-dim)' }}>
          {banModal?.user?.is_banned
            ? `Remove ban from ${banModal?.user?.email}?`
            : `Ban ${banModal?.user?.email}? They will be unable to log in.`}
        </p>
        {!banModal?.user?.is_banned && (
          <div className="adm-field">
            <label className="adm-field-label">Reason (optional)</label>
            <input type="text" className="adm-field-input" placeholder="e.g. Spam, abuse, TOS violation" value={banReason} onChange={(e) => setBanReason(e.target.value)} />
          </div>
        )}
      </AdminModal>

      {/* Delete Modal */}
      <AdminModal
        open={!!deleteModal}
        title="Delete User"
        onClose={() => setDeleteModal(null)}
        footer={
          <>
            <button className="adm-btn adm-btn--outline" onClick={() => setDeleteModal(null)}>Cancel</button>
            <button className="adm-btn adm-btn--danger" onClick={doDelete} disabled={actLoading}>
              {actLoading ? 'Deleting…' : 'Permanently Delete'}
            </button>
          </>
        }
      >
        {actionErr && <div className="adm-alert adm-alert--error" style={{ marginBottom: '1rem' }}>{actionErr}</div>}
        <p style={{ fontSize: '0.875rem', color: 'var(--text-dim)', lineHeight: 1.6 }}>
          Permanently delete <strong style={{ color: 'var(--text-main)' }}>{deleteModal?.user?.email}</strong>?
          This removes their account, profile, and all data. <strong style={{ color: 'var(--sys-danger)' }}>This cannot be undone.</strong>
        </p>
      </AdminModal>
    </div>
  );
}
