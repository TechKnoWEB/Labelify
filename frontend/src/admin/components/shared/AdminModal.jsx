import { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Reusable modal.
 * Props: open, title, onClose, children, footer, size ('md'|'lg')
 */
export default function AdminModal({ open, title, onClose, children, footer, size = 'md' }) {
  useEffect(() => {
    if (!open) return;
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="adm-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`adm-modal ${size === 'lg' ? 'adm-modal--lg' : ''}`} role="dialog" aria-modal="true">
        <div className="adm-modal-header">
          <span className="adm-modal-title">{title}</span>
          <button className="adm-modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="adm-modal-body">{children}</div>
        {footer && <div className="adm-modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
