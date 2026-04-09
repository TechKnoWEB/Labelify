import React from 'react';

const steps = [
  { id: 1, name: 'Template', description: 'Choose your labels' },
  { id: 2, name: 'Design', description: 'Customize your layout' },
  { id: 3, name: 'Import', description: 'Mail merge addresses' },
  { id: 4, name: 'Preview', description: 'Review labels' },
  { id: 5, name: 'Download', description: 'Generate & download' }
];

export function StepIndicator({ currentStep }) {
  return (
    <div className="wizard-stepper" style={{ marginBottom: '3rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
        {/* Progress Bar Background */}
        <div style={{ 
          position: 'absolute', 
          top: '24px', 
          left: '0', 
          right: '0', 
          height: '2px', 
          background: 'rgba(255,255,255,0.1)', 
          zIndex: 0 
        }} />
        
        {/* Active Progress Bar */}
        <div style={{ 
          position: 'absolute', 
          top: '24px', 
          left: '0', 
          width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`, 
          height: '2px', 
          background: 'var(--accent-primary)', 
          boxShadow: '0 0 10px var(--accent-primary)',
          transition: 'width 0.4s ease-in-out',
          zIndex: 0 
        }} />

        {steps.map((step) => (
          <div key={step.id} style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '80px' }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '50%', 
              background: currentStep >= step.id ? 'var(--accent-primary)' : 'var(--bg-dark)', 
              border: `2px solid ${currentStep >= step.id ? 'var(--accent-primary)' : 'var(--border-color)'}`,
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              transition: 'all 0.3s ease',
              boxShadow: currentStep === step.id ? '0 0 20px rgba(59, 130, 246, 0.5)' : 'none'
            }}>
              {currentStep > step.id ? '✓' : step.id}
            </div>
            <div style={{ marginTop: '0.75rem', textAlign: 'center' }}>
              <div style={{ 
                fontSize: '0.875rem', 
                fontWeight: currentStep >= step.id ? 700 : 500,
                color: currentStep >= step.id ? 'white' : 'var(--text-muted)'
              }}>
                {step.name}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
