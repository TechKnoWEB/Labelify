// DashboardPage.jsx — User overview: credit balance, work history, purchase history
import './EditorPage.css';
import './DashboardOverview.css';
import { useState, useEffect } from 'react';
import { CalendarClock, Coins, FolderClock, Printer, Receipt, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function fmtTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit',
  });
}

function renderDashboardIcon(icon, fallback = 'generic') {
  const iconMap = {
    credits: Coins,
    printer: Printer,
    member: CalendarClock,
    work: FolderClock,
    purchases: ShoppingCart,
    generic: Coins,
  };

  if (typeof icon !== 'string') return icon;

  const normalized = icon.trim();
  if (normalized === '◆' || normalized === '⊙') {
    const Icon = iconMap.credits;
    return <Icon size={18} strokeWidth={2.2} />;
  }
  if (normalized === '⎙') {
    const Icon = fallback === 'work' ? iconMap.work : iconMap.printer;
    return <Icon size={18} strokeWidth={2.2} />;
  }
  if (normalized === '⊞') {
    const Icon = iconMap.member;
    return <Icon size={18} strokeWidth={2.2} />;
  }
  if (normalized === '⊕') {
    const Icon = iconMap.purchases;
    return <Icon size={18} strokeWidth={2.2} />;
  }

  const Icon = iconMap[fallback] ?? iconMap.generic;
  return <Icon size={18} strokeWidth={2.2} />;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, accent }) {
  const fallback =
    label === 'Credits Remaining' ? 'credits' :
    label === 'Total Labels Printed' ? 'printer' :
    label === 'Credits Spent' ? 'credits' :
    label === 'Member Since' ? 'member' :
    'credits';

  return (
    <div className="dash-stat-card" style={accent ? { '--card-accent': accent } : {}}>
      <span className="dash-stat-card__glow" aria-hidden="true" />
      <div className="dash-stat-card__icon-wrap">
        <div className="dash-stat-card__icon">{renderDashboardIcon(icon, fallback)}</div>
      </div>
      <div className="dash-stat-card__body">
        <p className="dash-stat-card__label">{label}</p>
        <p className="dash-stat-card__value">{value}</p>
        {sub && <p className="dash-stat-card__sub">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Section Shell ────────────────────────────────────────────────────────────
function Section({ title, icon, children, action }) {
  const fallback =
    title === 'Work History' ? 'work' :
    title === 'Purchase History' ? 'purchases' :
    'credits';

  return (
    <section className="dash-section">
      <div className="dash-section__head">
        <h2 className="dash-section__title">
          <span className="dash-section__title-icon" aria-hidden="true">{renderDashboardIcon(icon, fallback)}</span>
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ icon, message, cta }) {
  const fallback = message.includes('purchase') ? 'purchases' : message.includes('credit') ? 'credits' : 'work';

  return (
    <div className="dash-empty">
      <span className="dash-empty__icon" aria-hidden="true">{renderDashboardIcon(icon, fallback)}</span>
      <p className="dash-empty__msg">{message}</p>
      {cta}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user, profile } = useAuth();

  const [jobs, setJobs]                   = useState([]);
  const [jobsLoading, setJobsLoading]     = useState(true);
  const [purchases, setPurchases]         = useState([]);
  const [purchasesLoading, setPurchasesLoading] = useState(true);
  const [activeTab, setActiveTab]         = useState('work'); // 'work' | 'credits' | 'purchases'

  const credits    = profile?.credits ?? 0;
  const tier       = profile?.subscription_tier ?? 'free';
  const firstName  = user?.user_metadata?.full_name?.split(' ')[0] ?? user?.email?.split('@')[0] ?? 'there';

  useEffect(() => {
    if (user) {
      fetchJobs();
      fetchPurchases();
    }
  }, [user]);

  async function fetchJobs() {
    setJobsLoading(true);
    const { data, error } = await supabase
      .from('job_history')
      .select('id, template_name, label_count, credits_used, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);
    if (!error && data) setJobs(data);
    setJobsLoading(false);
  }

  async function fetchPurchases() {
    setPurchasesLoading(true);
    const { data, error } = await supabase
      .from('credit_purchases')
      .select('id, pack_name, credits, amount_usd, payment_provider, status, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);
    if (!error && data) setPurchases(data);
    setPurchasesLoading(false);
  }

  // Aggregate stats from job history
  const totalLabels       = jobs.reduce((s, j) => s + j.label_count, 0);
  const totalCreditsSpent = jobs.reduce((s, j) => s + j.credits_used, 0);

  // Credit spend entries derived from job history
  const creditEntries = jobs.filter((j) => j.credits_used > 0);

  return (
    <div className="dash-overview-page">

      {/* ── Page Header ── */}
      <header className="dash-overview-header">
        <div className="dash-overview-header__left">
          <h1 className="dash-overview-header__title">
            Welcome back, <span className="dash-overview-header__name">{firstName}</span>
          </h1>
          <p className="dash-overview-header__sub">Here's an overview of your account activity.</p>
        </div>
        <Link to="/app" className="dash-overview-header__cta">
          <span aria-hidden="true">✏</span> Open Editor
        </Link>
      </header>

      {/* ── Stat Cards ── */}
      <div className="dash-stats-row">
        <StatCard
          icon={<Coins size={20} strokeWidth={2.15} />}
          label="Credits Remaining"
          value={credits}
          sub={tier === 'free' ? 'Free plan' : tier}
          accent="var(--acc-prim)"
        />
        <StatCard
          icon={<Printer size={20} strokeWidth={2.15} />}
          label="Total Labels Printed"
          value={totalLabels.toLocaleString()}
          sub={`${jobs.length} job${jobs.length !== 1 ? 's' : ''}`}
          accent="var(--sys-success)"
        />
        <StatCard
          icon={<Receipt size={20} strokeWidth={2.15} />}
          label="Credits Spent"
          value={totalCreditsSpent}
          sub="all time"
          accent="var(--sys-warn)"
        />
        <StatCard
          icon={<CalendarClock size={20} strokeWidth={2.15} />}
          label="Member Since"
          value={profile?.created_at ? fmt(profile.created_at) : '--'}
          accent="var(--acc-prim-lt)"
        />
      </div>

      {/* ── Tabs ── */}
      <div className="dash-tabs" role="tablist">
        {[
          { key: 'work',      label: 'Work History',     icon: '⎙' },
          { key: 'credits',   label: 'Credit Spend',     icon: '◆' },
          { key: 'purchases', label: 'Purchase History', icon: '⊕' },
        ].map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={activeTab === tab.key}
            className={`dash-tab${activeTab === tab.key ? ' dash-tab--active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <span aria-hidden="true">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      <div className="dash-tab-panel" role="tabpanel">

        {/* Work History */}
        {activeTab === 'work' && (
          <Section title="Work History" icon="⎙">
            {jobsLoading ? (
              <p className="dash-loading">Loading…</p>
            ) : jobs.length === 0 ? (
              <EmptyState
                icon="⎙"
                message="No jobs yet. Generate your first PDF to see history here."
                cta={<Link to="/app" className="dash-empty__cta">Open Editor →</Link>}
              />
            ) : (
              <div className="dash-table-wrap">
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Template</th>
                      <th>Labels</th>
                      <th>Credits Used</th>
                      <th>Date</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((job) => (
                      <tr key={job.id}>
                        <td className="dash-table__primary">{job.template_name || 'Custom Template'}</td>
                        <td>{job.label_count}</td>
                        <td>
                          <span className="dash-badge dash-badge--accent">
                            {job.credits_used} credit{job.credits_used !== 1 ? 's' : ''}
                          </span>
                        </td>
                        <td className="dash-table__muted">{fmt(job.created_at)}</td>
                        <td className="dash-table__muted">{fmtTime(job.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Section>
        )}

        {/* Credit Spend History */}
        {activeTab === 'credits' && (
          <Section title="Credit Spend History" icon="◆" action={
            <Link to="/pricing" className="dash-section__action-link">Buy Credits →</Link>
          }>
            {jobsLoading ? (
              <p className="dash-loading">Loading…</p>
            ) : creditEntries.length === 0 ? (
              <EmptyState
                icon="◆"
                message="No credit spend yet. Credits are deducted when you generate a PDF."
                cta={<Link to="/app" className="dash-empty__cta">Open Editor →</Link>}
              />
            ) : (
              <>
                {/* Summary bar */}
                <div className="dash-credit-summary">
                  <div className="dash-credit-summary__item">
                    <span className="dash-credit-summary__num">{totalCreditsSpent}</span>
                    <span className="dash-credit-summary__lbl">Total Spent</span>
                  </div>
                  <div className="dash-credit-summary__divider" />
                  <div className="dash-credit-summary__item">
                    <span className="dash-credit-summary__num">{credits}</span>
                    <span className="dash-credit-summary__lbl">Remaining</span>
                  </div>
                  <div className="dash-credit-summary__divider" />
                  <div className="dash-credit-summary__item">
                    <span className="dash-credit-summary__num">{creditEntries.length}</span>
                    <span className="dash-credit-summary__lbl">Transactions</span>
                  </div>
                </div>

                <div className="dash-table-wrap">
                  <table className="dash-table">
                    <thead>
                      <tr>
                        <th>Description</th>
                        <th>Labels</th>
                        <th>Credits Deducted</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {creditEntries.map((entry) => (
                        <tr key={entry.id}>
                          <td className="dash-table__primary">
                            PDF generated — {entry.template_name || 'Custom Template'}
                          </td>
                          <td>{entry.label_count}</td>
                          <td>
                            <span className="dash-badge dash-badge--danger">
                              −{entry.credits_used}
                            </span>
                          </td>
                          <td className="dash-table__muted">{fmt(entry.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </Section>
        )}

        {/* Purchase History */}
        {activeTab === 'purchases' && (
          <Section title="Purchase History" icon="⊕" action={
            <Link to="/pricing" className="dash-section__action-link">Buy Credits →</Link>
          }>
            {purchasesLoading ? (
              <p className="dash-loading">Loading…</p>
            ) : purchases.length === 0 ? (
              <EmptyState
                icon="⊕"
                message="No purchases yet."
                cta={
                  <p className="dash-empty__hint">
                    Credit packs available on the{' '}
                    <Link to="/pricing" className="dash-empty__link">Pricing page</Link>.
                  </p>
                }
              />
            ) : (
              <div className="dash-table-wrap">
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Pack</th>
                      <th>Credits</th>
                      <th>Amount</th>
                      <th>Provider</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchases.map((p) => (
                      <tr key={p.id}>
                        <td className="dash-table__primary">{p.pack_name || 'Credit Pack'}</td>
                        <td>+{p.credits}</td>
                        <td>${(p.amount_usd / 100).toFixed(2)}</td>
                        <td className="dash-table__muted" style={{ textTransform: 'capitalize' }}>{p.payment_provider}</td>
                        <td>
                          <span className={`dash-badge ${p.status === 'completed' ? 'dash-badge--accent' : 'dash-badge--danger'}`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="dash-table__muted">{fmt(p.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Section>
        )}

      </div>

    </div>
  );
}

