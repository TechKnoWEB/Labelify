import { Link } from 'react-router-dom';

export default function PrivacyPage() {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <div className="legal-header">
          <p className="lp-tag">Legal</p>
          <h1 className="legal-title">Privacy Policy</h1>
          <p className="legal-meta">Effective Date: April 8, 2026 · Last Updated: April 8, 2026</p>
        </div>

        <div className="legal-body">
          <section className="legal-section">
            <h2>1. Introduction</h2>
            <p>
              PeelifyLabs Inc. ("we", "us", "our") respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use the PeelifyLabs service.
            </p>
          </section>

          <section className="legal-section">
            <h2>2. Information We Collect</h2>
            <h3>Account Information</h3>
            <p>When you register, we collect your email address and a hashed password. We do not store plaintext passwords.</p>

            <h3>Usage Data</h3>
            <p>We collect information about how you interact with the Service, including pages visited, features used, label generation events, and credit transactions.</p>

            <h3>Uploaded Data</h3>
            <p>
              CSV files and label content you upload are processed in-browser or temporarily on our servers solely to generate your PDF output. We do not retain uploaded data beyond the duration of your session unless explicitly saved to your account.
            </p>

            <h3>Payment Information</h3>
            <p>
              Payment details (card numbers, etc.) are handled entirely by our third-party payment processor. We only receive a confirmation of the transaction and your credit balance update.
            </p>
          </section>

          <section className="legal-section">
            <h2>3. How We Use Your Information</h2>
            <ul>
              <li>To provide, operate, and maintain the Service</li>
              <li>To process transactions and manage your credit balance</li>
              <li>To send transactional emails (receipts, password resets)</li>
              <li>To improve and personalize the Service</li>
              <li>To detect and prevent fraud or abuse</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>4. Data Sharing and Disclosure</h2>
            <p>We do not sell your personal data. We may share your information only:</p>
            <ul>
              <li>With service providers acting on our behalf (payment processors, hosting, analytics)</li>
              <li>When required by law, regulation, or valid legal process</li>
              <li>To protect the rights, property, or safety of PeelifyLabs, our users, or the public</li>
              <li>In connection with a merger, acquisition, or sale of all or part of our business</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>5. Data Retention</h2>
            <p>
              We retain your account data for as long as your account is active. You may request deletion of your account and associated data at any time by <Link to="/contact" className="legal-link">contacting us</Link>. Aggregated, anonymized usage data may be retained indefinitely.
            </p>
          </section>

          <section className="legal-section">
            <h2>6. Security</h2>
            <p>
              We implement industry-standard security measures including encrypted connections (HTTPS), hashed credentials, and access controls. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section className="legal-section">
            <h2>7. Your Rights</h2>
            <p>Depending on your location, you may have rights including:</p>
            <ul>
              <li>The right to access the personal data we hold about you</li>
              <li>The right to correct inaccurate data</li>
              <li>The right to request deletion of your data</li>
              <li>The right to data portability</li>
              <li>The right to withdraw consent where processing is based on consent</li>
            </ul>
            <p>
              To exercise any of these rights, please <Link to="/contact" className="legal-link">contact us</Link>.
            </p>
          </section>

          <section className="legal-section">
            <h2>8. Cookies</h2>
            <p>
              We use cookies and similar tracking technologies. For details, please read our <Link to="/cookies" className="legal-link">Cookie Policy</Link>.
            </p>
          </section>

          <section className="legal-section">
            <h2>9. Children's Privacy</h2>
            <p>
              The Service is not directed at children under 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal data, please contact us and we will delete it.
            </p>
          </section>

          <section className="legal-section">
            <h2>10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy periodically. We will notify you of material changes via email or a notice on the Service. The "Last Updated" date at the top of this page indicates when this policy was last revised.
            </p>
          </section>

          <section className="legal-section">
            <h2>11. Contact</h2>
            <p>
              For privacy-related questions or requests, please <Link to="/contact" className="legal-link">contact us</Link>.
            </p>
          </section>
        </div>

        <div className="legal-footer-nav">
          <Link to="/terms" className="legal-nav-link">Terms of Service</Link>
          <span className="legal-nav-sep">·</span>
          <Link to="/cookies" className="legal-nav-link">Cookie Policy</Link>
          <span className="legal-nav-sep">·</span>
          <Link to="/contact" className="legal-nav-link">Contact Us</Link>
        </div>
      </div>
    </div>
  );
}
