// EditorPage.jsx
import './EditorPage.css';
import { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { StepIndicator } from '../components/Wizard/StepIndicator';
import { TemplateSelector } from '../components/Wizard/TemplateSelector';
import { CanvasStudio } from '../components/Wizard/CanvasStudio';
import { DataImport } from '../components/Wizard/DataImport';
import { LabelPreview } from '../components/Wizard/LabelPreview';
import { PrintPreview } from '../components/Wizard/PrintPreview';
import { HelpModal } from '../components/Wizard/HelpModal';

// ─── Constants ────────────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: 'Template',   icon: '⊞', description: 'Choose your label template'   },
  { id: 2, label: 'Design',     icon: '✏', description: 'Customize fields & layout'    },
  { id: 3, label: 'Import',     icon: '⇪', description: 'Upload your data'             },
  { id: 4, label: 'Preview',    icon: '◉', description: 'Review your labels'           },
  { id: 5, label: 'Print',      icon: '⎙', description: 'Print or export'             },
];

const CREDIT_THRESHOLD_LOW  = 5;
const CREDIT_THRESHOLD_WARN = 20;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getCreditStatus(credits) {
  if (credits < CREDIT_THRESHOLD_LOW)  return 'critical';
  if (credits < CREDIT_THRESHOLD_WARN) return 'warning';
  return 'healthy';
}

function transformCsvData(csvData, editorFields, editorRows, mappings) {
  // Build _rows schema once — shared across all labels to keep payload small
  const rowSchema = editorRows.map((rowGroup) =>
    rowGroup.map((f) => ({
      key:        f.content,
      fontSize:   f.fontSize,
      fontFamily: f.fontFamily || 'Arial, sans-serif',
      bold:       f.bold,
      italic:     f.italic,
    }))
  );

  return csvData.rows.map((row) => {
    const labelInstance = { _rows: rowSchema };
    editorFields.forEach((field) => {
      const mappedHeader = mappings[field.id];
      const headerIndex  = csvData.headers.indexOf(mappedHeader);
      labelInstance[field.content] = headerIndex !== -1 ? row[headerIndex] : '';
    });
    return labelInstance;
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Slim alert banner */
function AlertBanner({ type = 'warning', children }) {
  return (
    <div className={`alert-banner alert-banner--${type}`} role="alert">
      <span className="alert-banner__icon" aria-hidden="true">
        {type === 'warning' ? '⚠️' : 'ℹ️'}
      </span>
      <span className="alert-banner__text">{children}</span>
    </div>
  );
}


/** Help trigger button */
function HelpButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="help-btn"
      aria-label="Open help guide"
      title="Help & Guide"
    >
      <span aria-hidden="true">?</span>
    </button>
  );
}

/** Step breadcrumb trail (clickable back navigation) */
function StepBreadcrumb({ steps, currentStep, onNavigate }) {
  return (
    <nav className="step-breadcrumb" aria-label="Wizard progress">
      <ol className="step-breadcrumb__list">
        {steps.map((step, idx) => {
          const isCompleted = step.id < currentStep;
          const isCurrent   = step.id === currentStep;
          const canClick    = isCompleted; // only allow going back

          return (
            <li key={step.id} className="step-breadcrumb__item">
              <button
                className={[
                  'step-breadcrumb__btn',
                  isCurrent   ? 'step-breadcrumb__btn--current'   : '',
                  isCompleted ? 'step-breadcrumb__btn--completed'  : '',
                  !canClick && !isCurrent ? 'step-breadcrumb__btn--locked' : '',
                ].join(' ')}
                onClick={() => canClick && onNavigate(step.id)}
                disabled={!canClick && !isCurrent}
                aria-current={isCurrent ? 'step' : undefined}
                aria-label={`${step.label}${isCompleted ? ' (completed)' : ''}`}
              >
                <span className="step-breadcrumb__icon" aria-hidden="true">
                  {isCompleted ? '✓' : step.icon}
                </span>
                <span className="step-breadcrumb__label">{step.label}</span>
              </button>

              {/* Connector line (not after last) */}
              {idx < steps.length - 1 && (
                <span
                  className={`step-breadcrumb__connector ${isCompleted ? 'step-breadcrumb__connector--done' : ''}`}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function EditorPage() {
  const { profile } = useAuth();

  const [currentStep,        setCurrentStep]        = useState(1);
  const [selectedTemplate,   setSelectedTemplate]   = useState(null); // full template object
  const [editorFields,       setEditorFields]       = useState([]);
  const [editorRows,         setEditorRows]         = useState([]);
  const [finalData,          setFinalData]          = useState([]);
  const [helpOpen,           setHelpOpen]           = useState(false);
  const [isTransitioning,    setIsTransitioning]    = useState(false);

  const credits         = profile?.credits ?? 0;
  const creditStatus    = getCreditStatus(credits);
  const currentStepMeta = STEPS.find((s) => s.id === currentStep);
  const selectedTemplateId = selectedTemplate?.id ?? null;

  // ── Smooth step transition ──
  const goToStep = useCallback((nextStep) => {
    if (nextStep === currentStep) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentStep(nextStep);
      setIsTransitioning(false);
    }, 180);
  }, [currentStep]);

  // ── Wizard handlers ──
  const handleTemplateSelect = useCallback((template) => {
    setSelectedTemplate(template);
    goToStep(2);
  }, [goToStep]);

  const handleEditorSave = useCallback((fields, rows) => {
    setEditorFields(fields);
    setEditorRows(rows);
    goToStep(3);
  }, [goToStep]);

  const handleDataImportComplete = useCallback((csvData, mappings) => {
    setFinalData(transformCsvData(csvData, editorFields, editorRows, mappings));
    goToStep(4);
  }, [editorFields, editorRows, goToStep]);

  // ── Keyboard shortcut: "H" opens help ──
  useEffect(() => {
    function onKey(e) {
      if (e.key === '?' && !helpOpen) setHelpOpen(true);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [helpOpen]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [currentStep]);

  return (
    <>
      <div className="dashboard-page">

        {/* ── Alerts ── */}
        {creditStatus === 'critical' && (
          <AlertBanner type="warning">
            You have fewer than {CREDIT_THRESHOLD_LOW} credits left.{' '}
            <Link to="/pricing" className="alert-link">Top up now →</Link>
          </AlertBanner>
        )}
        {creditStatus === 'warning' && (
          <AlertBanner type="info">
            Credits are running low.{' '}
            <Link to="/pricing" className="alert-link">Add more →</Link>
          </AlertBanner>
        )}

        {/* ── Wizard Shell ── */}
        <div className="wizard-shell">

          {/* Sticky wizard nav */}
          <div className="wizard-nav glass-panel--subtle">
            <StepBreadcrumb
              steps={STEPS}
              currentStep={currentStep}
              onNavigate={goToStep}
            />
            <HelpButton onClick={() => setHelpOpen(true)} />
          </div>

          {/* Step content */}
          <main
            id="wizard-main"
            className={`wizard-content ${isTransitioning ? 'wizard-content--exit' : 'wizard-content--enter'}`}
            aria-live="polite"
          >
            {currentStep === 1 && (
              <TemplateSelector
                onSelect={handleTemplateSelect}
                selectedId={selectedTemplateId}
              />
            )}
            {currentStep === 2 && (
              <CanvasStudio
                onSave={handleEditorSave}
                onBack={() => goToStep(1)}
              />
            )}
            {currentStep === 3 && (
              <DataImport
                editorFields={editorFields}
                onComplete={handleDataImportComplete}
                onBack={() => goToStep(2)}
              />
            )}
            {currentStep === 4 && (
              <LabelPreview
                finalData={finalData}
                editorFields={editorFields}
                template={selectedTemplate}
                onBack={() => goToStep(3)}
                onConfirm={() => goToStep(5)}
              />
            )}
            {currentStep === 5 && (
              <PrintPreview
                finalData={finalData}
                template={selectedTemplate}
                onBack={() => goToStep(4)}
              />
            )}
          </main>

        </div>

      </div>

      {/* ── Help Modal (outside stacking context) ── */}
      {helpOpen && (
        <HelpModal
          currentStep={currentStep}
          stepMeta={currentStepMeta}
          onClose={() => setHelpOpen(false)}
        />
      )}
    </>
  );
}
