import { useState, useEffect, useCallback } from 'react';

// ─── Help content per step ────────────────────────────────────────────────────

const STEPS = [
  {
    step: 1,
    title: 'Step 1 — Choose a Template',
    icon: '🗂️',
    summary: 'Pick the label size that matches your physical label sheets.',
    sections: [
      {
        heading: 'Common Sizes',
        items: [
          { label: 'Avery® 5160', detail: '30 per sheet · 1" × 2-5/8"', tip: false },
          { label: 'Avery® 5163', detail: '10 per sheet · 2" × 4"', tip: false },
          { label: 'Square', detail: '20 per sheet · 2" × 2"', tip: true },
        ],
      },
      {
        heading: 'Best Practices',
        items: [
          { label: 'Match Sheets', detail: 'Find the code on your label packaging.', tip: false },
          { label: 'Testing', detail: 'If unsure, print Step 1 on plain paper first.', tip: true },
        ],
      },
    ],
  },
  {
    step: 2,
    title: 'Step 2 — Design Your Label',
    icon: '🎨',
    summary: 'Add and arrange the fields that will appear on every label.',
    sections: [
      {
        heading: 'Interaction',
        items: [
          { label: 'Select & Style', detail: 'Click a field to change font size, bold, or italics.', tip: false },
          { label: 'Add Beside', detail: 'Place fields side-by-side (e.g. First + Last Name).', tip: true },
        ],
      },
      {
        heading: 'Organization',
        items: [
          { label: 'Reorder', detail: 'Drag fields to swap, or use the move up/down buttons.', tip: false },
          { label: 'Stacking', detail: 'Use Bring to Front for priority rows.', tip: true },
        ],
      },
    ],
  },
  {
    step: 3,
    title: 'Step 3 — Import & Map',
    icon: '📄',
    summary: 'Upload your recipient list and match headers to your design.',
    sections: [
      {
        heading: 'The Data',
        items: [
          { label: 'CSV Only', detail: 'PeelifyLabs reads standard .csv files from Excel/Sheets.', tip: false },
          { label: 'Headers', detail: 'Ensure your first row has clear column names.', tip: true },
        ],
      },
      {
        heading: 'Mapping',
        items: [
          { label: 'Auto-detect', detail: 'PeelifyLabs matches simple names (e.g. "Zip" to "Zip") automatically.', tip: false },
          { label: 'Validation', detail: 'Check the mini table on the right to see your live data.', tip: true },
        ],
      },
    ],
  },
  {
    step: 4,
    title: 'Step 4 — Live Preview',
    icon: '👁️',
    summary: 'Verify every label looks perfect before printing.',
    sections: [
      {
        heading: 'Verification',
        items: [
          { label: 'Dynamic Data', detail: 'The preview shows real names/addresses from your file.', tip: false },
          { label: 'Overflow', detail: 'Watch for text being cut off — reduce font in Step 2 if needed.', tip: true },
        ],
      },
      {
        heading: 'Review',
        items: [
          { label: 'Pagination', detail: 'Click Next/Prev to see all sheets of labels.', tip: false },
          { label: 'Errors', detail: 'Missing data? Go back to Step 3 and re-map headers.', tip: true },
        ],
      },
    ],
  },
  {
    step: 5,
    title: 'Step 5 — Download PDF',
    icon: '🖨️',
    summary: 'Finalize your project and generate a print-ready PDF.',
    sections: [
      {
        heading: 'Printing',
        items: [
          { label: 'Scale 100%', detail: 'Never use "Fit to Page" — it breaks label alignment.', tip: true },
          { label: 'Actual Size', detail: 'Set your print dialog to "Actual Size" for precision.', tip: false },
        ],
      },
      {
        heading: 'Credits',
        items: [
          { label: 'Deduction', detail: '1 credit = 30 labels. Spend only after successful download.', tip: false },
          { label: 'Re-download', detail: 'Each new generation costs credits. Save your PDF locally!', tip: true },
        ],
      },
    ],
  },
];

// ─── Visual Aids (Pure CSS Mockups) ───────────────────────────────────────────

function HelpVisual({ step }) {
  const accent = 'var(--acc-prim, #6366f1)';

  switch (step) {
    case 1:
      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ 
              height: '40px', background: i === 1 ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${i === 1 ? accent : 'rgba(255,255,255,0.08)'}`,
              borderRadius: '4px', position: 'relative'
            }}>
              {i === 1 && <span style={{ position: 'absolute', right: 5, top: 4, fontSize: '0.6rem' }}>✅</span>}
            </div>
          ))}
        </div>
      );
    case 2:
      return (
        <div style={{ 
          margin: '0 auto', width: '130px', height: '160px', 
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px'
        }}>
          <div style={{ height: '24px', background: accent, borderRadius: '4px', opacity: 0.8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem' }}>FIELD 01</div>
          <div style={{ display: 'flex', gap: '4px' }}>
            <div style={{ flex: 1, height: '20px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }} />
            <div style={{ flex: 1, height: '20px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }} />
          </div>
          <div style={{ height: '30px', border: `1px dashed ${accent}`, borderRadius: '4px' }} />
        </div>
      );
    case 3:
      return (
        <div style={{ padding: '10px' }}>
          <div style={{ height: '30px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', padding: '0 8px', marginBottom: '12px' }}>
            <div style={{ width: '12px', height: '12px', background: '#3b82f6', borderRadius: '4px' }} />
            <div style={{ height: '4px', width: '60%', background: 'rgba(255,255,255,0.2)', borderRadius: '2px' }} />
          </div>
          <div style={{ fontSize: '1rem', textAlign: 'center' }}>🔄</div>
          <div style={{ marginTop: '12px', height: '30px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: `1px solid ${accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.6rem', color: accent }}>MATCHED</span>
          </div>
        </div>
      );
    case 4:
      return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
           {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ padding: '8px', background: 'white', borderRadius: '4px', height: '50px' }}>
              <div style={{ height: '6px', background: '#e2e8f0', width: '80%', marginBottom: '4px' }} />
              <div style={{ height: '4px', background: '#f1f5f9', width: '60%' }} />
              <div style={{ height: '4px', background: '#f1f5f9', width: '40%', marginTop: '4px' }} />
            </div>
           ))}
        </div>
      );
    case 5:
      return (
        <div style={{ textAlign: 'center', padding: '10px' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📄</div>
          <div style={{ height: '32px', background: accent, borderRadius: '8px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.75rem' }}>
            DOWNLOAD PDF
          </div>
          <div style={{ marginTop: '8px', fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' }}>Resolution: 300 DPI</div>
        </div>
      );
    default: return null;
  }
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function HelpModal({ currentStep, onClose }) {
  const [activeStep, setActiveStep] = useState(currentStep);

  useEffect(() => { setActiveStep(currentStep); }, [currentStep]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const content = STEPS.find((s) => s.step === activeStep) ?? STEPS[0];

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)',
          zIndex: 1000,
          animation: 'helpFadeIn 0.2s ease',
        }}
      />

      <div
        role="dialog"
        aria-modal="true"
        style={{
          position: 'fixed', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(820px, 94vw)',
          maxHeight: '82vh',
          display: 'flex', flexDirection: 'column',
          background: 'var(--bg-surface, #151921)',
          border: '1px solid var(--border-color, rgba(255,255,255,0.08))',
          borderRadius: 'var(--r-lg, 18px)',
          boxShadow: '0 40px 100px rgba(0,0,0,0.8)',
          zIndex: 1001,
          overflow: 'hidden',
          animation: 'helpSlideUp 0.3s cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        {/* Nav Tabs */}
        <div style={{
          display: 'flex', padding: '1rem 1.5rem',
          borderBottom: '1px solid var(--border-color)',
          background: 'rgba(255,255,255,0.02)',
          gap: '8px', overflowX: 'auto', flexShrink: 0
        }}>
          {STEPS.map((s) => {
            const isActive = s.step === activeStep;
            return (
              <button
                key={s.step}
                onClick={() => setActiveStep(s.step)}
                style={{
                  padding: '10px 16px', borderRadius: '10px',
                  background: isActive ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
                  border: '1px solid',
                  borderColor: isActive ? 'var(--acc-prim)' : 'transparent',
                  color: isActive ? 'var(--acc-prim-lt, #818cf8)' : 'var(--text-muted)',
                  fontSize: '0.85rem', fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap',
                  display: 'flex', alignItems: 'center', gap: '8px'
                }}
              >
                <span>{s.icon}</span>
                <span>Step {s.step}</span>
              </button>
            );
          })}
          <button onClick={onClose} style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
        </div>

        {/* Modal Body */}
        <div style={{ 
          display: 'grid', gridTemplateColumns: '220px 1fr', 
          flex: 1, overflowY: 'hidden'
        }}>
          {/* Visual Pane (Left) */}
          <div style={{ 
            background: 'rgba(255,255,255,0.015)', borderRight: '1px solid var(--border-color)',
            padding: '2.5rem 1.5rem', display: 'flex', flexDirection: 'column', 
            alignItems: 'center', textAlign: 'center'
          }}>
            <div style={{ width: '100%', marginBottom: '2rem' }}>
              <HelpVisual step={activeStep} />
            </div>
            <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--acc-prim)', marginBottom: '0.5rem' }}>Visual Guide</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', lineHeight: 1.5 }}>
              This diagram shows the core focus of Step {activeStep}.
            </p>
          </div>

          {/* Details Pane (Right) */}
          <div style={{ 
            padding: '2.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2rem'
          }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-main)' }}>{content.title}</h2>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.95rem' }}>{content.summary}</p>
            </div>

            {content.sections.map((section, idx) => (
              <div key={idx}>
                <h4 style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '1rem' }}>{section.heading}</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                  {section.items.map((item, i) => (
                    <div key={i} className="action-card" style={{
                      padding: '12px 16px', background: 'rgba(255,255,255,0.03)',
                      borderRadius: '12px', border: '1px solid var(--border-color)',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '1rem',
                      transition: 'transform 0.2s ease'
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.2rem', color: 'var(--text-main)' }}>{item.label}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', lineHeight: 1.5 }}>{item.detail}</div>
                      </div>
                      {item.tip && <span style={{ background: 'var(--acc-prim)', color: 'white', fontSize: '0.65rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>PRO TIP</span>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{ 
          padding: '1.25rem 2rem', borderTop: '1px solid var(--border-color)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'rgba(0,0,0,0.1)', flexShrink: 0
        }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Help v2.1 • Press ESC to close</span>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button 
              disabled={activeStep === 1}
              onClick={() => setActiveStep(s => Math.max(1, s - 1))}
              className="btn-s"
              style={{ padding: '8px 16px', opacity: activeStep === 1 ? 0.3 : 1 }}
            >← Previous</button>
            <button 
              disabled={activeStep === 5}
              onClick={() => setActiveStep(s => Math.min(5, s + 1))}
              className="btn-p"
              style={{ padding: '8px 16px', opacity: activeStep === 5 ? 0.3 : 1 }}
            >Next Step →</button>
          </div>
        </div>

        <style>{`
          .action-card:hover { transform: translateX(4px); border-color: var(--acc-prim) !important; background: rgba(99, 102, 241, 0.05) !important; cursor: default; }
          @keyframes helpFadeIn { from { opacity: 0 } to { opacity: 1 } }
          @keyframes helpSlideUp { from { opacity: 0; transform: translate(-50%, -46%) } to { opacity: 1; transform: translate(-50%, -50%) } }
        `}</style>
      </div>
    </>
  );
}
