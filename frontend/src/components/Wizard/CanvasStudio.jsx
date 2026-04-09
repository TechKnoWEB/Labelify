import { useState, useCallback } from 'react';

// ─── Constants ────────────────────────────────────────────────────────────────

const FONT_SIZES = ['10px', '12px', '14px', '16px', '18px', '20px', '24px', '28px'];

const FONT_FAMILIES = [
  { label: 'Arial',           value: 'Arial, sans-serif' },
  { label: 'Helvetica',       value: 'Helvetica, sans-serif' },
  { label: 'Times New Roman', value: '"Times New Roman", serif' },
  { label: 'Georgia',         value: 'Georgia, serif' },
  { label: 'Courier New',     value: '"Courier New", monospace' },
  { label: 'Verdana',         value: 'Verdana, sans-serif' },
  { label: 'Tahoma',          value: 'Tahoma, sans-serif' },
];

const QUICK_FIELDS = [
  { label: 'Name',       content: 'Recipient Name' },
  { label: 'Address',    content: 'Street Address'  },
  { label: 'City/Zip',   content: 'City, State Zip' },
  { label: 'Country',    content: 'Country'          },
  //{ label: 'Company',    content: 'Company Name'    },
  //{ label: 'Phone',      content: 'Phone Number'    },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeField(content = 'New Field', overrides = {}) {
  return {
    id: `field_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    type: 'text',
    content,
    fontSize: '14px',
    fontFamily: 'Arial, sans-serif',
    bold: false,
    italic: false,
    underline: false,
    align: 'left',
    color: '#0f172a',
    ...overrides,
  };
}

function fieldsToRows(fields) { return fields.map((f) => [f]); }
function rowsToFields(rows)   { return rows.flatMap((r) => r); }

function findFieldPos(rows, fieldId) {
  for (let r = 0; r < rows.length; r++) {
    for (let c = 0; c < rows[r].length; c++) {
      if (rows[r][c].id === fieldId) return { r, c };
    }
  }
  return null;
}

// ─── FieldCell ────────────────────────────────────────────────────────────────

function FieldCell({ field, isSelected, isDragOver, onSelect, onDragStart, onDragOver, onDrop }) {
  const style = {
    fontSize:       field.fontSize,
    fontFamily:     field.fontFamily || 'Arial, sans-serif',
    fontWeight:     field.bold      ? '700'       : '400',
    fontStyle:      field.italic    ? 'italic'    : 'normal',
    textDecoration: field.underline ? 'underline' : 'none',
    textAlign:      field.align     || 'left',
    color:          field.color     || '#0f172a',
  };

  return (
    <div
      draggable
      onClick={() => onSelect(field.id)}
      onDragStart={(e) => onDragStart(e, field.id)}
      onDragOver={(e) => { e.preventDefault(); onDragOver(field.id); }}
      onDrop={(e) => { e.preventDefault(); onDrop(field.id); }}
      className={[
        'cs-field',
        isSelected  ? 'cs-field--selected'  : '',
        isDragOver  ? 'cs-field--drag-over' : '',
      ].join(' ').trim()}
      style={style}
    >
      {isSelected ? (
        <input
          type="text"
          autoFocus
          value={field.content}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => { e.stopPropagation(); onSelect(field.id, { content: e.target.value }); }}
          className="cs-field__input"
          style={style}
        />
      ) : (
        field.content || <span className="cs-field__empty">Empty field</span>
      )}
    </div>
  );
}

// ─── Collapsible Panel ────────────────────────────────────────────────────────

function Panel({ title, badge, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="cs-panel">
      <button type="button" className="cs-panel__toggle" onClick={() => setOpen((v) => !v)}>
        <span className="cs-panel__title">{title}</span>
        {badge != null && <span className="cs-panel__badge">{badge}</span>}
        <span className={`cs-panel__chevron ${open ? 'cs-panel__chevron--open' : ''}`}>›</span>
      </button>
      {open && <div className="cs-panel__body">{children}</div>}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function CanvasStudio({ onSave, onBack }) {
  const [rows, setRows] = useState(() =>
    fieldsToRows([
      { id: 'f1', type: 'text', content: 'RECIPIENT NAME', fontSize: '18px', fontFamily: 'Arial, sans-serif', bold: true,  italic: false, underline: false, align: 'left', color: '#0f172a' },
      { id: 'f2', type: 'text', content: 'Street Address',  fontSize: '14px', fontFamily: 'Arial, sans-serif', bold: false, italic: false, underline: false, align: 'left', color: '#1e293b' },
      { id: 'f3', type: 'text', content: 'City, State Zip', fontSize: '14px', fontFamily: 'Arial, sans-serif', bold: false, italic: false, underline: false, align: 'left', color: '#1e293b' },
      { id: 'f4', type: 'text', content: 'Country',         fontSize: '14px', fontFamily: 'Arial, sans-serif', bold: false, italic: false, underline: false, align: 'left', color: '#1e293b' },
    ])
  );

  const [selectedId,  setSelectedId]  = useState('f1');
  const [dragSrc,     setDragSrc]     = useState(null);
  const [dragOver,    setDragOver]    = useState(null);
  const [zoom,        setZoom]        = useState(100);

  const allFields    = rowsToFields(rows);
  const selected     = allFields.find((f) => f.id === selectedId) ?? null;
  const selectedPos  = selectedId ? findFieldPos(rows, selectedId) : null;

  // ── State updaters ──

  const updateField = useCallback((id, changes) => {
    setRows((prev) => prev.map((row) => row.map((f) => f.id === id ? { ...f, ...changes } : f)));
  }, []);

  const handleSelect = (id, changes) => {
    setSelectedId(id);
    if (changes) updateField(id, changes);
  };

  const addRow = (content = 'New Field') => {
    const f = makeField(content);
    setRows((prev) => [...prev, [f]]);
    setSelectedId(f.id);
  };

  const addBeside = () => {
    if (!selectedPos) return;
    const f = makeField('New Field');
    setRows((prev) => {
      const next = prev.map((r) => [...r]);
      next[selectedPos.r].splice(selectedPos.c + 1, 0, f);
      return next;
    });
    setSelectedId(f.id);
  };

  const deleteField = (id) => {
    setRows((prev) => {
      const next = prev.map((r) => r.filter((f) => f.id !== id)).filter((r) => r.length > 0);
      if (selectedId === id) setSelectedId(rowsToFields(next)[0]?.id ?? null);
      return next;
    });
  };

  const swapRows = (a, b) => {
    setRows((prev) => {
      const next = [...prev];
      [next[a], next[b]] = [next[b], next[a]];
      return next;
    });
  };

  const moveUp   = () => { if (selectedPos && selectedPos.r > 0)                  swapRows(selectedPos.r, selectedPos.r - 1); };
  const moveDown = () => { if (selectedPos && selectedPos.r < rows.length - 1)    swapRows(selectedPos.r, selectedPos.r + 1); };

  const moveLeft = () => {
    if (!selectedPos || selectedPos.c === 0) return;
    setRows((prev) => {
      const next = prev.map((r) => [...r]);
      const row = next[selectedPos.r];
      [row[selectedPos.c - 1], row[selectedPos.c]] = [row[selectedPos.c], row[selectedPos.c - 1]];
      return next;
    });
  };

  const moveRight = () => {
    if (!selectedPos) return;
    const row = rows[selectedPos.r];
    if (selectedPos.c === row.length - 1) return;
    setRows((prev) => {
      const next = prev.map((r) => [...r]);
      const cur = next[selectedPos.r];
      [cur[selectedPos.c], cur[selectedPos.c + 1]] = [cur[selectedPos.c + 1], cur[selectedPos.c]];
      return next;
    });
  };

  // ── Drag & drop ──

  const onDragStart = (e, id) => { setDragSrc(id); e.dataTransfer.effectAllowed = 'move'; };
  const onDragOver  = (id)    => { if (id !== dragSrc) setDragOver(id); };

  const onDrop = (targetId) => {
    if (!dragSrc || dragSrc === targetId) { setDragSrc(null); setDragOver(null); return; }
    const src = findFieldPos(rows, dragSrc);
    const tgt = findFieldPos(rows, targetId);
    if (!src || !tgt) { setDragSrc(null); setDragOver(null); return; }

    setRows((prev) => {
      const next = prev.map((r) => [...r]);
      if (src.r === tgt.r) {
        [next[src.r][src.c], next[tgt.r][tgt.c]] = [next[tgt.r][tgt.c], next[src.r][src.c]];
      } else {
        const [field] = next[src.r].splice(src.c, 1);
        next[tgt.r].splice(tgt.c, 0, field);
        return next.filter((r) => r.length > 0);
      }
      return next;
    });

    setSelectedId(dragSrc);
    setDragSrc(null);
    setDragOver(null);
  };

  // ── Keyboard shortcuts ──

  const onKeyDown = (e) => {
    if (e.key === 'Escape') { setSelectedId(null); return; }
    if (!selectedId) return;
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
    if (e.altKey && e.key === 'ArrowUp')    { e.preventDefault(); moveUp();    }
    if (e.altKey && e.key === 'ArrowDown')  { e.preventDefault(); moveDown();  }
    if (e.altKey && e.key === 'ArrowLeft')  { e.preventDefault(); moveLeft();  }
    if (e.altKey && e.key === 'ArrowRight') { e.preventDefault(); moveRight(); }
    if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); deleteField(selectedId); }
  };

  const canUp    = selectedPos && selectedPos.r > 0;
  const canDown  = selectedPos && selectedPos.r < rows.length - 1;
  const canLeft  = selectedPos && selectedPos.c > 0;
  const canRight = selectedPos && selectedPos.c < (rows[selectedPos.r]?.length ?? 0) - 1;

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="cs-root" onKeyDown={onKeyDown} tabIndex={-1}>

      {/* ════════════════════════════════
          LEFT — Sticky canvas
          ════════════════════════════════ */}
      <div className="cs-left">

        {/* Toolbar row above canvas */}
        <div className="cs-canvas-bar">
          <div className="cs-canvas-bar__info">
            <span className="cs-canvas-bar__title">Label Canvas</span>
            <span className="cs-canvas-bar__stat">{allFields.length} field{allFields.length !== 1 ? 's' : ''}</span>
            <span className="cs-canvas-bar__stat">{rows.length} row{rows.length !== 1 ? 's' : ''}</span>
          </div>

          {/* Quick-insert chips */}
          <div className="cs-canvas-bar__chips">
            {QUICK_FIELDS.map(({ label, content }) => (
              <button
                key={label}
                type="button"
                className="cs-chip"
                onClick={() => addRow(content)}
                title={`Add "${content}"`}
              >
                + {label}
              </button>
            ))}
          </div>

          {/* Zoom */}
          <div className="cs-zoom">
            <button type="button" className="cs-zoom__btn" onClick={() => setZoom((z) => Math.max(60, z - 10))} title="Zoom out">−</button>
            <span className="cs-zoom__val">{zoom}%</span>
            <button type="button" className="cs-zoom__btn" onClick={() => setZoom((z) => Math.min(160, z + 10))} title="Zoom in">+</button>
            <button type="button" className="cs-zoom__btn cs-zoom__btn--reset" onClick={() => setZoom(100)} title="Reset zoom">↺</button>
          </div>
        </div>

        {/* Canvas stage */}
        <div className="cs-stage">
          <div className="cs-paper" style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}>

            {/* Corner fold */}
            <span className="cs-paper__fold" aria-hidden="true" />

            {/* Label content */}
            <div className="cs-label" onClick={(e) => { if (e.target === e.currentTarget) setSelectedId(null); }}>
              {rows.map((row, ri) => (
                <div
                  key={`row-${ri}`}
                  className={`cs-row ${selectedPos?.r === ri ? 'cs-row--active' : ''}`}
                >
                  {row.map((field) => (
                    <FieldCell
                      key={field.id}
                      field={field}
                      isSelected={selectedId === field.id}
                      isDragOver={dragOver === field.id}
                      onSelect={handleSelect}
                      onDragStart={onDragStart}
                      onDragOver={onDragOver}
                      onDrop={onDrop}
                    />
                  ))}
                </div>
              ))}

              {rows.length === 0 && (
                <div className="cs-empty">
                  <div className="cs-empty__icon">⊕</div>
                  <p className="cs-empty__title">No fields yet</p>
                  <p className="cs-empty__hint">Use quick-insert chips above or "Add Row" in the tools panel.</p>
                </div>
              )}
            </div>

            {/* Paper footer */}
            <div className="cs-paper__footer">
              <span>Avery 5160</span>
              <span>1″ × 2.625″</span>
              <span>30 per sheet</span>
            </div>
          </div>
        </div>

        {/* Hint row */}
        <div className="cs-hints">
          <span className="cs-hint">Click to select & edit</span>
          <span className="cs-hint">Drag to reorder</span>
          <span className="cs-hint">Alt + ↑↓ moves rows</span>
          <span className="cs-hint">Esc deselects</span>
        </div>

        {/* Quick Access Buttons */}
        <div className="cs-quick-access">
          <span className="cs-quick-access__label">Quick Access</span>
          <div className="cs-quick-access__btns">
            <button type="button" className="cs-qa-btn cs-qa-btn--green" onClick={() => addRow()}>
              + Add Row
            </button>
            <button type="button" className="cs-qa-btn cs-qa-btn--blue" onClick={addBeside} disabled={!selectedId}>
              + Add Beside
            </button>
            <button type="button" className="cs-qa-btn cs-qa-btn--red" onClick={() => selectedId && deleteField(selectedId)} disabled={!selectedId}>
              ✕ Delete
            </button>
          </div>
        </div>
      </div>

      {/* Vertical divider */}
      <div className="cs-divider" aria-hidden="true" />

      {/* ════════════════════════════════
          RIGHT — Scrollable tools panel
          ════════════════════════════════ */}
      <aside className="cs-right">

        {/* Sticky tools header */}
        <div className="cs-tools-head">
          <div className="cs-tools-head__left">
            <p className="cs-tools-head__eyebrow">Tools</p>
            <h3 className="cs-tools-head__title">
              {selected
                ? (selected.content.trim() || 'Untitled field')
                : 'Field Properties'}
            </h3>
          </div>
        </div>

        {/* No selection state */}
        {!selected && (
          <div className="cs-no-sel">
            <div className="cs-no-sel__arrow">↖</div>
            <p className="cs-no-sel__title">No field selected</p>
            <p className="cs-no-sel__sub">Click any field on the canvas to start editing it here.</p>
          </div>
        )}

        {/* ── Tools when a field is selected ── */}
        {selected && (
          <>
            {/* Content */}
            <Panel title="Content" defaultOpen={true}>
              <label className="cs-label" htmlFor="cs-content">Text</label>
              <input
                id="cs-content"
                type="text"
                className="cs-input"
                value={selected.content}
                onChange={(e) => updateField(selected.id, { content: e.target.value })}
                placeholder="Enter label text…"
              />
            </Panel>

            {/* Typography */}
            <Panel title="Typography" defaultOpen={true}>
              {/* Size + Color */}
              <div className="cs-grid-2">
                <div>
                  <label className="cs-label" htmlFor="cs-size">Size</label>
                  <select
                    id="cs-size"
                    className="cs-select"
                    value={selected.fontSize}
                    onChange={(e) => updateField(selected.id, { fontSize: e.target.value })}
                  >
                    {FONT_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="cs-label" htmlFor="cs-color">Color</label>
                  <div className="cs-color-row">
                    <input
                      id="cs-color"
                      type="color"
                      className="cs-color-swatch"
                      value={selected.color || '#0f172a'}
                      onChange={(e) => updateField(selected.id, { color: e.target.value })}
                    />
                    <span className="cs-color-hex">{selected.color || '#0f172a'}</span>
                  </div>
                </div>
              </div>

              {/* Font family */}
              <div>
                <label className="cs-label" htmlFor="cs-family">Font</label>
                <select
                  id="cs-family"
                  className="cs-select"
                  value={selected.fontFamily || 'Arial, sans-serif'}
                  onChange={(e) => updateField(selected.id, { fontFamily: e.target.value })}
                >
                  {FONT_FAMILIES.map((f) => (
                    <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>{f.label}</option>
                  ))}
                </select>
              </div>

              {/* Style toggles */}
              <div>
                <label className="cs-label">Style</label>
                <div className="cs-style-row">
                  {[
                    { key: 'bold',      char: 'B', style: { fontWeight: 700 }              },
                    { key: 'italic',    char: 'I', style: { fontStyle: 'italic' }           },
                    { key: 'underline', char: 'U', style: { textDecoration: 'underline' }   },
                  ].map(({ key, char, style }) => (
                    <button
                      key={key}
                      type="button"
                      className={`cs-style-btn ${selected[key] ? 'cs-style-btn--on' : ''}`}
                      style={style}
                      onClick={() => updateField(selected.id, { [key]: !selected[key] })}
                      title={key.charAt(0).toUpperCase() + key.slice(1)}
                    >{char}</button>
                  ))}
                </div>
              </div>

              {/* Alignment */}
              <div>
                <label className="cs-label">Align</label>
                <div className="cs-align-row">
                  {[
                    { value: 'left',   icon: '≡', label: 'Left'   },
                    { value: 'center', icon: '≡', label: 'Center' },
                    { value: 'right',  icon: '≡', label: 'Right'  },
                  ].map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      className={`cs-align-btn ${(selected.align || 'left') === value ? 'cs-align-btn--on' : ''}`}
                      onClick={() => updateField(selected.id, { align: value })}
                      title={label}
                    >{label}</button>
                  ))}
                </div>
              </div>
            </Panel>

            {/* Layout */}
            <Panel title="Layout" defaultOpen={true}>
              {/* Row movement */}
              <div>
                <label className="cs-label">Move Row</label>
                <div className="cs-grid-2">
                  <button type="button" onClick={moveUp}   disabled={!canUp}   className="cs-btn cs-btn--sm">↑ Up</button>
                  <button type="button" onClick={moveDown} disabled={!canDown} className="cs-btn cs-btn--sm">↓ Down</button>
                </div>
              </div>

              {/* Inline movement (only shown when in a multi-field row) */}
              {(canLeft || canRight) && (
                <div>
                  <label className="cs-label">Move Inline</label>
                  <div className="cs-grid-2">
                    <button type="button" onClick={moveLeft}  disabled={!canLeft}  className="cs-btn cs-btn--sm">← Left</button>
                    <button type="button" onClick={moveRight} disabled={!canRight} className="cs-btn cs-btn--sm">→ Right</button>
                  </div>
                </div>
              )}

              <p className="cs-hint-text">Alt + arrow keys also reorder. Drag fields directly on the canvas.</p>
            </Panel>
          </>
        )}

        {/* ── Field map — always visible ── */}
        <Panel title="Field Map" badge={allFields.length} defaultOpen={true}>
          {rows.length === 0
            ? <p className="cs-map-empty">No fields yet. Add a row to begin.</p>
            : (
              <div className="cs-map">
                {rows.map((row, ri) => (
                  <div
                    key={`map-${ri}`}
                    className={`cs-map__row ${selectedPos?.r === ri ? 'cs-map__row--active' : ''}`}
                  >
                    <span className="cs-map__num">{ri + 1}</span>
                    <div className="cs-map__chips">
                      {row.map((field) => (
                        <button
                          key={field.id}
                          type="button"
                          onClick={() => setSelectedId(field.id)}
                          className={`cs-map__chip ${selectedId === field.id ? 'cs-map__chip--active' : ''}`}
                          title={field.content}
                        >
                          {field.content || '(empty)'}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )
          }
        </Panel>

        {/* ── Sticky footer: navigation actions ── */}
        <div className="cs-footer">
          {onBack && (
            <button type="button" className="cs-btn cs-btn--ghost" onClick={onBack}>
              ← Back
            </button>
          )}
          <button
            type="button"
            className="btn-primary cs-footer__confirm"
            onClick={() => onSave(rowsToFields(rows), rows)}
            disabled={allFields.length === 0}
          >
            Confirm Design →
          </button>
        </div>

      </aside>
    </div>
  );
}
