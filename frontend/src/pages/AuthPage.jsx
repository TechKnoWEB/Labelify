import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../lib/api';
import AltchaWidget from '../components/AltchaWidget';

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
      <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332Z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
    </svg>
  );
}

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'signup' ? 'signup' : 'login';

  const [tab, setTab] = useState(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success'|'error', text }
  const [showPassword, setShowPassword] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);

  const loginCaptchaRef = useRef(null);
  const signupCaptchaRef = useRef(null);

  const { user, signIn, signUp, signInWithGoogle, resetPassword } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) navigate('/app');
  }, [user, navigate]);

  // Sync tab with URL param changes
  useEffect(() => {
    setTab(initialTab);
    setMessage(null);
  }, [initialTab]);

  function clearForm() {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFullName('');
    setMessage(null);
    setShowPassword(false);
    setCaptchaVerified(false);
    loginCaptchaRef.current?.reset();
    signupCaptchaRef.current?.reset();
  }

  function switchTab(t) {
    setTab(t);
    clearForm();
  }

  async function handleGoogleAuth() {
    setLoading(true);
    setMessage(null);
    const { error } = await signInWithGoogle();
    setLoading(false);
    if (error) setMessage({ type: 'error', text: error.message });
    // On success Supabase redirects to /app — no navigate() needed
  }

  async function handleLogin(e) {
    e.preventDefault();
    if (!captchaVerified) {
      setMessage({ type: 'error', text: 'Please complete the security check before signing in.' });
      return;
    }
    setLoading(true);
    setMessage(null);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      setMessage({ type: 'error', text: error.message });
      setCaptchaVerified(false);
      loginCaptchaRef.current?.reset();
    } else {
      navigate('/app');
    }
  }

  async function handleSignup(e) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }
    if (password.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters.' });
      return;
    }
    if (!captchaVerified) {
      setMessage({ type: 'error', text: 'Please complete the security check before creating your account.' });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const checkRes = await fetch(`${API_BASE}/api/check-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const checkData = await checkRes.json();
      if (checkData.blocked) {
        setMessage({ type: 'error', text: checkData.error });
        setLoading(false);
        setCaptchaVerified(false);
        signupCaptchaRef.current?.reset();
        return;
      }
    } catch {
      // If check fails, allow signup to proceed (fail open to avoid blocking real users)
    }
    const { error } = await signUp(email, password, fullName);
    setLoading(false);
    if (error) {
      setMessage({ type: 'error', text: error.message });
      setCaptchaVerified(false);
      signupCaptchaRef.current?.reset();
    } else {
      setMessage({
        type: 'success',
        text: 'Account created! Check your email to confirm your address, then sign in.',
      });
    }
  }

  async function handleReset(e) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const { error } = await resetPassword(email);
    setLoading(false);
    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({
        type: 'success',
        text: 'Password reset email sent. Check your inbox.',
      });
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-glow auth-glow-1" />
      <div className="auth-glow auth-glow-2" />

      <div className="auth-card glass">
        {/* Logo */}
        <Link to="/" className="auth-logo">PeelifyLabs</Link>

        {/* Tab switcher — only for login/signup */}
        {tab !== 'reset' && (
          <div className="auth-tabs">
            <button
              className={`auth-tab ${tab === 'login' ? 'auth-tab-active' : ''}`}
              onClick={() => switchTab('login')}
            >
              Sign In
            </button>
            <button
              className={`auth-tab ${tab === 'signup' ? 'auth-tab-active' : ''}`}
              onClick={() => switchTab('signup')}
            >
              Create Account
            </button>
          </div>
        )}

        {/* ── LOGIN ── */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} className="auth-form">
            <div className="auth-heading">
              <h2>Welcome back</h2>
              <p>Sign in to your PeelifyLabs account</p>
            </div>

            {message && <div className={`auth-message auth-message-${message.type}`}>{message.text}</div>}

            <div className="form-group">
              <label className="input-label">Email address</label>
              <input
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="input-label">Password</label>
              <div className="input-password-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input-field"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
              <div style={{ textAlign: 'right', marginTop: '0.4rem' }}>
                <button type="button" className="link-btn" onClick={() => switchTab('reset')}>
                  Forgot password?
                </button>
              </div>
            </div>

            <div className="captcha-wrap">
              <AltchaWidget
                ref={loginCaptchaRef}
                onVerified={() => setCaptchaVerified(true)}
                onReset={() => setCaptchaVerified(false)}
              />
            </div>

            <button type="submit" className="btn-p btn-block" disabled={loading || !captchaVerified}>
              {loading ? 'Signing in…' : 'Sign In →'}
            </button>

            <div className="auth-divider"><span>or</span></div>

            <button type="button" className="btn-google" onClick={handleGoogleAuth} disabled={loading}>
              <GoogleIcon />
              Continue with Google
            </button>

            <p className="auth-footer-text">
              Don't have an account?{' '}
              <button type="button" className="link-btn" onClick={() => switchTab('signup')}>
                Create one free
              </button>
            </p>
          </form>
        )}

        {/* ── SIGN UP ── */}
        {tab === 'signup' && (
          <form onSubmit={handleSignup} className="auth-form">
            <div className="auth-heading">
              <h2>Create your account</h2>
              <p>Free to start — no credit card required</p>
            </div>

            {message && <div className={`auth-message auth-message-${message.type}`}>{message.text}</div>}

            <div className="form-group">
              <label className="input-label">Full name</label>
              <input
                type="text"
                className="input-field"
                placeholder="Jane Smith"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>

            <div className="form-group">
              <label className="input-label">Email address</label>
              <input
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="input-label">Password</label>
              <div className="input-password-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input-field"
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
                <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="input-label">Confirm password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                className="input-field"
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>

            <div className="captcha-wrap">
              <AltchaWidget
                ref={signupCaptchaRef}
                onVerified={() => setCaptchaVerified(true)}
                onReset={() => setCaptchaVerified(false)}
              />
            </div>

            <button type="submit" className="btn-p btn-block" disabled={loading || !captchaVerified}>
              {loading ? 'Creating account…' : 'Create Account →'}
            </button>

            <div className="auth-divider"><span>or</span></div>

            <button type="button" className="btn-google" onClick={handleGoogleAuth} disabled={loading}>
              <GoogleIcon />
              Continue with Google
            </button>

            <p className="auth-footer-text">
              Already have an account?{' '}
              <button type="button" className="link-btn" onClick={() => switchTab('login')}>
                Sign in
              </button>
            </p>
          </form>
        )}

        {/* ── RESET PASSWORD ── */}
        {tab === 'reset' && (
          <form onSubmit={handleReset} className="auth-form">
            <div className="auth-heading">
              <h2>Reset your password</h2>
              <p>We'll send a reset link to your email.</p>
            </div>

            {message && <div className={`auth-message auth-message-${message.type}`}>{message.text}</div>}

            <div className="form-group">
              <label className="input-label">Email address</label>
              <input
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <button type="submit" className="btn-p btn-block" disabled={loading}>
              {loading ? 'Sending…' : 'Send Reset Link →'}
            </button>

            <p className="auth-footer-text">
              Remember it?{' '}
              <button type="button" className="link-btn" onClick={() => switchTab('login')}>
                Back to sign in
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
