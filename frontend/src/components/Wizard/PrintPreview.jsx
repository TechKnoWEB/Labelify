import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { API_BASE } from '../../lib/api';

export function PrintPreview({ finalData, template, onBack }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [downloaded, setDownloaded] = useState(false);

  const { profile, deductCredits, saveJobHistory } = useAuth();

  const labelCount = finalData.length;
  const creditsRequired = Math.ceil(labelCount / 30);
  const currentCredits = profile?.credits ?? 0;
  const hasEnoughCredits = currentCredits >= creditsRequired;

  async function handleDownload() {
    setIsGenerating(true);
    setErrorMsg(null);

    try {
      // 1. Generate PDF
      const response = await fetch(`${API_BASE}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ labels: finalData }),
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type') ?? '';
        const detail = contentType.includes('application/json')
          ? (await response.json()).error
          : await response.text();
        throw new Error(detail || `Server error ${response.status}`);
      }

      const blob = await response.blob();

      // 2. Deduct credits AFTER successful generation — this must succeed
      const { error: deductError } = await deductCredits(labelCount);
      if (deductError) {
        throw new Error(`Credit deduction failed: ${deductError.message}`);
      }

      // 3. Persist job history (non-blocking — don't fail the download if this errors)
      saveJobHistory({
        templateId:   template?.id   ?? null,
        templateName: template?.name ?? null,
        labelCount,
        creditsUsed:  creditsRequired,
      }).catch((err) => console.warn('Job history save failed:', err));

      // 4. Trigger download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `PeelifyLabs_Labels_${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setDownloaded(true);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="glass" style={{ textAlign: 'center', padding: '4rem' }}>
      {/* Icon */}
      <div style={{
        width: 80, height: 80,
        background: downloaded ? 'rgba(16,185,129,0.12)' : 'rgba(59,130,246,0.1)',
        borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 2rem',
        color: downloaded ? '#34d399' : 'var(--accent-primary)',
        transition: 'all 0.3s',
      }}>
        {downloaded ? (
          <svg style={{ width: 40, height: 40 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg style={{ width: 40, height: 40 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </div>

      <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>
        {downloaded ? 'Download Complete!' : 'Ready to Print!'}
      </h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: 500, margin: '0 auto 2rem' }}>
        {downloaded
          ? `${labelCount} labels downloaded. Your credit balance has been updated.`
          : `${labelCount} labels across ${creditsRequired} credit${creditsRequired !== 1 ? 's' : ''}. Click below to generate your print-ready PDF.`}
      </p>

      {/* Credit cost summary */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '2rem',
        background: 'rgba(0,0,0,0.2)', borderRadius: 12, padding: '1rem 2rem',
        marginBottom: '2rem', flexWrap: 'wrap', justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{labelCount}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Labels</div>
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>→</div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#60a5fa' }}>
            {creditsRequired} <span style={{ fontSize: '1rem', fontWeight: 500 }}>credit{creditsRequired !== 1 ? 's' : ''}</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cost</div>
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>|</div>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '1.75rem', fontWeight: 800,
            color: hasEnoughCredits ? '#34d399' : '#f87171',
          }}>
            {currentCredits}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Balance</div>
        </div>
      </div>

      {/* Insufficient credits warning */}
      {!hasEnoughCredits && (
        <div style={{
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 10, padding: '1rem 1.5rem', marginBottom: '1.5rem',
          color: '#fca5a5', fontSize: '0.9rem', maxWidth: 480, margin: '0 auto 1.5rem',
        }}>
          You need <strong>{creditsRequired} credit{creditsRequired !== 1 ? 's' : ''}</strong> but only have <strong>{currentCredits}</strong>.{' '}
          <Link to="/pricing" style={{ color: '#f87171', fontWeight: 700 }}>Buy more credits →</Link>
        </div>
      )}

      {/* Error message */}
      {errorMsg && (
        <div style={{
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 10, padding: '1rem 1.5rem', marginBottom: '1.5rem',
          color: '#fca5a5', fontSize: '0.9rem', maxWidth: 480, margin: '0 auto 1.5rem',
        }}>
          {errorMsg}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginTop: '1.5rem' }}>
        <button
          className="btn-primary"
          style={{ background: 'transparent', border: '1px solid var(--border-color)', padding: '1rem 2rem' }}
          onClick={onBack}
        >
          ← Make Changes
        </button>
        <button
          className="btn-primary"
          style={{
            padding: '1rem 3rem', fontSize: '1.1rem',
            boxShadow: hasEnoughCredits ? '0 0 30px rgba(59,130,246,0.4)' : 'none',
            opacity: hasEnoughCredits ? 1 : 0.4,
          }}
          onClick={handleDownload}
          disabled={isGenerating || !hasEnoughCredits || downloaded}
        >
          {isGenerating ? 'Generating PDF…' : downloaded ? '✓ Downloaded' : `Download PDF (${creditsRequired} credit${creditsRequired !== 1 ? 's' : ''})`}
        </button>
      </div>

      {/* Printing tips */}
      <div style={{ marginTop: '3rem', padding: '1.5rem', background: 'rgba(0,0,0,0.1)', borderRadius: 12, textAlign: 'left' }}>
        <h4 style={{ marginBottom: '0.75rem', color: 'var(--text-muted)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Printing Tips
        </h4>
        <ul style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.875rem', paddingLeft: '1.25rem', lineHeight: 1.8 }}>
          <li>Set "Scale" to 100% (Actual Size) in your printer dialog.</li>
          <li>Use the correct Avery label sheet for the template you chose.</li>
          <li>Test print on plain paper first to verify alignment.</li>
        </ul>
      </div>
    </div>
  );
}
