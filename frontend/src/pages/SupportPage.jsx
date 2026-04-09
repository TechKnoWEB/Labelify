import { Link } from 'react-router-dom';

export default function SupportPage() {
  return (
    <main className="support-page">
      <section className="support-shell glass-panel">
        <div className="support-copy">
          <span className="support-kicker">Help / Support</span>
          <h1>Need a hand with PeelifyLabs?</h1>
          <p>
            Reach out if you need help with your account, credits, templates, or printing workflow.
            We usually review support requests within one business day.
          </p>
        </div>

        <div className="support-grid">
          <article className="support-card">
            <h2>Email support</h2>
            <p>Send us the details and screenshots if something is blocking your workflow.</p>
            <a className="btn-p" href="mailto:support@peelify.com?subject=PeelifyLabs%20Support%20Request">
              support@peelify.com
            </a>
          </article>

          <article className="support-card">
            <h2>Quick links</h2>
            <p>Jump back into the app or manage your account details from here.</p>
            <div className="support-actions">
              <Link to="/app" className="btn-s">Open Editor</Link>
              <Link to="/profile" className="btn-g">Go to Profile</Link>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
