import { Link } from 'react-router-dom';

export default function TermsPage() {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <div className="legal-header">
          <p className="lp-tag">Legal</p>
          <h1 className="legal-title">Terms of Service</h1>
          <p className="legal-meta">Effective Date: April 8, 2026 · Last Updated: April 8, 2026</p>
        </div>

        <div className="legal-body">
          <section className="legal-section">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using PeelifyLabs ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Service. These terms apply to all visitors, users, and others who access or use the Service.
            </p>
          </section>

          <section className="legal-section">
            <h2>2. Description of Service</h2>
            <p>
              PeelifyLabs is a browser-based label generation tool that allows users to design, customize, and export print-ready PDF labels from CSV data. The Service operates on a credit-based system where users purchase credits to generate labels.
            </p>
          </section>

          <section className="legal-section">
            <h2>3. Accounts and Registration</h2>
            <p>
              You must create an account to access the full features of PeelifyLabs. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to provide accurate and complete information when registering.
            </p>
            <p>
              We reserve the right to terminate or suspend accounts that violate these terms, engage in fraudulent activity, or are otherwise used in a manner inconsistent with the intended purpose of the Service.
            </p>
          </section>

          <section className="legal-section">
            <h2>4. Credits and Payments</h2>
            <p>
              Credits are purchased in advance and consumed when labels are generated. All purchases are final and non-refundable unless required by applicable law. Credits do not expire and are tied to your account.
            </p>
            <p>
              Prices are displayed in USD and are subject to change. We will provide reasonable notice before any pricing changes take effect. Payment processing is handled by third-party providers and subject to their terms.
            </p>
          </section>

          <section className="legal-section">
            <h2>5. Acceptable Use</h2>
            <p>You agree not to use the Service to:</p>
            <ul>
              <li>Upload or process data that contains illegal, harmful, or unauthorized content</li>
              <li>Infringe upon the intellectual property rights of others</li>
              <li>Attempt to reverse-engineer, hack, or interfere with the Service</li>
              <li>Use automated tools to access the Service in an unauthorized manner</li>
              <li>Violate any applicable local, national, or international law or regulation</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>6. Intellectual Property</h2>
            <p>
              The Service, including its design, code, branding, and content, is the exclusive property of PeelifyLabs Inc. and protected by applicable intellectual property laws. You retain ownership of any data you upload, but grant us a limited license to process it solely for the purpose of providing the Service.
            </p>
          </section>

          <section className="legal-section">
            <h2>7. Disclaimer of Warranties</h2>
            <p>
              The Service is provided "as is" and "as available" without any warranties of any kind, express or implied. We do not guarantee that the Service will be uninterrupted, error-free, or free of viruses or other harmful components.
            </p>
          </section>

          <section className="legal-section">
            <h2>8. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, PeelifyLabs Inc. shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or in connection with your use of the Service, even if we have been advised of the possibility of such damages.
            </p>
          </section>

          <section className="legal-section">
            <h2>9. Changes to These Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will notify users of significant changes via email or a prominent notice on the Service. Your continued use of the Service after changes constitutes your acceptance of the new terms.
            </p>
          </section>

          <section className="legal-section">
            <h2>10. Contact</h2>
            <p>
              If you have questions about these Terms, please <Link to="/contact" className="legal-link">contact us</Link>.
            </p>
          </section>
        </div>

        <div className="legal-footer-nav">
          <Link to="/privacy" className="legal-nav-link">Privacy Policy</Link>
          <span className="legal-nav-sep">·</span>
          <Link to="/cookies" className="legal-nav-link">Cookie Policy</Link>
          <span className="legal-nav-sep">·</span>
          <Link to="/contact" className="legal-nav-link">Contact Us</Link>
        </div>
      </div>
    </div>
  );
}
