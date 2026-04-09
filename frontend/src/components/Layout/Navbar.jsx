import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function Navbar() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'dark';
    return window.localStorage.getItem('peelify-theme') ?? 'dark';
  });
  const profileMenuRef = useRef(null);

  const userLabel = useMemo(() => {
    if (!user?.email) return 'Account';
    return user.email.split('@')[0];
  }, [user]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem('peelify-theme', theme);
  }, [theme]);

  useEffect(() => {
    setMenuOpen(false);
    setProfileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (!profileMenuRef.current?.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    }

    if (profileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileMenuOpen]);

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  const isActive = (path) => location.pathname === path;
  const isDarkMode = theme === 'dark';

  function toggleTheme() {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link to={user ? '/dashboard' : '/'} className="navbar-logo">
          PeelifyLabs
        </Link>

        {/* Desktop links */}
        <div className="navbar-links">
          {user ? (
            <>
              <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'nav-link-active' : ''}`}>Dashboard</Link>
              <Link to="/app" className={`nav-link ${isActive('/app') ? 'nav-link-active' : ''}`}>Editor</Link>
              <Link to="/pricing" className={`nav-link ${isActive('/pricing') ? 'nav-link-active' : ''}`}>Plans</Link>
            </>
          ) : (
            <>
              <Link to="/" className={`nav-link ${isActive('/') ? 'nav-link-active' : ''}`}>Home</Link>
              <Link to="/pricing" className={`nav-link ${isActive('/pricing') ? 'nav-link-active' : ''}`}>Pricing</Link>
            </>
          )}
        </div>

        {/* Auth controls */}
        <div className="navbar-auth">
          {user ? (
            <div className="navbar-user">
              <div className="credit-badge">
                <span className="credit-icon">◆</span>
                <span>{profile?.credits ?? '—'} credits</span>
              </div>
              <button
                type="button"
                onClick={toggleTheme}
                className="theme-toggle"
                aria-pressed={isDarkMode}
                aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
                title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
              >
                <span className="theme-toggle-track">
                  <span className="theme-toggle-label">{isDarkMode ? 'Dark' : 'Light'}</span>
                  <span className="theme-toggle-thumb" />
                </span>
              </button>
              <Link to="/pricing" className="btn-s" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>Buy Credits</Link>
              <div className="profile-menu-wrap" ref={profileMenuRef}>
                <button
                  type="button"
                  className={`profile-menu-trigger ${profileMenuOpen ? 'profile-menu-trigger-open' : ''}`}
                  onClick={() => setProfileMenuOpen((open) => !open)}
                  aria-haspopup="menu"
                  aria-expanded={profileMenuOpen}
                >
                  <span className="profile-avatar">{userLabel.slice(0, 1).toUpperCase()}</span>
                  <span className="profile-menu-text">
                    <span className="profile-menu-name">{userLabel}</span>
                    <span className="profile-menu-subtitle">My account</span>
                  </span>
                  <span className="profile-menu-caret">{profileMenuOpen ? '▲' : '▼'}</span>
                </button>

                {profileMenuOpen && (
                  <div className="profile-dropdown" role="menu" aria-label="User profile">
                    <Link to="/profile" className="profile-dropdown-link" role="menuitem">Profile</Link>
                    <Link to="/support" className="profile-dropdown-link" role="menuitem">Help / Support</Link>
                    <button type="button" onClick={handleSignOut} className="profile-dropdown-link profile-dropdown-button" role="menuitem">
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="navbar-auth-btns">
              <Link to="/auth" className="btn-g">Sign In</Link>
              <Link to="/auth?tab=signup" className="btn-p" style={{ padding: '8px 20px', fontSize: '0.875rem' }}>Get Started</Link>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
          <span /><span /><span />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="mobile-menu">
          {user ? (
            <>
              <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="mobile-link">Dashboard</Link>
              <Link to="/app" onClick={() => setMenuOpen(false)} className="mobile-link">Editor</Link>
              <Link to="/pricing" onClick={() => setMenuOpen(false)} className="mobile-link">Plans</Link>
            </>
          ) : (
            <>
              <Link to="/" onClick={() => setMenuOpen(false)} className="mobile-link">Home</Link>
              <Link to="/pricing" onClick={() => setMenuOpen(false)} className="mobile-link">Pricing</Link>
            </>
          )}
          <div className="mobile-divider" />
          {user ? (
            <>
              <span className="mobile-credit">◆ {profile?.credits ?? '—'} credits</span>
              <button type="button" onClick={toggleTheme} className="mobile-link">
                {isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              </button>
              <Link to="/profile" onClick={() => setMenuOpen(false)} className="mobile-link">Profile</Link>
              <Link to="/support" onClick={() => setMenuOpen(false)} className="mobile-link">Help / Support</Link>
              <button onClick={() => { handleSignOut(); setMenuOpen(false); }} className="mobile-link">Sign Out</button>
            </>
          ) : (
            <>
              <Link to="/auth" onClick={() => setMenuOpen(false)} className="mobile-link">Sign In</Link>
              <Link to="/auth?tab=signup" onClick={() => setMenuOpen(false)} className="mobile-link btn-p" style={{ marginTop: '0.5rem' }}>Get Started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
