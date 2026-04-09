import { ArrowRight, CheckCircle2, Coins, FileOutput, LayoutTemplate, PencilRuler, Shield, Upload, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/** Convert a 6-digit hex color to an rgba() string. */
function hexRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

const features = [
  {
    icon: LayoutTemplate,
    title: 'Avery-Compatible Templates',
    desc: 'Industry-standard Avery 5160, 5163 and custom sizes — print on any sheet you already own.',
    accent: '#6366f1',
  },
  {
    icon: Upload,
    title: 'Bulk CSV Import',
    desc: 'Upload thousands of addresses at once. Auto-map columns and generate every label in seconds.',
    accent: '#8b5cf6',
  },
  {
    icon: PencilRuler,
    title: 'WYSIWYG Editor',
    desc: 'Drag fields, adjust font sizes and styles live on a pixel-accurate canvas preview.',
    accent: '#0ea5e9',
  },
  {
    icon: FileOutput,
    title: 'Print-Ready PDF',
    desc: 'Download precision-laid-out PDFs. 30 labels per sheet, zero margin guesswork.',
    accent: '#10b981',
  },
  {
    icon: Coins,
    title: 'Credit System',
    desc: 'Pay only for what you use. Credits never expire — buy once, print whenever.',
    accent: '#f59e0b',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    desc: 'From upload to download in under 10 seconds. No software to install, ever.',
    accent: '#ef4444',
  },
];

const packs = [
  { name: 'Starter', credits: 25,   price: '1.99',  labels: '750',    perCredit: '0.08',  color: '#6366f1', popular: false },
  { name: 'Value',   credits: 100,  price: '5.99',  labels: '3,000',  perCredit: '0.06',  color: '#8b5cf6', popular: true  },
  { name: 'Bulk',    credits: 300,  price: '12.99', labels: '9,000',  perCredit: '0.043', color: '#4f46e5', popular: false },
  { name: 'Power',   credits: 1000, price: '34.99', labels: '30,000', perCredit: '0.035', color: '#7c3aed', popular: false },
];

const steps = [
  { num: '01', title: 'Pick a Template', desc: 'Choose from Avery standards or custom sizes.' },
  { num: '02', title: 'Design Your Label', desc: 'Arrange fields on the live canvas editor.' },
  { num: '03', title: 'Import Your Data', desc: 'Upload CSV and map columns in seconds.' },
  { num: '04', title: 'Download & Print', desc: 'Get your print-ready PDF instantly.' },
];

const trustPoints = [
  'No subscription required',
  'Credits never expire',
  'First 30 labels free',
];

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="lp">

      {/* ── HERO ─────────────────────────────────── */}
      <section className="lp-hero">
        {/* Ambient blobs */}
        <div className="lp-blob lp-blob-1" />
        <div className="lp-blob lp-blob-2" />
        <div className="lp-blob lp-blob-3" />

        <div className="lp-hero-inner">
          {/* Left column */}
          <div className="lp-hero-copy">
            <div className="lp-eyebrow">
              <span className="lp-eyebrow-dot" />
              Address label generator
            </div>

            <h1 className="lp-h1">
              Print labels<br />
              <span className="lp-h1-accent">from any CSV</span><br />
              in&nbsp;seconds.
            </h1>

            <p className="lp-lead">
              Upload a spreadsheet, design your layout on a live canvas,
              download a print-ready PDF — no software, no subscriptions.
            </p>

            <div className="lp-trust-row">
              {trustPoints.map(t => (
                <span key={t} className="lp-trust-item">
                  <CheckCircle2 size={14} className="lp-trust-icon" />
                  {t}
                </span>
              ))}
            </div>

            <div className="lp-cta-row">
              {user ? (
                <Link to="/app" className="lp-btn-primary">
                  Open Dashboard <ArrowRight size={16} />
                </Link>
              ) : (
                <>
                  <Link to="/auth?tab=signup" className="lp-btn-primary">
                    Start for Free <ArrowRight size={16} />
                  </Link>
                  <Link to="/pricing" className="lp-btn-ghost">View Pricing</Link>
                </>
              )}
            </div>
          </div>

          {/* Right column — mock app preview */}
          <div className="lp-preview glass">
            <div className="lp-preview-bar">
              <span className="lp-dot lp-dot-r" />
              <span className="lp-dot lp-dot-y" />
              <span className="lp-dot lp-dot-g" />
              <span className="lp-preview-title">PeelifyLabs — Label Preview</span>
            </div>
            <div className="lp-preview-body">
              <div className="lp-label-sheet">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="lp-label">
                    <div className="lp-label-line lp-label-line--bold" />
                    <div className="lp-label-line" style={{ width: '82%' }} />
                    <div className="lp-label-line" style={{ width: '62%' }} />
                  </div>
                ))}
              </div>
              <div className="lp-preview-footer">
                <span className="lp-preview-tag">Avery 5160 · 30 labels/sheet</span>
                <span className="lp-preview-ready">PDF Ready ✓</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────── */}
      <section className="lp-section">
        <div className="lp-section-head">
          <p className="lp-tag">Simple by design</p>
          <h2 className="lp-h2">Four steps to perfect labels</h2>
        </div>

        <div className="lp-steps">
          {steps.map((s, i) => (
            <div key={s.num} className="lp-step glass-panel">
              <div className="lp-step-num">{s.num}</div>
              {i < steps.length - 1 && <div className="lp-step-arrow" />}
              <h3 className="lp-step-title">{s.title}</h3>
              <p className="lp-step-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────── */}
      <section className="lp-section lp-section--alt">
        <div className="lp-section-head">
          <p className="lp-tag">Everything you need</p>
          <h2 className="lp-h2">Built for real printing workflows</h2>
          <p className="lp-section-sub">
            Every tool you need, nothing you don't. Works entirely in the browser.
          </p>
        </div>

        <div className="lp-features">
          {features.map(f => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="lp-feature glass-panel">
                <div className="lp-feature-icon" style={{ '--feat-color': f.accent, '--feat-icon-bg': hexRgba(f.accent, 0.15), '--feat-icon-border': hexRgba(f.accent, 0.3) }}>
                  <Icon size={22} strokeWidth={2} />
                </div>
                <h3 className="lp-feature-title">{f.title}</h3>
                <p className="lp-feature-desc">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────── */}
      <section className="lp-section">
        <div className="lp-section-head">
          <p className="lp-tag">Simple pricing</p>
          <h2 className="lp-h2">Credits that never expire</h2>
          <p className="lp-section-sub">One-time purchase. Use whenever you need. No subscriptions.</p>
        </div>

        <div className="lp-pricing">
          {packs.map(pack => (
            <div
              key={pack.name}
              className={`lp-pack glass-panel${pack.popular ? ' lp-pack--hot' : ''}`}
              style={{ '--pack-clr': pack.color }}
            >
              {pack.popular && <div className="lp-pack-badge">Most Popular</div>}
              <div className="lp-pack-name" style={{ color: pack.color }}>{pack.name}</div>
              <div className="lp-pack-price">
                <span className="lp-pack-currency">$</span>
                <span className="lp-pack-amount">{pack.price}</span>
              </div>
              <div className="lp-pack-credits">{pack.credits} credits</div>
              <div className="lp-pack-labels">{pack.labels} labels</div>
              <div className="lp-pack-rate">${pack.perCredit} / credit</div>
              <Link
                to={user ? '/pricing' : '/auth?tab=signup'}
                className="lp-pack-btn"
                style={{ background: `linear-gradient(135deg, ${pack.color}, ${pack.color}cc)` }}
              >
                {user ? 'Buy Now' : 'Get Started'}
              </Link>
            </div>
          ))}
        </div>

        <div className="lp-pricing-more">
          <Link to="/pricing" className="lp-btn-ghost">See full pricing details →</Link>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────── */}
      <section className="lp-cta">
        <div className="lp-cta-blob" />
        <div className="lp-cta-inner glass-panel">
          <h2 className="lp-cta-title">Ready to print smarter?</h2>
          <p className="lp-cta-sub">
            Join thousands of sellers and offices using PeelifyLabs every day.
          </p>
          <div className="lp-cta-row">
            {user ? (
              <Link to="/app" className="lp-btn-primary">
                Open Dashboard <ArrowRight size={16} />
              </Link>
            ) : (
              <Link to="/auth?tab=signup" className="lp-btn-primary">
                Create Free Account <ArrowRight size={16} />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ── LEGAL LINKS ──────────────────────────── */}
      <div className="lp-legal-bar">
        <Shield size={13} className="lp-legal-icon" />
        <Link to="/terms">Terms of Service</Link>
        <span className="lp-legal-sep">·</span>
        <Link to="/privacy">Privacy Policy</Link>
        <span className="lp-legal-sep">·</span>
        <Link to="/cookies">Cookie Policy</Link>
        <span className="lp-legal-sep">·</span>
        <Link to="/contact">Contact Us</Link>
      </div>

    </div>
  );
}
