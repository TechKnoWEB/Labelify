import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setDisplayName(user.user_metadata?.full_name ?? '');
      fetchJobs();
    }
  }, [user]);

  async function fetchJobs() {
    setJobsLoading(true);
    const { data, error } = await supabase
      .from('job_history')
      .select('id, template_name, label_count, credits_used, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (!error && data) setJobs(data);
    setJobsLoading(false);
  }

  async function handleSaveName(e) {
    e.preventDefault();
    setSaving(true);
    setSaveMsg(null);

    const { error } = await supabase.auth.updateUser({
      data: { full_name: displayName.trim() },
    });

    setSaving(false);

    if (error) {
      setSaveMsg({ type: 'error', text: error.message });
    } else {
      await refreshProfile();
      setSaveMsg({ type: 'success', text: 'Display name updated.' });
    }
  }

  const shellStyle = {
    minHeight: '100vh',
    background: 'var(--bg-main)',
    color: 'var(--text-main)',
    fontFamily: 'Inter, system-ui, sans-serif',
    padding: '2rem 1.25rem',
  };

  const panelStyle = {
    background: 'var(--bg-panel)',
    border: '1px solid var(--border-color)',
    borderRadius: 12,
    padding: '1.5rem',
    boxShadow: 'var(--sh-card)',
  };

  const sectionTitleStyle = {
    fontSize: '1rem',
    fontWeight: 600,
    marginBottom: '1.25rem',
    color: 'var(--text-dim)',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    marginBottom: '0.3rem',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  };

  const dividerStyle = {
    marginTop: '1.25rem',
    paddingTop: '1.25rem',
    borderTop: '1px solid var(--border-color)',
  };

  return (
    <div style={shellStyle}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <Link
          to="/dashboard"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--text-muted)',
            fontSize: '0.85rem',
            textDecoration: 'none',
            marginBottom: '2rem',
          }}
        >
          {'<-'} Back to Dashboard
        </Link>

        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '2rem' }}>
          My Profile
        </h1>

        <section style={{ ...panelStyle, marginBottom: '1.5rem' }}>
          <h2 style={sectionTitleStyle}>Account Details</h2>

          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Email</label>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-dim)' }}>{user?.email}</p>
          </div>

          <form onSubmit={handleSaveName}>
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="display-name" style={labelStyle}>
                Display Name
              </label>
              <input
                id="display-name"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                style={{
                  width: '100%',
                  padding: '0.6rem 0.9rem',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 8,
                  color: 'var(--text-main)',
                  fontSize: '0.95rem',
                  fontFamily: 'inherit',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {saveMsg && (
              <p
                style={{
                  fontSize: '0.82rem',
                  marginBottom: '0.75rem',
                  color: saveMsg.type === 'success' ? 'var(--sys-success)' : 'var(--sys-danger)',
                }}
              >
                {saveMsg.text}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              style={{
                padding: '0.55rem 1.5rem',
                background: 'linear-gradient(135deg, var(--acc-prim), var(--acc-prim-hover))',
                border: 'none',
                borderRadius: 8,
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.88rem',
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.6 : 1,
                fontFamily: 'inherit',
              }}
            >
              {saving ? 'Saving...' : 'Save Name'}
            </button>
          </form>

          <div style={dividerStyle}>
            <label style={labelStyle}>Password</label>
            <Link
              to="/reset-password"
              style={{
                fontSize: '0.88rem',
                color: 'var(--acc-prim)',
                textDecoration: 'underline',
                textUnderlineOffset: 3,
              }}
            >
              Change password {'->'}
            </Link>
          </div>

          <div
            style={{
              ...dividerStyle,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <label style={labelStyle}>Credits</label>
              <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--acc-prim)' }}>
                {profile?.credits ?? '--'}
                <span
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 400,
                    color: 'var(--text-muted)',
                    marginLeft: 6,
                  }}
                >
                  remaining
                </span>
              </p>
            </div>

            <Link
              to="/pricing"
              style={{
                padding: '0.5rem 1.25rem',
                background: 'rgba(59,130,246,0.08)',
                border: '1px solid rgba(59,130,246,0.22)',
                borderRadius: 8,
                color: 'var(--acc-prim)',
                fontSize: '0.85rem',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Buy Credits
            </Link>
          </div>
        </section>

        <section style={panelStyle}>
          <h2 style={sectionTitleStyle}>Recent Jobs</h2>

          {jobsLoading ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading...</p>
          ) : jobs.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              No jobs yet. Download your first PDF to see history here.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {jobs.map((job) => (
                <div
                  key={job.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto auto',
                    gap: '1rem',
                    alignItems: 'center',
                    padding: '0.7rem 0.9rem',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 8,
                  }}
                >
                  <div>
                    <p style={{ fontSize: '0.88rem', fontWeight: 500, marginBottom: 2 }}>
                      {job.template_name || 'Custom Template'}
                    </p>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {new Date(job.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>

                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {job.label_count} label{job.label_count !== 1 ? 's' : ''}
                  </span>

                  <span
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      color: 'var(--acc-prim)',
                      background: 'rgba(59,130,246,0.08)',
                      border: '1px solid rgba(59,130,246,0.22)',
                      borderRadius: 6,
                      padding: '2px 8px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {job.credits_used} credit{job.credits_used !== 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
