import { useState } from 'react';

// ─── Sheet layout lookup ──────────────────────────────────────────────────────
// Maps perSheet → [cols, rows] based on real Avery grid patterns.
// The label aspect ratio is derived from the template.size string.
const PER_SHEET_GRID = {
  1:  [1, 1],
  2:  [1, 2],
  4:  [2, 2],
  5:  [1, 5],
  6:  [2, 3],
  8:  [2, 4],
  10: [2, 5],
  12: [3, 4],
  14: [2, 7],
  15: [3, 5],
  18: [3, 6],
  20: [4, 5],
  21: [3, 7],
  30: [3, 10],
  33: [3, 11],
  60: [4, 15],
  80: [4, 20],
};

function getGrid(template) {
  if (!template) return { cols: 3, rows: 10 }; // default Avery 5160
  const perSheet = template.perSheet ?? 30;
  const entry = PER_SHEET_GRID[perSheet];
  if (entry) return { cols: entry[0], rows: entry[1] };
  // Fallback: best-fit square-ish grid
  const cols = Math.round(Math.sqrt(perSheet));
  return { cols, rows: Math.ceil(perSheet / cols) };
}

// Parse "W x H" from size string, returns aspect ratio W/H (width-to-height).
function getLabelAspectRatio(template) {
  if (!template?.size) return 2.625; // Avery 5160 default
  const m = template.size.match(/^[\d.\-/]+["″]?\s*x\s*([\d.\-/]+)/i);
  if (!m) return 2.625;
  // Parse possible fraction like "2-5/8"
  const parseFrac = (s) => {
    const parts = s.trim().split('-');
    if (parts.length === 2) {
      const whole = parseFloat(parts[0]);
      const [n, d] = parts[1].split('/').map(Number);
      return whole + n / d;
    }
    const [n, d] = s.split('/').map(Number);
    return d ? n / d : parseFloat(s);
  };
  // width is before x, height is after
  const rawW = template.size.split(/\s*x\s*/i)[0].replace(/[^0-9.\-/]/g, '');
  const rawH = m[1].replace(/[^0-9.\-/]/g, '');
  const w = parseFrac(rawW);
  const h = parseFrac(rawH);
  if (!w || !h) return 2.625;
  return w / h;
}

// ─── Preview sheet component ──────────────────────────────────────────────────
const SHEET_PREVIEW_W = 520; // px — scaled page width

function SheetPreview({ pageLabels, template, pageIndex, totalPages }) {
  const { cols, rows } = getGrid(template);
  const perSheet = template?.perSheet ?? 30;

  // Sheet is Letter 8.5×11, preview width is fixed, height scales proportionally
  const sheetAspect = 11 / 8.5;
  const sheetH = Math.round(SHEET_PREVIEW_W * sheetAspect);

  // Padding inside the sheet preview (scaled from ~0.5in on real sheet)
  const padX = Math.round(SHEET_PREVIEW_W * 0.035);
  const padY = Math.round(sheetH * 0.03);

  const gridW = SHEET_PREVIEW_W - padX * 2;
  const gridH = sheetH - padY * 2;

  const cellW = Math.floor(gridW / cols);
  const cellH = Math.floor(gridH / rows);

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      {totalPages > 1 && (
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textAlign: 'center' }}>
          Sheet {pageIndex + 1} of {totalPages}
        </p>
      )}
      <div style={{
        width: SHEET_PREVIEW_W,
        height: sheetH,
        background: '#f8fafc',
        border: '1px solid #cbd5e1',
        borderRadius: '4px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.35)',
        position: 'relative',
        overflow: 'hidden',
        margin: '0 auto',
      }}>
        {/* Grid of label cells */}
        <div style={{
          position: 'absolute',
          top: padY,
          left: padX,
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, ${cellW}px)`,
          gridTemplateRows: `repeat(${rows}, ${cellH}px)`,
          gap: '0px',
        }}>
          {Array.from({ length: perSheet }).map((_, slotIdx) => {
            const label = pageLabels[slotIdx];
            return (
              <div
                key={slotIdx}
                style={{
                  width: cellW,
                  height: cellH,
                  border: '0.5px dashed rgba(100,116,139,0.35)',
                  boxSizing: 'border-box',
                  background: label ? 'white' : 'rgba(248,250,252,0.6)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  padding: '4px 6px',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                {label ? (
                  <>
                    <span style={{
                      position: 'absolute',
                      top: 2,
                      right: 4,
                      fontSize: '7px',
                      color: '#94a3b8',
                      lineHeight: 1,
                    }}>
                      #{slotIdx + 1}
                    </span>
                    {(label._rows || []).map((rowGroup, rIdx) => (
                      <div key={rIdx} style={{ display: 'flex', gap: '2px', overflow: 'hidden', lineHeight: 1.15 }}>
                        {rowGroup.map((field, fIdx) => {
                          const value = label[field.key];
                          const fs = parseFloat(field.fontSize) || 10;
                          // Scale font size down proportionally (sheet preview is ~61% of 8.5in real width)
                          const scaledFs = Math.max(5, Math.round(fs * (SHEET_PREVIEW_W / 816)));
                          return (
                            <span
                              key={fIdx}
                              style={{
                                fontSize: scaledFs,
                                fontWeight: field.bold ? 'bold' : 'normal',
                                fontStyle: field.italic ? 'italic' : 'normal',
                                fontFamily: field.fontFamily || 'Arial, sans-serif',
                                color: '#1e293b',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {value || ''}
                            </span>
                          );
                        })}
                      </div>
                    ))}
                  </>
                ) : (
                  <div style={{ width: '100%', height: '100%' }} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function LabelPreview({ finalData, template, onBack, onConfirm }) {
  const [page, setPage] = useState(0);

  const perSheet  = template?.perSheet ?? 30;
  const totalPages = Math.ceil(finalData.length / perSheet);

  const pageStart  = page * perSheet;
  const pageLabels = finalData.slice(pageStart, pageStart + perSheet);

  const sheetsNeeded = totalPages;
  const totalLabels  = finalData.length;

  return (
    <div className="glass" style={{ padding: '2.5rem' }}>
      {/* Header */}
      <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.25rem' }}>Step 4: Preview Labels</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
        {totalLabels} label{totalLabels !== 1 ? 's' : ''} across {sheetsNeeded} sheet{sheetsNeeded !== 1 ? 's' : ''}
        {template && <> · <strong style={{ color: 'var(--color-accent-lt)' }}>{template.name}</strong> ({template.perSheet}/sheet)</>}
      </p>
      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
        Each cell represents a physical label at actual sheet proportions.
      </p>

      {/* Sheet preview */}
      <SheetPreview
        pageLabels={pageLabels}
        template={template}
        pageIndex={page}
        totalPages={totalPages}
      />

      {/* Sheet pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            style={{
              padding: '0.375rem 1rem',
              background: 'transparent',
              border: '1px solid var(--color-border)',
              color: page === 0 ? 'var(--text-muted)' : 'white',
              borderRadius: '6px',
              cursor: page === 0 ? 'default' : 'pointer',
              fontFamily: 'inherit',
            }}
          >
            &larr; Prev Sheet
          </button>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Sheet {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            style={{
              padding: '0.375rem 1rem',
              background: 'transparent',
              border: '1px solid var(--color-border)',
              color: page === totalPages - 1 ? 'var(--text-muted)' : 'white',
              borderRadius: '6px',
              cursor: page === totalPages - 1 ? 'default' : 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Next Sheet &rarr;
          </button>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
        <button
          className="btn-primary"
          style={{ backgroundColor: 'transparent', border: '1px solid var(--color-border)', padding: '0.75rem 2rem' }}
          onClick={onBack}
        >
          &larr; Back to Mapping
        </button>
        <button
          className="btn-primary"
          style={{ padding: '0.75rem 3rem', boxShadow: '0 0 20px rgba(108,99,255,0.3)' }}
          onClick={onConfirm}
        >
          Generate PDF &rarr;
        </button>
      </div>
    </div>
  );
}
