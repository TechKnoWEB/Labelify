import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, Lock, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import '../Admin.css';

// Step progress shown during login
const STEPS = [
  { key: 'supabase',      label: 'Verifying credentials' },
  { key: 'edge_function', label: 'Checking admin privileges' },
  { key: 'done',          label: 'Access granted' },
];

export default function AdminLoginPage() {
  const { adminSignIn, adminUser } = useAdminAuth();
  const navigate = useNavigate();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [activeStep, setActiveStep] = useState(null); // null | 'supabase' | 'edge_function' | 'done'
  const [error, setError]       = useState(null); // { message, step }

  if (adminUser) {
    navigate('/admin/users', { replace: true });
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: err } = await adminSignIn(email, password, (step) => setActiveStep(step));

    if (err) {
      setLoading(false);
      setActiveStep(null);
      setError(err);
      return;
    }

    setActiveStep('done');
    setTimeout(() => navigate('/admin/users', { replace: true }), 400);
  }

  // Advance step indicator visually as we know we passed step 1
  // (We can infer: if error.step === 'edge_function', step 1 passed)
  const passedStep = error?.step === 'edge_function' || error?.step === 'network' ? 'supabase' : null;

  return (
    <div className="adm-root adm-login-page">
      <div className="adm-login-card">
        {/* Logo */}
        <div className="adm-login-logo">
          <Shield size={20} color="var(--sys-danger)" />
          <span className="adm-login-logo-text">PeelifyLabs</span>
          <span className="adm-login-badge">SuperAdmin</span>
        </div>

        <h1 className="adm-login-title">Admin Sign In</h1>
        <p className="adm-login-sub">Restricted access — authorized personnel only.</p>

        {/* Error */}
        {error && (
          <div className="adm-alert adm-alert--error" style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{error.message}</div>
            {error.step === 'supabase' && (
              <div style={{ fontSize: '0.78rem', opacity: 0.8, marginTop: '0.3rem' }}>
                Hint: Make sure this account exists in Supabase Auth and the email is confirmed.
              </div>
            )}
            {error.step === 'edge_function' && (
              <div style={{ fontSize: '0.78rem', opacity: 0.8, marginTop: '0.3rem' }}>
                Hint: Add <code style={{ background: 'rgba(255,255,255,0.1)', padding: '1px 4px', borderRadius: 3 }}>{email}</code> to <strong>SUPERADMIN_EMAILS</strong> in Supabase Edge Function secrets, then redeploy.
              </div>
            )}
            {error.step === 'network' && (
              <div style={{ fontSize: '0.78rem', opacity: 0.8, marginTop: '0.3rem' }}>
                Hint: Run <code style={{ background: 'rgba(255,255,255,0.1)', padding: '1px 4px', borderRadius: 3 }}>npx supabase functions deploy admin-auth</code> and check VITE_SUPABASE_URL in your .env.
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="adm-form-group">
            <label className="adm-label">Email address</label>
            <input
              type="email"
              className="adm-input"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(null); }}
              required
              autoComplete="username"
              disabled={loading}
            />
          </div>

          <div className="adm-form-group">
            <label className="adm-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'}
                className="adm-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(null); }}
                required
                autoComplete="current-password"
                disabled={loading}
                style={{ paddingRight: '2.5rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPw(p => !p)}
                disabled={loading}
                style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Step progress — shown while loading or after partial failure */}
          {(loading || passedStep) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', margin: '0.75rem 0 1rem', padding: '0.85rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--r-md)', border: '1px solid var(--border-color)' }}>
              {STEPS.filter(s => s.key !== 'done').map((step) => {
                const isPassed  = passedStep === step.key || (activeStep === 'done');
                const isActive  = loading && activeStep === step.key;
                const isFailed  = error?.step === step.key;

                return (
                  <div key={step.key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: isFailed ? 'var(--sys-danger)' : isPassed ? 'var(--sys-success)' : isActive ? 'var(--text-main)' : 'var(--text-muted)' }}>
                    {isFailed  ? <XCircle     size={14} /> :
                     isPassed  ? <CheckCircle size={14} /> :
                     isActive  ? <Loader2     size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> :
                                 <div style={{ width: 14, height: 14, borderRadius: '50%', border: '1.5px solid currentColor', opacity: 0.3 }} />}
                    {step.label}
                  </div>
                );
              })}
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          <button type="submit" className="adm-btn-primary" disabled={loading}>
            {loading
              ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}><Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> Authenticating…</span>
              : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}><Lock size={15} /> Sign In to Admin Panel</span>
            }
          </button>
        </form>

        <p style={{ marginTop: '1.5rem', fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.5 }}>
          This portal is monitored. Unauthorized access attempts are logged.
        </p>
      </div>
    </div>
  );
}
