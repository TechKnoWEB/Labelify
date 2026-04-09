import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import 'altcha';

/**
 * AltchaWidget — wraps the <altcha-widget> Web Component for React.
 * Uses test mode: fully self-contained, no server or API key required.
 *
 * Props:
 *   onVerified() — called when ALTCHA completes successfully
 *   onReset()    — called when the widget state goes back to unverified/error
 *
 * Ref methods:
 *   reset() — programmatically reset the widget (e.g. after a failed login)
 */
const AltchaWidget = forwardRef(function AltchaWidget({ onVerified, onReset }, ref) {
  const widgetRef = useRef(null);

  useImperativeHandle(ref, () => ({
    reset() {
      const el = widgetRef.current;
      if (el && typeof el.reset === 'function') el.reset();
    },
  }));

  useEffect(() => {
    const el = widgetRef.current;
    if (!el) return;

    function handleStateChange(ev) {
      if (!('detail' in ev)) return;
      const { state, payload } = ev.detail;
      if (state === 'verified' && payload) {
        onVerified?.();
      } else if (state === 'unverified' || state === 'error') {
        onReset?.();
      }
    }

    el.addEventListener('statechange', handleStateChange);
    return () => el.removeEventListener('statechange', handleStateChange);
  }, [onVerified, onReset]);

  return (
    <altcha-widget
      ref={widgetRef}
      configuration={JSON.stringify({ test: true })}
      hidelogo
      hidefooter
      style={{
        '--altcha-color-border': 'transparent',
        '--altcha-color-border-focus': '#3b82f6',
        '--altcha-color-footer-bg': 'transparent',
      }}
    />
  );
});

export default AltchaWidget;
