import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { API_BASE } from '../lib/api';

// amountPaise: price in Indian paise (e.g. ₹199 → 19900). Update these to your
// actual INR selling prices once you decide on local pricing.
const packs = [
  {
    id: 'starter',
    name: 'Starter',
    credits: 25,
    price: '1.99',
    amountPaise: 19900,
    labels: '750',
    perCredit: '0.080',
    saving: null,
    color: '#6366f1',
    popular: false,
    best: 'Best for one-off projects or trying it out',
  },
  {
    id: 'value',
    name: 'Value',
    credits: 100,
    price: '5.99',
    amountPaise: 59900,
    labels: '3,000',
    perCredit: '0.060',
    saving: 'Save 25%',
    color: '#8b5cf6',
    popular: true,
    best: 'Best for occasional users and seasonal printing',
  },
  {
    id: 'bulk',
    name: 'Bulk',
    credits: 300,
    price: '12.99',
    amountPaise: 129900,
    labels: '9,000',
    perCredit: '0.043',
    saving: 'Save 46%',
    color: '#4f46e5',
    popular: false,
    best: 'Best for small businesses and regular label runs',
  },
  {
    id: 'power',
    name: 'Power',
    credits: 1000,
    price: '34.99',
    amountPaise: 349900,
    labels: '30,000',
    perCredit: '0.035',
    saving: 'Save 56%',
    color: '#7c3aed',
    popular: false,
    best: 'Best for e-commerce sellers and high-volume printing',
  },
];

const faqs = [
  {
    q: 'Do credits expire?',
    a: 'Never. Credits are yours until you use them — no subscription, no monthly resets.',
  },
  {
    q: 'How many labels does 1 credit make?',
    a: '1 credit = 30 labels. A 100-credit Value Pack = 3,000 labels.',
  },
  {
    q: 'Can I buy multiple packs?',
    a: 'Yes. Credits are additive — buy any pack at any time and they stack in your balance.',
  },
  {
    q: 'What payment methods are supported?',
    a: 'We accept all major credit/debit cards and UPI via Razorpay.',
  },
  {
    q: 'Is there a free trial?',
    a: 'Yes — every new account gets 1 free credit (30 labels) to try the full workflow.',
  },
];

export default function PricingPage() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [purchasing, setPurchasing] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);

  async function handlePurchase(pack) {
    if (!user) {
      navigate('/auth?tab=signup');
      return;
    }

    setPurchasing(pack.id);
    setSuccessMsg(null);

    try {
      // 1. Create a Razorpay order on the backend
      const orderRes = await fetch(`${API_BASE}/api/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packId: pack.id, amount: pack.amountPaise }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || 'Failed to create order');

      // 2. Open Razorpay checkout modal
      await new Promise((resolve, reject) => {
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'PeelifyLabs',
          description: `${pack.name} Pack — ${pack.credits} credits`,
          order_id: orderData.orderId,
          prefill: { email: user.email },
          theme: { color: pack.color },
          handler: async (response) => {
            try {
              // 3. Verify payment signature on the backend and add credits
              const verifyRes = await fetch(`${API_BASE}/api/verify-payment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_order_id:   response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature:  response.razorpay_signature,
                  userId:  user.id,
                  credits: pack.credits,
                }),
              });
              const verifyData = await verifyRes.json();
              if (!verifyRes.ok) throw new Error(verifyData.error || 'Verification failed');
              resolve();
            } catch (err) {
              reject(err);
            }
          },
          modal: {
            ondismiss: () => reject(new Error('Payment cancelled')),
          },
        };

        if (!window.Razorpay) {
          reject(new Error('Razorpay SDK not loaded. Please refresh and try again.'));
          return;
        }
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', (resp) => reject(new Error(resp.error.description)));
        rzp.open();
      });

      await refreshProfile();
      setSuccessMsg(`${pack.credits} credits added to your account!`);
    } catch (err) {
      if (err.message !== 'Payment cancelled') {
        alert('Purchase failed: ' + err.message);
      }
    } finally {
      setPurchasing(null);
    }
  }

  return (
    <div className="pricing-page">
      <div className="auth-glow auth-glow-1" />
      <div className="auth-glow auth-glow-2" />

      {/* Header */}
      <div className="section-header" style={{ paddingTop: '3rem' }}>
        <p className="section-tag">Simple, transparent pricing</p>
        <h1 className="section-title">Credits that never expire</h1>
        <p className="section-subtitle">
          One-time purchase. No monthly fees. Use whenever you need.
        </p>
      </div>

      {/* Current balance */}
      {user && (
        <div className="balance-banner glass">
          <span className="balance-label">Your current balance</span>
          <span className="balance-amount">
            <span className="credit-icon-lg">◆</span>
            {profile?.credits ?? 0} credits
          </span>
          <span className="balance-sub">= {(profile?.credits ?? 0) * 30} labels available</span>
        </div>
      )}

      {successMsg && (
        <div className="auth-message auth-message-success" style={{ maxWidth: 600, margin: '0 auto 2rem' }}>
          ✓ {successMsg}
        </div>
      )}

      {/* Packs grid */}
      <div className="pricing-grid pricing-grid-full">
        {packs.map((pack) => (
          <div
            key={pack.id}
            className={`pricing-card glass-panel ${pack.popular ? 'pricing-popular' : ''}`}
            style={{ '--pack-color': pack.color }}
          >
            {pack.popular && <div className="popular-badge">Most Popular</div>}

            <div className="pack-name" style={{ color: pack.color }}>{pack.name} Pack</div>
            <div className="pack-best">{pack.best}</div>

            <div className="pack-price-block">
              <span className="price-currency">$</span>
              <span className="price-amount">{pack.price}</span>
              <span className="price-once">one-time</span>
            </div>

            <div className="pack-divider" style={{ background: pack.color }} />

            <ul className="pack-features">
              <li><span style={{ color: pack.color }}>◆</span> {pack.credits} credits</li>
              <li><span style={{ color: pack.color }}>◆</span> {pack.labels} labels</li>
              <li><span style={{ color: pack.color }}>◆</span> ${pack.perCredit} per credit
                {pack.saving && <span className="saving-tag">{pack.saving}</span>}
              </li>
              <li><span style={{ color: pack.color }}>◆</span> Credits never expire</li>
              <li><span style={{ color: pack.color }}>◆</span> All templates included</li>
            </ul>

            <button
              className="btn-p btn-block"
              style={{ background: `linear-gradient(135deg, ${pack.color} 0%, ${pack.color}bb 100%)` }}
              onClick={() => handlePurchase(pack)}
              disabled={purchasing === pack.id}
            >
              {purchasing === pack.id
                ? 'Processing…'
                : user
                ? `Buy ${pack.name} Pack →`
                : 'Sign Up to Buy →'}
            </button>
          </div>
        ))}
      </div>

      {/* Credit usage table */}
      <div className="usage-table-wrap glass-panel">
        <h3 className="usage-title">Credit usage reference</h3>
        <table className="usage-table">
          <thead>
            <tr>
              <th>Pack</th>
              <th>Credits</th>
              <th>Labels</th>
              <th>Price</th>
              <th>Per Credit</th>
              <th>Savings vs Starter</th>
            </tr>
          </thead>
          <tbody>
            {packs.map((p) => (
              <tr key={p.id} className={p.popular ? 'usage-row-popular' : ''}>
                <td style={{ color: p.color, fontWeight: 700 }}>{p.name}</td>
                <td>{p.credits}</td>
                <td>{p.labels}</td>
                <td>${p.price}</td>
                <td>${p.perCredit}</td>
                <td>{p.saving ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* FAQ */}
      <div style={{ maxWidth: 720, margin: '0 auto 4rem' }}>
        <h2 className="section-title" style={{ marginBottom: '2rem', textAlign: 'center' }}>Frequently asked questions</h2>
        {faqs.map((faq, i) => (
          <div key={i} className={`faq-item glass ${openFaq === i ? 'faq-open' : ''}`}>
            <button className="faq-question" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
              <span>{faq.q}</span>
              <span className="faq-arrow">{openFaq === i ? '▲' : '▼'}</span>
            </button>
            {openFaq === i && <p className="faq-answer">{faq.a}</p>}
          </div>
        ))}
      </div>

      {/* CTA */}
      {!user && (
        <div className="cta-section glass" style={{ marginBottom: '4rem' }}>
          <h2 className="cta-title">Start with 1 free credit</h2>
          <p className="cta-sub">No payment required to sign up. Print your first 30 labels free.</p>
          <Link to="/auth?tab=signup" className="btn-p btn-lg">Create Free Account →</Link>
        </div>
      )}
    </div>
  );
}
