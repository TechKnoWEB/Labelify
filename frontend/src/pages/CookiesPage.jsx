import { Link } from 'react-router-dom';

export default function CookiesPage() {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <div className="legal-header">
          <p className="lp-tag">Legal</p>
          <h1 className="legal-title">Cookie Policy</h1>
          <p className="legal-meta">Effective Date: April 8, 2026 · Last Updated: April 8, 2026</p>
        </div>

        <div className="legal-body">
          <section className="legal-section">
            <h2>1. What Are Cookies</h2>
            <p>
              Cookies are small text files stored on your device when you visit a website. They allow the site to recognize your browser, remember your preferences, and improve your experience over repeat visits.
            </p>
          </section>

          <section className="legal-section">
            <h2>2. How We Use Cookies</h2>
            <p>PeelifyLabs uses cookies and similar technologies for the following purposes:</p>

            <h3>Essential Cookies</h3>
            <p>
              These are required for the Service to function. They handle authentication sessions, security tokens, and user preferences. You cannot opt out of these without affecting core functionality.
            </p>
            <table className="legal-table">
              <thead>
                <tr>
                  <th>Cookie</th>
                  <th>Purpose</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>sb-auth-token</code></td>
                  <td>Supabase authentication session</td>
                  <td>Session</td>
                </tr>
                <tr>
                  <td><code>peelify-prefs</code></td>
                  <td>User interface preferences</td>
                  <td>1 year</td>
                </tr>
              </tbody>
            </table>

            <h3>Analytics Cookies</h3>
            <p>
              We may use analytics tools to understand how users interact with the Service. These cookies collect anonymized data such as page views, session duration, and feature usage to help us improve PeelifyLabs.
            </p>

            <h3>Functional Cookies</h3>
            <p>
              These cookies remember your choices (such as recently used templates or editor settings) to provide a more personalized experience.
            </p>
          </section>

          <section className="legal-section">
            <h2>3. Third-Party Cookies</h2>
            <p>
              Some features of the Service may include content or tools from third parties (such as payment processors). These parties may set their own cookies, which are governed by their respective privacy policies. We do not control third-party cookies.
            </p>
          </section>

          <section className="legal-section">
            <h2>4. Managing Cookies</h2>
            <p>
              You can control and delete cookies through your browser settings. Note that disabling certain cookies may impact your ability to use parts of the Service. Most browsers allow you to:
            </p>
            <ul>
              <li>View cookies stored on your device</li>
              <li>Block third-party cookies</li>
              <li>Block cookies from specific sites</li>
              <li>Clear all cookies when closing the browser</li>
            </ul>
            <p>
              Refer to your browser's help documentation for instructions on managing cookies.
            </p>
          </section>

          <section className="legal-section">
            <h2>5. Local Storage</h2>
            <p>
              In addition to cookies, we use browser local storage to persist editor state, template selections, and other session data. Local storage is not transmitted to our servers on every request and is cleared when you log out or clear your browser data.
            </p>
          </section>

          <section className="legal-section">
            <h2>6. Changes to This Policy</h2>
            <p>
              We may update this Cookie Policy from time to time. The "Last Updated" date at the top reflects the most recent revision. Continued use of the Service after changes indicates your acceptance.
            </p>
          </section>

          <section className="legal-section">
            <h2>7. Contact</h2>
            <p>
              If you have questions about our use of cookies, please <Link to="/contact" className="legal-link">contact us</Link>.
            </p>
          </section>
        </div>

        <div className="legal-footer-nav">
          <Link to="/terms" className="legal-nav-link">Terms of Service</Link>
          <span className="legal-nav-sep">·</span>
          <Link to="/privacy" className="legal-nav-link">Privacy Policy</Link>
          <span className="legal-nav-sep">·</span>
          <Link to="/contact" className="legal-nav-link">Contact Us</Link>
        </div>
      </div>
    </div>
  );
}
