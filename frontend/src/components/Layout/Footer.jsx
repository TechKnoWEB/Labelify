import { Link, useLocation } from 'react-router-dom';

export function Footer() {
  const { pathname } = useLocation();
  const isAuthPage = pathname.startsWith('/auth') || pathname.startsWith('/reset-password');
  const isAppView = 
    pathname.startsWith('/app') || 
    pathname.startsWith('/dashboard') || 
    pathname.startsWith('/pricing') || 
    pathname.startsWith('/profile');
  
  // Hide footer completely on auth pages to keep focus on forms
  if (isAuthPage) return null;

  return (
    <footer className={`footer-wrap ${isAppView ? 'footer-wrap--app' : ''}`}>
      {!isAppView && (
        <div className="footer-container">
          {/* Brand Section */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo">PeelifyLabs</Link>
            <p className="footer-tagline">
              The professional way to design, manage, and print address labels at scale.
            </p>
            <div className="footer-socials">
              <a href="#" aria-label="Twitter">𝕏</a>
              <a href="#" aria-label="GitHub">󰊤</a>
              <a href="#" aria-label="LinkedIn">󰌻</a>
            </div>
          </div>

          {/* Links: Product */}
          <div className="footer-col">
            <h4 className="footer-title">Product</h4>
            <ul className="footer-list">
              <li><Link to="/app">Editor</Link></li>
              <li><Link to="/pricing">Pricing</Link></li>
              <li><Link to="/">Templates</Link></li>
              <li><Link to="/">Custom Sizes</Link></li>
            </ul>
          </div>

          {/* Links: Resources */}
          <div className="footer-col">
            <h4 className="footer-title">Resources</h4>
            <ul className="footer-list">
              <li><Link to="/">Help Center</Link></li>
              <li><Link to="/">API Docs</Link></li>
              <li><Link to="/">Status</Link></li>
              <li><Link to="/">Release Notes</Link></li>
            </ul>
          </div>

          {/* Links: Company */}
          <div className="footer-col">
            <h4 className="footer-title">Legal</h4>
            <ul className="footer-list">
              <li><Link to="/terms">Terms of Service</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/cookies">Cookie Policy</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
            </ul>
          </div>
        </div>
      )}

      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p>&copy; {new Date().getFullYear()} PeelifyLabs Inc. All rights reserved.</p>
          <div className="footer-credits">
            <span>Made with ❤️ in India</span>
            <span className="dot">·</span>
            <span>v2.0.1</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
