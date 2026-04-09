import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MessageSquare, Clock } from 'lucide-react';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState(null); // null | 'sending' | 'sent' | 'error'

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('sending');
    // TODO: wire up to actual email/support backend
    await new Promise(r => setTimeout(r, 800));
    setStatus('sent');
    setForm({ name: '', email: '', subject: '', message: '' });
  }

  return (
    <div className="legal-page">
      <div className="legal-container legal-container--contact">
        <div className="legal-header">
          <p className="lp-tag">Support</p>
          <h1 className="legal-title">Contact Us</h1>
          <p className="legal-meta">We typically respond within 24 hours on business days.</p>
        </div>

        <div className="contact-grid">
          {/* Info cards */}
          <div className="contact-info">
            <div className="contact-card glass-panel">
              <div className="contact-card-icon"><Mail size={20} /></div>
              <h3>Email</h3>
              <p>support@peelify.com</p>
            </div>
            <div className="contact-card glass-panel">
              <div className="contact-card-icon"><MessageSquare size={20} /></div>
              <h3>Feedback</h3>
              <p>Feature requests and bug reports are always welcome.</p>
            </div>
            <div className="contact-card glass-panel">
              <div className="contact-card-icon"><Clock size={20} /></div>
              <h3>Response Time</h3>
              <p>Mon–Fri, within 24 hours. We read every message.</p>
            </div>
          </div>

          {/* Contact form */}
          <form className="contact-form glass-panel" onSubmit={handleSubmit}>
            {status === 'sent' ? (
              <div className="contact-success">
                <p className="contact-success-icon">✓</p>
                <h3>Message sent!</h3>
                <p>Thanks for reaching out. We'll get back to you shortly.</p>
                <button
                  type="button"
                  className="lp-btn-ghost"
                  onClick={() => setStatus(null)}
                >
                  Send another message
                </button>
              </div>
            ) : (
              <>
                <div className="contact-row">
                  <div className="contact-field">
                    <label htmlFor="contact-name">Name</label>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      placeholder="Your name"
                      value={form.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="contact-field">
                    <label htmlFor="contact-email">Email</label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="contact-field">
                  <label htmlFor="contact-subject">Subject</label>
                  <select
                    id="contact-subject"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a topic…</option>
                    <option value="billing">Billing / Credits</option>
                    <option value="bug">Bug Report</option>
                    <option value="feature">Feature Request</option>
                    <option value="account">Account Help</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="contact-field">
                  <label htmlFor="contact-message">Message</label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={6}
                    placeholder="Describe your issue or question in detail…"
                    value={form.message}
                    onChange={handleChange}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="lp-btn-primary"
                  disabled={status === 'sending'}
                >
                  {status === 'sending' ? 'Sending…' : 'Send Message'}
                </button>
              </>
            )}
          </form>
        </div>

        <div className="legal-footer-nav">
          <Link to="/terms" className="legal-nav-link">Terms of Service</Link>
          <span className="legal-nav-sep">·</span>
          <Link to="/privacy" className="legal-nav-link">Privacy Policy</Link>
          <span className="legal-nav-sep">·</span>
          <Link to="/cookies" className="legal-nav-link">Cookie Policy</Link>
        </div>
      </div>
    </div>
  );
}
