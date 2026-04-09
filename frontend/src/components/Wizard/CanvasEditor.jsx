import { useState, useCallback } from 'react';

const FONT_SIZES = ['10px', '12px', '14px', '16px', '18px', '20px', '24px', '28px'];

const FONT_FAMILIES = [
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Helvetica', value: 'Helvetica, sans-serif' },
  { label: 'Times New Roman', value: '"Times New Roman", serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Courier New', value: '"Courier New", monospace' },
  { label: 'Verdana', value: 'Verdana, sans-serif' },
  { label: 'Tahoma', value: 'Tahoma, sans-serif' },
];

function makeField(content = 'New Text Field', overrides = {}) {
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
    color: '#1e293b',
    ...overrides,
  };
}

function fieldsToRows(fields) {
  return fields.map((field) => [field]);
}

function rowsToFields(rows) {
  return rows.flatMap((row) => row);
}

function findFieldPos(rows, fieldId) {
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
    for (let colIndex = 0; colIndex < rows[rowIndex].length; colIndex += 1) {
      if (rows[rowIndex][colIndex].id === fieldId) return { r: rowIndex, c: colIndex };
    }
  }
  return null;
}

function FieldCell({ field, isSelected, isDragOver, onSelect, onDragStart, onDragOver, onDrop }) {
  const textStyle = {
    fontSize: field.fontSize,
    fontFamily: field.fontFamily || 'Arial, sans-serif',
    fontWeight: field.bold ? '700' : '400',
    fontStyle: field.italic ? 'italic' : 'normal',
    textDecoration: field.underline ? 'underline' : 'none',
    textAlign: field.align || 'left',
    color: field.color || '#1e293b',
  };

  return (
    <div
      draggable
      onClick={() => onSelect(field.id)}
      onDragStart={(e) => onDragStart(e, field.id)}
      onDragOver={(e) => { e.preventDefault(); onDragOver(field.id); }}
      onDrop={(e) => { e.preventDefault(); onDrop(field.id); }}
      className={[
        'ce-field',
        isSelected ? 'ce-field--selected' : '',
        isDragOver ? 'ce-field--drag-over' : '',
      ].join(' ').trim()}
      style={textStyle}
    >
      {isSelected ? (
        <input
          type="text"
          autoFocus
          value={field.content}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => { e.stopPropagation(); onSelect(field.id, { content: e.target.value }); }}
          className="ce-field__input"
          style={textStyle}
        />
      ) : (
        field.content || <span className="ce-field__placeholder">Empty field</span>
      )}
    </div>
  );
}

/* ── Collapsible section wrapper ── */
function ToolSection({ title, icon, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="ce-tool-section">
      <button
        type="button"
        className="ce-tool-section__header"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="ce-tool-section__icon">{icon}</span>
        <span className="ce-tool-section__title">{title}</span>
        <span className={`ce-tool-section__chevron ${open ? 'ce-tool-section__chevron--open' : ''}`}>›</span>
      </button>
      <div className={`ce-tool-section__body-wrap ${open ? 'ce-tool-section__body-wrap--open' : ''}`}>
        <div className="ce-tool-section__body">{children}</div>
      </div>
    </div>
  );
}

export function CanvasEditor({ onSave }) {
  const [rows, setRows] = useState(() =>
    fieldsToRows([
      { id: 'field_1', type: 'text', content: 'RECIPIENT NAME', fontSize: '18px', fontFamily: 'Arial, sans-serif', bold: true, italic: false, underline: false, align: 'left', color: '#0f172a' },
      { id: 'field_2', type: 'text', content: 'Street Address', fontSize: '14px', fontFamily: 'Arial, sans-serif', bold: false, italic: false, underline: false, align: 'left', color: '#1e293b' },
      { id: 'field_3', type: 'text', content: 'City, Zip', fontSize: '14px', fontFamily: 'Arial, sans-serif', bold: false, italic: false, underline: false, align: 'left', color: '#1e293b' },
      { id: 'field_4', type: 'text', content: 'Country', fontSize: '14px', fontFamily: 'Arial, sans-serif', bold: false, italic: false, underline: false, align: 'left', color: '#1e293b' },
    ])
  );

  const [selectedFieldId, setSelectedFieldId] = useState(null);
  const [dragSourceId, setDragSourceId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const [zoom, setZoom] = useState(100);

  const allFields = rowsToFields(rows);
  const selectedField = allFields.find((f) => f.id === selectedFieldId) ?? null;
  const selectedPos = selectedFieldId ? findFieldPos(rows, selectedFieldId) : null;

  const updateField = useCallback((id, changes) => {
    setRows((prev) => prev.map((row) => row.map((f) => (f.id === id ? { ...f, ...changes } : f))));
  }, []);

  const handleSelect = (id, changes) => {
    setSelectedFieldId(id);
    if (changes) updateField(id, changes);
  };

  const handleAddField = () => {
    const field = makeField('New Text Field');
    setRows((prev) => [...prev, [field]]);
    setSelectedFieldId(field.id);
  };

  const handleAddBeside = () => {
    if (!selectedPos) return;
    const field = makeField('New Field');
    setRows((prev) => {
      const next = prev.map((row) => [...row]);
      next[selectedPos.r].splice(selectedPos.c + 1, 0, field);
      return next;
    });
    setSelectedFieldId(field.id);
  };

  const handleDeleteField = (id) => {
    setRows((prev) => {
      const next = prev.map((row) => row.filter((f) => f.id !== id)).filter((row) => row.length > 0);
      return next;
    });
    if (selectedFieldId === id) setSelectedFieldId(null);
  };

  const moveRowUp = () => {
    if (!selectedPos || selectedPos.r === 0) return;
    setRows((prev) => {
      const next = [...prev];
      [next[selectedPos.r - 1], next[selectedPos.r]] = [next[selectedPos.r], next[selectedPos.r - 1]];
      return next;
    });
  };

  const moveRowDown = () => {
    if (!selectedPos || selectedPos.r === rows.length - 1) return;
    setRows((prev) => {
      const next = [...prev];
      [next[selectedPos.r], next[selectedPos.r + 1]] = [next[selectedPos.r + 1], next[selectedPos.r]];
      return next;
    });
  };

  const handleDragStart = (e, fieldId) => {
    setDragSourceId(fieldId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (fieldId) => {
    if (fieldId !== dragSourceId) setDragOverId(fieldId);
  };

  const handleDrop = (targetId) => {
    if (!dragSourceId || dragSourceId === targetId) {
      setDragSourceId(null);
      setDragOverId(null);
      return;
    }
    const srcPos = findFieldPos(rows, dragSourceId);
    const tgtPos = findFieldPos(rows, targetId);
    if (!srcPos || !tgtPos) return;

    setRows((prev) => {
      const next = prev.map((row) => [...row]);
      if (srcPos.r === tgtPos.r) {
        const row = next[srcPos.r];
        [row[srcPos.c], row[tgtPos.c]] = [row[tgtPos.c], row[srcPos.c]];
      } else {
        const [srcField] = next[srcPos.r].splice(srcPos.c, 1);
        next[tgtPos.r].splice(tgtPos.c, 0, srcField);
        return next.filter((r) => r.length > 0);
      }
      return next;
    });
    setDragSourceId(null);
    setDragOverId(null);
  };

  const handleKeyDown = (e) => {
    if (!selectedFieldId) return;
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
    if (e.altKey && e.key === 'ArrowUp') { e.preventDefault(); moveRowUp(); }
    if (e.altKey && e.key === 'ArrowDown') { e.preventDefault(); moveRowDown(); }
    if ((e.key === 'Delete' || e.key === 'Backspace') && e.target === document.body) {
      e.preventDefault();
      handleDeleteField(selectedFieldId);
    }
  };

  const handleSave = () => onSave(rowsToFields(rows), rows);

  const canMoveUp   = selectedPos && selectedPos.r > 0;
  const canMoveDown = selectedPos && selectedPos.r < rows.length - 1;

  return (
    <div className="ce-root" onKeyDown={handleKeyDown} tabIndex={-1}>

      {/* ── Left: Canvas Panel (sticky) ── */}
      <div className="ce-left">
        {/* Canvas toolbar */}
        <div className="ce-canvas-toolbar">
          <div className="ce-canvas-toolbar__left">
            <span className="ce-canvas-toolbar__label">Label Canvas</span>
            <span className="ce-canvas-toolbar__badge">{allFields.length} fields</span>
          </div>
          <div className="ce-canvas-toolbar__right">
            <button
              type="button"
              className="ce-icon-btn"
              title="Zoom out"
              onClick={() => setZoom((z) => Math.max(60, z - 10))}
            >−</button>
            <span className="ce-zoom-label">{zoom}%</span>
            <button
              type="button"
              className="ce-icon-btn"
              title="Zoom in"
              onClick={() => setZoom((z) => Math.min(150, z + 10))}
            >+</button>
            <button
              type="button"
              className="ce-icon-btn"
              title="Reset zoom"
              onClick={() => setZoom(100)}
            >⊙</button>
          </div>
        </div>

        {/* Canvas stage */}
        <div className="ce-canvas-stage">
          <div className="ce-canvas-paper" style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}>
            {/* Paper corner notch */}
            <div className="ce-canvas-paper__corner" />

            {/* Label area */}
            <div className="ce-label-area">
              {rows.map((row, rowIndex) => (
                <div
                  key={`row-${rowIndex}`}
                  className={`ce-row ${selectedPos && selectedPos.r === rowIndex ? 'ce-row--active' : ''}`}
                >
                  {row.map((field) => (
                    <FieldCell
                      key={field.id}
                      field={field}
                      isSelected={selectedFieldId === field.id}
                      isDragOver={dragOverId === field.id}
                      onSelect={handleSelect}
                      onDragStart={handleDragStart}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                    />
                  ))}
                </div>
              ))}

              {rows.length === 0 && (
                <div className="ce-canvas-empty">
                  <span className="ce-canvas-empty__icon">＋</span>
                  <p>No fields yet</p>
                  <p className="ce-canvas-empty__hint">Use "Add Field" in the panel →</p>
                </div>
              )}
            </div>

            {/* Label border rule line */}
            <div className="ce-canvas-paper__footer-hint">Avery 5160 · 1″ × 2.625″</div>
          </div>
        </div>

        {/* Canvas hints */}
        <div className="ce-canvas-hints">
          <span className="ce-hint-chip">Click field to edit</span>
          <span className="ce-hint-chip">Drag to reorder</span>
          <span className="ce-hint-chip">Alt + ↑↓ moves rows</span>
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="ce-divider" aria-hidden="true" />

      {/* ── Right: Scrollable Tools Panel ── */}
      <aside className="ce-right">

        {/* Tools header */}
        <div className="ce-tools-header">
          <div>
            <p className="ce-tools-eyebrow">Tools</p>
            <h3 className="ce-tools-title">
              {selectedField ? `Editing: ${selectedField.content || 'Field'}` : 'Field Properties'}
            </h3>
          </div>
          <button
            type="button"
            className="ce-add-btn"
            onClick={handleAddField}
          >
            + Add Field
          </button>
        </div>

        {/* No selection state */}
        {!selectedField && (
          <div className="ce-no-selection">
            <div className="ce-no-selection__icon">↖</div>
            <p className="ce-no-selection__title">No field selected</p>
            <p className="ce-no-selection__hint">Click any field on the canvas to start editing it here.</p>
          </div>
        )}
        

        {/* Field tools (shown when field is selected) */}
        {selectedField && (
          <div className="ce-tools-body">

            {/* Text content */}
            <ToolSection title="Content" icon="✏" defaultOpen={true}>
              <label className="ce-label" htmlFor="ce-content">Text</label>
              <input
                id="ce-content"
                type="text"
                className="ce-input"
                value={selectedField.content}
                onChange={(e) => updateField(selectedField.id, { content: e.target.value })}
                placeholder="Enter label text..."
              />
            </ToolSection>

            {/* Typography */}
            <ToolSection title="Typography" icon="Aa" defaultOpen={true}>
              <div className="ce-grid-2">
                <div>
                  <label className="ce-label" htmlFor="ce-size">Size</label>
                  <select
                    id="ce-size"
                    className="ce-select"
                    value={selectedField.fontSize}
                    onChange={(e) => updateField(selectedField.id, { fontSize: e.target.value })}
                  >
                    {FONT_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="ce-label" htmlFor="ce-color">Color</label>
                  <div className="ce-color-row">
                    <input
                      id="ce-color"
                      type="color"
                      className="ce-color-picker"
                      value={selectedField.color || '#1e293b'}
                      onChange={(e) => updateField(selectedField.id, { color: e.target.value })}
                    />
                    <span className="ce-color-hex">{selectedField.color || '#1e293b'}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="ce-label" htmlFor="ce-family">Font Family</label>
                <select
                  id="ce-family"
                  className="ce-select"
                  value={selectedField.fontFamily || 'Arial, sans-serif'}
                  onChange={(e) => updateField(selectedField.id, { fontFamily: e.target.value })}
                >
                  {FONT_FAMILIES.map((f) => (
                    <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>{f.label}</option>
                  ))}
                </select>
              </div>

              {/* Style toggles */}
              <div>
                <label className="ce-label">Style</label>
                <div className="ce-style-row">
                  {[
                    { key: 'bold',      label: 'B', style: { fontWeight: 700 } },
                    { key: 'italic',    label: 'I', style: { fontStyle: 'italic' } },
                    { key: 'underline', label: 'U', style: { textDecoration: 'underline' } },
                  ].map(({ key, label, style }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => updateField(selectedField.id, { [key]: !selectedField[key] })}
                      className={`ce-style-btn ${selectedField[key] ? 'ce-style-btn--on' : ''}`}
                      style={style}
                      title={key.charAt(0).toUpperCase() + key.slice(1)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Alignment */}
              <div>
                <label className="ce-label">Alignment</label>
                <div className="ce-align-row">
                  {[
                    { value: 'left',   icon: '▤', label: 'Left' },
                    { value: 'center', icon: '▥', label: 'Center' },
                    { value: 'right',  icon: '▦', label: 'Right' },
                  ].map(({ value, icon, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => updateField(selectedField.id, { align: value })}
                      className={`ce-align-btn ${(selectedField.align || 'left') === value ? 'ce-align-btn--on' : ''}`}
                      title={label}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
            </ToolSection>

            {/* Layout / Position */}
            <ToolSection title="Layout" icon="⊞" defaultOpen={true}>
              <div className="ce-grid-2">
                <button type="button" onClick={handleAddBeside} className="ce-action ce-action--blue">
                  + Add Beside
                </button>
                <button type="button" onClick={() => handleDeleteField(selectedField.id)} className="ce-action ce-action--red">
                  ✕ Delete
                </button>
              </div>
              <div className="ce-order-grid">
                <button type="button" onClick={moveRowUp} disabled={!canMoveUp} className="ce-action ce-action--sm" title="Move row up">
                  ↑ Up
                </button>
                <button type="button" onClick={moveRowDown} disabled={!canMoveDown} className="ce-action ce-action--sm" title="Move row down">
                  ↓ Down
                </button>
              </div>
            </ToolSection>

          </div>
        )}

        {/* Field Map — always visible, inside tools body for consistent borders */}
        <div className="ce-tools-body">
        <ToolSection title="Field Map" icon="≡" defaultOpen={true}>
          {rows.length === 0 ? (
            <p className="ce-map-empty">No fields added yet.</p>
          ) : (
            <div className="ce-map">
              {rows.map((row, rowIndex) => (
                <div
                  key={`map-${rowIndex}`}
                  className={`ce-map__row ${selectedPos && selectedPos.r === rowIndex ? 'ce-map__row--active' : ''}`}
                >
                  <span className="ce-map__row-num">{rowIndex + 1}</span>
                  {row.map((field) => (
                    <button
                      key={field.id}
                      type="button"
                      onClick={() => setSelectedFieldId(field.id)}
                      className={`ce-map__chip ${selectedFieldId === field.id ? 'ce-map__chip--active' : ''}`}
                      title={field.content}
                    >
                      {field.content || '(empty)'}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </ToolSection>
        </div>

        {/* Footer: save */}
        <div className="ce-tools-footer">
          <button
            type="button"
            onClick={handleSave}
            className="btn-primary ce-save-btn"
            disabled={allFields.length === 0}
          >
            Confirm Design →
          </button>
        </div>

      </aside>
    </div>
  );
}
