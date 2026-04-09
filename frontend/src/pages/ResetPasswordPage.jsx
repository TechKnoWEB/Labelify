import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const { updatePassword } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }
    if (password.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters.' });
      return;
    }
    setLoading(true);
    setMessage(null);
    const { error } = await updatePassword(password);
    setLoading(false);
    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: 'Password updated! Redirecting to dashboard…' });
      setTimeout(() => navigate('/app'), 2000);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-glow auth-glow-1" />
      <div className="auth-glow auth-glow-2" />

      <div className="auth-card glass">
        <Link to="/" className="auth-logo">PeelifyLabs</Link>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-heading">
            <h2>Set new password</h2>
            <p>Choose a strong password for your account.</p>
          </div>

          {message && (
            <div className={`auth-message auth-message-${message.type}`}>{message.text}</div>
          )}

          <div className="form-group">
            <label className="input-label">New password</label>
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
            <label className="input-label">Confirm new password</label>
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

          <button type="submit" className="btn-p btn-block" disabled={loading}>
            {loading ? 'Changing…' : 'Change Password →'}
          </button>
        </form>
      </div>
    </div>
  );
}
