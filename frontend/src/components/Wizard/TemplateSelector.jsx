import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

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

function parseMeasurement(value) {
  const normalized = value?.replace(/["″]/g, '').trim();
  if (!normalized) return null;

  if (normalized.includes('-')) {
    const [whole, fraction] = normalized.split('-');
    const [numerator, denominator] = fraction.split('/').map(Number);
    if (Number.isFinite(numerator) && Number.isFinite(denominator) && denominator !== 0) {
      return Number(whole) + numerator / denominator;
    }
  }

  if (normalized.includes('/')) {
    const [numerator, denominator] = normalized.split('/').map(Number);
    if (Number.isFinite(numerator) && Number.isFinite(denominator) && denominator !== 0) {
      return numerator / denominator;
    }
  }

  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function getGrid(template) {
  const perSheet = template?.perSheet ?? 30;
  const knownGrid = PER_SHEET_GRID[perSheet];

  if (knownGrid) {
    return { cols: knownGrid[0], rows: knownGrid[1] };
  }

  const cols = Math.max(1, Math.round(Math.sqrt(perSheet)));
  return { cols, rows: Math.ceil(perSheet / cols) };
}

function getPageAspectRatio(template) {
  const pageSize = template?.pageSize?.toLowerCase() ?? 'letter';

  if (pageSize === 'letter') return 8.5 / 11;

  const parts = pageSize.split(/\s*x\s*/i).map(parseMeasurement);
  if (parts.length === 2 && parts[0] && parts[1]) {
    return parts[0] / parts[1];
  }

  return 8.5 / 11;
}

function getShapeVariant(template) {
  return template?.category === 'Round' || template?.size?.toLowerCase().includes('diameter')
    ? 'round'
    : 'rect';
}

function MiniTemplateSheetPreview({ template }) {
  const { cols, rows } = getGrid(template);
  const pageAspectRatio = getPageAspectRatio(template);
  const shapeVariant = getShapeVariant(template);
  const cells = Array.from({ length: template.perSheet }, (_, index) => index);

  return (
    <div
      className="template-card__sheet"
      style={{
        '--sheet-cols': cols,
        '--sheet-rows': rows,
        '--sheet-aspect': pageAspectRatio,
      }}
    >
      <div className="template-card__sheet-page">
        <div className="template-card__sheet-grid">
          {cells.map((cell) => (
            <span
              key={cell}
              className={[
                'template-card__sheet-cell',
                shapeVariant === 'round' ? 'template-card__sheet-cell--round' : '',
                template.color === 'Clear' ? 'template-card__sheet-cell--clear' : '',
              ].join(' ').trim()}
            />
          ))}
        </div>
      </div>
      <div className="template-card__sheet-caption">
        <span>{cols} × {rows}</span>
        <span>{template.perSheet}/sheet</span>
      </div>
    </div>
  );
}

const templates = [
  // 1" x 2-5/8" — 30 per Sheet
  { id: 'avery-5160', name: 'Avery® 5160', description: '1" x 2-5/8", 30/Sheet', size: '1" x 2-5/8"', perSheet: 30, color: 'White', pageSize: 'Letter', category: 'Address', previewColor: '#60a5fa' },
  { id: 'avery-5136', name: 'Avery® 5136', description: '1" x 2-5/8", 30/Sheet', size: '1" x 2-5/8"', perSheet: 30, color: 'White', pageSize: 'Letter', category: 'Address', previewColor: '#60a5fa' },
  { id: 'avery-8160', name: 'Avery® 8160', description: '1" x 2-5/8", 30/Sheet', size: '1" x 2-5/8"', perSheet: 30, color: 'White', pageSize: 'Letter', category: 'Address', previewColor: '#60a5fa' },
  { id: 'avery-5260', name: 'Avery® 5260', description: '1" x 2-5/8", 30/Sheet', size: '1" x 2-5/8"', perSheet: 30, color: 'White', pageSize: 'Letter', category: 'Address', previewColor: '#60a5fa' },
  { id: 'avery-5960', name: 'Avery® 5960', description: '1" x 2-5/8", 30/Sheet', size: '1" x 2-5/8"', perSheet: 30, color: 'White', pageSize: 'Letter', category: 'Address', previewColor: '#60a5fa' },
  { id: 'avery-18160', name: 'Avery® 18160', description: '1" x 2-5/8", 30/Sheet', size: '1" x 2-5/8"', perSheet: 30, color: 'White', pageSize: 'Letter', category: 'Address', previewColor: '#60a5fa' },
  { id: 'avery-18260', name: 'Avery® 18260', description: '1" x 2-5/8", 30/Sheet', size: '1" x 2-5/8"', perSheet: 30, color: 'White', pageSize: 'Letter', category: 'Address', previewColor: '#60a5fa' },
  { id: 'avery-6240', name: 'Avery® 6240', description: '1" x 2-5/8", 30/Sheet', size: '1" x 2-5/8"', perSheet: 30, color: 'White', pageSize: 'Letter', category: 'Address', previewColor: '#60a5fa' },
  { id: 'avery-6530', name: 'Avery® 6530', description: '1" x 2-5/8", 30/Sheet', size: '1" x 2-5/8"', perSheet: 30, color: 'White', pageSize: 'Letter', category: 'Address', previewColor: '#60a5fa' },
  { id: 'avery-8250', name: 'Avery® 8250', description: '1" x 2-5/8", 30/Sheet', size: '1" x 2-5/8"', perSheet: 30, color: 'White', pageSize: 'Letter', category: 'Address', previewColor: '#60a5fa' },
  { id: 'avery-8460', name: 'Avery® 8460', description: '1" x 2-5/8", 30/Sheet', size: '1" x 2-5/8"', perSheet: 30, color: 'White', pageSize: 'Letter', category: 'Address', previewColor: '#60a5fa' },
  { id: 'avery-8660', name: 'Avery® 8660', description: '1" x 2-5/8", 30/Sheet', size: '1" x 2-5/8"', perSheet: 30, color: 'White', pageSize: 'Letter', category: 'Address', previewColor: '#60a5fa' },
  { id: 'avery-8860', name: 'Avery® 8860', description: '1" x 2-5/8", 30/Sheet', size: '1" x 2-5/8"', perSheet: 30, color: 'White', pageSize: 'Letter', category: 'Address', previewColor: '#60a5fa' },
  { id: 'avery-8920', name: 'Avery® 8920', description: '1" x 2-5/8", 30/Sheet', size: '1" x 2-5/8"', perSheet: 30, color: 'White', pageSize: 'Letter', category: 'Address', previewColor: '#60a5fa' },
  { id: 'avery-15700', name: 'Avery® 15700', description: '1" x 2-5/8", 30/Sheet', size: '1" x 2-5/8"', perSheet: 30, color: 'White', pageSize: 'Letter', category: 'Address', previewColor: '#60a5fa' },
  { id: 'avery-16460', name: 'Avery® 16460', description: '1" x 2-5/8", 30/Sheet', size: '1" x 2-5/8"', perSheet: 30, color: 'White', pageSize: 'Letter', category: 'Address', previewColor: '#60a5fa' },
  { id: 'avery-22837', name: 'Avery® 22837', description: '1" x 2-5/8", 30/Sheet', size: '1" x 2-5/8"', perSheet: 30, color: 'White', pageSize: 'Letter', category: 'Address', previewColor: '#60a5fa' },
  { id: 'avery-45160', name: 'Avery® 45160', description: '1" x 2-5/8", 30/Sheet', size: '1" x 2-5/8"', perSheet: 30, color: 'White', pageSize: 'Letter', category: 'Address', previewColor: '#60a5fa' },
  { id: 'avery-48160', name: 'Avery® 48160', description: '1" x 2-5/8", 30/Sheet', size: '1" x 2-5/8"', perSheet: 30, color: 'White', pageSize: 'Letter', category: 'Address', previewColor: '#60a5fa' },
  { id: 'avery-48260', name: 'Avery® 48260', description: '1" x 2-5/8", 30/Sheet', size: '1" x 2-5/8"', perSheet: 30, color: 'White', pageSize: 'Letter', category: 'Address', previewColor: '#60a5fa' },
  { id: 'avery-48360', name: 'Avery® 48360', description: '1" x 2-5/8", 30/Sheet', size: '1" x 2-5/8"', perSheet: 30, color: 'White', pageSize: 'Letter', category: 'Address', previewColor: '#60a5fa' },
  { id: 'avery-48460', name: 'Avery® 48460', description: '1" x 2-5/8", 30/Sheet', size: '1" x 2-5/8"', perSheet: 30, color: 'White', pageSize: 'Letter', category: 'Address', previewColor: '#60a5fa' },
  { id: 'avery-48860', name: 'Avery® 48860', description: '1" x 2-5/8", 30/Sheet', size: '1" x 2-5/8"', perSheet: 30, color: 'White', pageSize: 'Letter', category: 'Address', previewColor: '#60a5fa' },
  { id: 'avery-48960', name: 'Avery® 48960', description: '1" x 2-5/8", 30/Sheet', size: '1" x 2-5/8"', perSheet: 30, color: 'White', pageSize: 'Letter', category: 'Address', previewColor: '#60a5fa' },
  { id: 'avery-55160', name: 'Avery® 55160', description: '1" x 2-5/8", 30/Sheet', size: '1" x 2-5/8"', perSheet: 30, color: 'White', pageSize: 'Letter', category: 'Address', previewColor: '#60a5fa' },
  { id: 'avery-55360', name: 'Avery® 55360', description: '1" x 2-5/8", 30/Sheet', size: '1" x 2-5/8"', perSheet: 30, color: 'White', pageSize: 'Letter', category: 'Address', previewColor: '#60a5fa' },
  { id: 'avery-58160', name: 'Avery® 58160', description: '1" x 2-5/8", 30/Sheet', size: '1" x 2-5/8"', perSheet: 30, color: 'White', pageSize: 'Letter', category: 'Address', previewColor: '#60a5fa' },
  { id: 'avery-75160', name: 'Avery® 75160', description: '1" x 2-5/8", 30/Sheet', size: '1" x 2-5/8"', perSheet: 30, color: 'White', pageSize: 'Letter', category: 'Address', previewColor: '#60a5fa' },
  { id: 'avery-85560', name: 'Avery® 85560', description: '1" x 2-5/8", 30/Sheet', size: '1" x 2-5/8"', perSheet: 30, color: 'White', pageSize: 'Letter', category: 'Address', previewColor: '#60a5fa' },
  { id: 'avery-88560', name: 'Avery® 88560', description: '1" x 2-5/8", 30/Sheet', size: '1" x 2-5/8"', perSheet: 30, color: 'White', pageSize: 'Letter', category: 'Address', previewColor: '#60a5fa' },
  { id: 'avery-95915', name: 'Avery® 95915', description: '1" x 2-5/8", 30/Sheet', size: '1" x 2-5/8"', perSheet: 30, color: 'White', pageSize: 'Letter', category: 'Address', previewColor: '#60a5fa' },
  { id: 'avery-95920', name: 'Avery® 95520', description: '1" x 2-5/8", 30/Sheet', size: '1" x 2-5/8"', perSheet: 30, color: 'White', pageSize: 'Letter', category: 'Address', previewColor: '#60a5fa' },
  { id: 'avery-15960', name: 'Avery® 15960', description: '1" x 2-5/8", 30/Sheet', size: '1" x 2-5/8"', perSheet: 30, color: 'White', pageSize: 'Letter', category: 'Address', previewColor: '#60a5fa' },
  { id: 'avery-38260', name: 'Avery® 38260', description: '1" x 2-5/8", 30/Sheet', size: '1" x 2-5/8"', perSheet: 30, color: 'White', pageSize: 'Letter', category: 'Address', previewColor: '#60a5fa' },

  // 1" x 2-5/8" — Clear
  { id: 'avery-18660', name: 'Avery® 18660', description: '1" x 2-5/8", 30/Sheet, Clear', size: '1" x 2-5/8"', perSheet: 30, color: 'Clear', pageSize: 'Letter', category: 'Clear', previewColor: '#94a3b8' },
  { id: 'avery-5620', name: 'Avery® 5620', description: '1" x 2-5/8", 30/Sheet, Clear', size: '1" x 2-5/8"', perSheet: 30, color: 'Clear', pageSize: 'Letter', category: 'Clear', previewColor: '#94a3b8' },
  { id: 'avery-5630', name: 'Avery® 5630', description: '1" x 2-5/8", 30/Sheet, Clear', size: '1" x 2-5/8"', perSheet: 30, color: 'Clear', pageSize: 'Letter', category: 'Clear', previewColor: '#94a3b8' },
  { id: 'avery-5660', name: 'Avery® 5660', description: '1" x 2-5/8", 30/Sheet, Clear', size: '1" x 2-5/8"', perSheet: 30, color: 'Clear', pageSize: 'Letter', category: 'Clear', previewColor: '#94a3b8' },
  { id: 'avery-8620', name: 'Avery® 8620', description: '1" x 2-5/8", 30/Sheet, Clear', size: '1" x 2-5/8"', perSheet: 30, color: 'Clear', pageSize: 'Letter', category: 'Clear', previewColor: '#94a3b8' },
  { id: 'avery-15660', name: 'Avery® 15660', description: '1" x 2-5/8", 30/Sheet, Clear', size: '1" x 2-5/8"', perSheet: 30, color: 'Clear', pageSize: 'Letter', category: 'Clear', previewColor: '#94a3b8' },
  { id: 'avery-28660', name: 'Avery® 28660', description: '1" x 2-5/8", 30/Sheet, Clear', size: '1" x 2-5/8"', perSheet: 30, color: 'Clear', pageSize: 'Letter', category: 'Clear', previewColor: '#94a3b8' },
  { id: 'avery-32660', name: 'Avery® 32660', description: '1" x 2-5/8", 30/Sheet, Clear', size: '1" x 2-5/8"', perSheet: 30, color: 'Clear', pageSize: 'Letter', category: 'Clear', previewColor: '#94a3b8' },
  { id: 'avery-58660', name: 'Avery® 58660', description: '1" x 2-5/8", 30/Sheet, Clear', size: '1" x 2-5/8"', perSheet: 30, color: 'Clear', pageSize: 'Letter', category: 'Clear', previewColor: '#94a3b8' },
  { id: 'avery-6585', name: 'Avery® 6585', description: '1" x 2-5/8", 30/Sheet, Clear', size: '1" x 2-5/8"', perSheet: 30, color: 'Clear', pageSize: 'Letter', category: 'Clear', previewColor: '#94a3b8' },

  // 1" x 2-5/8" — Specialty
  { id: 'avery-6521', name: 'Avery® 6521', description: '1" x 2-5/8", 30/Sheet, Glossy Clear', size: '1" x 2-5/8"', perSheet: 30, color: 'Glossy Clear', pageSize: 'Letter', category: 'Clear', previewColor: '#7dd3fc' },
  { id: 'avery-8215', name: 'Avery® 8215', description: '1" x 2-5/8", 30/Sheet, Ivory', size: '1" x 2-5/8"', perSheet: 30, color: 'Ivory', pageSize: 'Letter', category: 'Specialty', previewColor: '#fef9c3' },
  { id: 'avery-5979', name: 'Avery® 5979', description: '1" x 2-5/8", 30/Sheet, Assorted Neon', size: '1" x 2-5/8"', perSheet: 30, color: 'Assorted Neon', pageSize: 'Letter', category: 'Neon', previewColor: '#a3e635' },
  { id: 'avery-5971', name: 'Avery® 5971', description: '1" x 2-5/8", 30/Sheet, Neon Green', size: '1" x 2-5/8"', perSheet: 30, color: 'Neon Green', pageSize: 'Letter', category: 'Neon', previewColor: '#4ade80' },
  { id: 'avery-5970', name: 'Avery® 5970', description: '1" x 2-5/8", 30/Sheet, Neon Magenta', size: '1" x 2-5/8"', perSheet: 30, color: 'Neon Magenta', pageSize: 'Letter', category: 'Neon', previewColor: '#f0abfc' },
  { id: 'avery-5972', name: 'Avery® 5972', description: '1" x 2-5/8", 30/Sheet, Neon Yellow', size: '1" x 2-5/8"', perSheet: 30, color: 'Neon Yellow', pageSize: 'Letter', category: 'Neon', previewColor: '#fde047' },
  { id: 'avery-5980', name: 'Avery® 5980', description: '1" x 2-5/8", 30/Sheet, Neon Blue', size: '1" x 2-5/8"', perSheet: 30, color: 'Neon Blue', pageSize: 'Letter', category: 'Neon', previewColor: '#38bdf8' },
  { id: 'avery-9160', name: 'Avery® 9160', description: '1" x 2-5/8", 30/Sheet, Green', size: '1" x 2-5/8"', perSheet: 30, color: 'Green', pageSize: 'Letter', category: 'Neon', previewColor: '#86efac' },
  { id: 'avery-15509', name: 'Avery® 15509', description: '1" x 2-5/8", 30/Sheet, Matte White', size: '1" x 2-5/8"', perSheet: 30, color: 'Matte White', pageSize: 'Letter', category: 'Specialty', previewColor: '#e2e8f0' },
  { id: 'avery-6507', name: 'Avery® 6507', description: '1" x 2-5/8", 30/Sheet, Gold Border', size: '1" x 2-5/8"', perSheet: 30, color: 'Gold Border', pageSize: 'Letter', category: 'Specialty', previewColor: '#fcd34d' },

  // 2" x 4" — 10 per Sheet (Shipping)
  { id: 'avery-5163', name: 'Avery® 5163', description: '2" x 4", 10/Sheet', size: '2" x 4"', perSheet: 10, color: 'White', pageSize: 'Letter', category: 'Shipping', previewColor: '#c084fc' },
  { id: 'avery-8163', name: 'Avery® 8163', description: '2" x 4", 10/Sheet', size: '2" x 4"', perSheet: 10, color: 'White', pageSize: 'Letter', category: 'Shipping', previewColor: '#c084fc' },
  { id: 'avery-5263', name: 'Avery® 5263', description: '2" x 4", 10/Sheet', size: '2" x 4"', perSheet: 10, color: 'White', pageSize: 'Letter', category: 'Shipping', previewColor: '#c084fc' },
  { id: 'avery-5963', name: 'Avery® 5963', description: '2" x 4", 10/Sheet', size: '2" x 4"', perSheet: 10, color: 'White', pageSize: 'Letter', category: 'Shipping', previewColor: '#c084fc' },
  { id: 'avery-6427', name: 'Avery® 6427', description: '2" x 4", 10/Sheet', size: '2" x 4"', perSheet: 10, color: 'White', pageSize: 'Letter', category: 'Shipping', previewColor: '#c084fc' },
  { id: 'avery-6522', name: 'Avery® 6522', description: '2" x 4", 10/Sheet', size: '2" x 4"', perSheet: 10, color: 'White', pageSize: 'Letter', category: 'Shipping', previewColor: '#c084fc' },
  { id: 'avery-6527', name: 'Avery® 6527', description: '2" x 4", 10/Sheet', size: '2" x 4"', perSheet: 10, color: 'White', pageSize: 'Letter', category: 'Shipping', previewColor: '#c084fc' },
  { id: 'avery-6528', name: 'Avery® 6528', description: '2" x 4", 10/Sheet', size: '2" x 4"', perSheet: 10, color: 'White', pageSize: 'Letter', category: 'Shipping', previewColor: '#c084fc' },
  { id: 'avery-6541', name: 'Avery® 6541', description: '2" x 4", 10/Sheet', size: '2" x 4"', perSheet: 10, color: 'White', pageSize: 'Letter', category: 'Shipping', previewColor: '#c084fc' },
  { id: 'avery-6552', name: 'Avery® 6552', description: '2" x 4", 10/Sheet', size: '2" x 4"', perSheet: 10, color: 'White', pageSize: 'Letter', category: 'Shipping', previewColor: '#c084fc' },
  { id: 'avery-8253', name: 'Avery® 8253', description: '2" x 4", 10/Sheet', size: '2" x 4"', perSheet: 10, color: 'White', pageSize: 'Letter', category: 'Shipping', previewColor: '#c084fc' },
  { id: 'avery-8363', name: 'Avery® 8363', description: '2" x 4", 10/Sheet', size: '2" x 4"', perSheet: 10, color: 'White', pageSize: 'Letter', category: 'Shipping', previewColor: '#c084fc' },
  { id: 'avery-8463', name: 'Avery® 8463', description: '2" x 4", 10/Sheet', size: '2" x 4"', perSheet: 10, color: 'White', pageSize: 'Letter', category: 'Shipping', previewColor: '#c084fc' },
  { id: 'avery-8563', name: 'Avery® 8563', description: '2" x 4", 10/Sheet', size: '2" x 4"', perSheet: 10, color: 'White', pageSize: 'Letter', category: 'Shipping', previewColor: '#c084fc' },
  { id: 'avery-8923', name: 'Avery® 8923', description: '2" x 4", 10/Sheet', size: '2" x 4"', perSheet: 10, color: 'White', pageSize: 'Letter', category: 'Shipping', previewColor: '#c084fc' },
  { id: 'avery-15513', name: 'Avery® 15513', description: '2" x 4", 10/Sheet', size: '2" x 4"', perSheet: 10, color: 'White', pageSize: 'Letter', category: 'Shipping', previewColor: '#c084fc' },
  { id: 'avery-15563', name: 'Avery® 15563', description: '2" x 4", 10/Sheet', size: '2" x 4"', perSheet: 10, color: 'White', pageSize: 'Letter', category: 'Shipping', previewColor: '#c084fc' },
  { id: 'avery-15702', name: 'Avery® 15702', description: '2" x 4", 10/Sheet', size: '2" x 4"', perSheet: 10, color: 'White', pageSize: 'Letter', category: 'Shipping', previewColor: '#c084fc' },
  { id: 'avery-16791', name: 'Avery® 16791', description: '2" x 4", 10/Sheet', size: '2" x 4"', perSheet: 10, color: 'White', pageSize: 'Letter', category: 'Shipping', previewColor: '#c084fc' },
  { id: 'avery-18163', name: 'Avery® 18163', description: '2" x 4", 10/Sheet', size: '2" x 4"', perSheet: 10, color: 'White', pageSize: 'Letter', category: 'Shipping', previewColor: '#c084fc' },
  { id: 'avery-18863', name: 'Avery® 18863', description: '2" x 4", 10/Sheet', size: '2" x 4"', perSheet: 10, color: 'White', pageSize: 'Letter', category: 'Shipping', previewColor: '#c084fc' },
  { id: 'avery-38363', name: 'Avery® 38363', description: '2" x 4", 10/Sheet', size: '2" x 4"', perSheet: 10, color: 'White', pageSize: 'Letter', category: 'Shipping', previewColor: '#c084fc' },
  { id: 'avery-38863', name: 'Avery® 38863', description: '2" x 4", 10/Sheet', size: '2" x 4"', perSheet: 10, color: 'White', pageSize: 'Letter', category: 'Shipping', previewColor: '#c084fc' },
  { id: 'avery-48163', name: 'Avery® 48163', description: '2" x 4", 10/Sheet', size: '2" x 4"', perSheet: 10, color: 'White', pageSize: 'Letter', category: 'Shipping', previewColor: '#c084fc' },
  { id: 'avery-48263', name: 'Avery® 48263', description: '2" x 4", 10/Sheet', size: '2" x 4"', perSheet: 10, color: 'White', pageSize: 'Letter', category: 'Shipping', previewColor: '#c084fc' },
  { id: 'avery-48363', name: 'Avery® 48363', description: '2" x 4", 10/Sheet', size: '2" x 4"', perSheet: 10, color: 'White', pageSize: 'Letter', category: 'Shipping', previewColor: '#c084fc' },
  { id: 'avery-48463', name: 'Avery® 48463', description: '2" x 4", 10/Sheet', size: '2" x 4"', perSheet: 10, color: 'White', pageSize: 'Letter', category: 'Shipping', previewColor: '#c084fc' },
  { id: 'avery-48807', name: 'Avery® 48807', description: '2" x 4", 10/Sheet, Matte White', size: '2" x 4"', perSheet: 10, color: 'Matte White', pageSize: 'Letter', category: 'Shipping', previewColor: '#c084fc' },
  { id: 'avery-48862', name: 'Avery® 48862', description: '2" x 4", 10/Sheet', size: '2" x 4"', perSheet: 10, color: 'White', pageSize: 'Letter', category: 'Shipping', previewColor: '#c084fc' },
  { id: 'avery-48863', name: 'Avery® 48863', description: '2" x 4", 10/Sheet', size: '2" x 4"', perSheet: 10, color: 'White', pageSize: 'Letter', category: 'Shipping', previewColor: '#c084fc' },
  { id: 'avery-48864', name: 'Avery® 48864', description: '2" x 4", 10/Sheet', size: '2" x 4"', perSheet: 10, color: 'White', pageSize: 'Letter', category: 'Shipping', previewColor: '#c084fc' },
  { id: 'avery-55163', name: 'Avery® 55163', description: '2" x 4", 10/Sheet', size: '2" x 4"', perSheet: 10, color: 'White', pageSize: 'Letter', category: 'Shipping', previewColor: '#c084fc' },
  { id: 'avery-55463', name: 'Avery® 55463', description: '2" x 4", 10/Sheet', size: '2" x 4"', perSheet: 10, color: 'White', pageSize: 'Letter', category: 'Shipping', previewColor: '#c084fc' },
  { id: 'avery-58163', name: 'Avery® 58163', description: '2" x 4", 10/Sheet', size: '2" x 4"', perSheet: 10, color: 'White', pageSize: 'Letter', category: 'Shipping', previewColor: '#c084fc' },
  { id: 'avery-85563', name: 'Avery® 85563', description: '2" x 4", 10/Sheet', size: '2" x 4"', perSheet: 10, color: 'White', pageSize: 'Letter', category: 'Shipping', previewColor: '#c084fc' },
  { id: 'avery-95523', name: 'Avery® 95523', description: '2" x 4", 10/Sheet', size: '2" x 4"', perSheet: 10, color: 'White', pageSize: 'Letter', category: 'Shipping', previewColor: '#c084fc' },
  { id: 'avery-95910', name: 'Avery® 95910', description: '2" x 4", 10/Sheet', size: '2" x 4"', perSheet: 10, color: 'White', pageSize: 'Letter', category: 'Shipping', previewColor: '#c084fc' },
  { id: 'avery-95945', name: 'Avery® 95945', description: '2" x 4", 10/Sheet', size: '2" x 4"', perSheet: 10, color: 'White', pageSize: 'Letter', category: 'Shipping', previewColor: '#c084fc' },

  // 2" x 4" — Clear
  { id: 'avery-5663', name: 'Avery® 5663', description: '2" x 4", 10/Sheet, Clear', size: '2" x 4"', perSheet: 10, color: 'Clear', pageSize: 'Letter', category: 'Clear', previewColor: '#94a3b8' },
  { id: 'avery-7663', name: 'Avery® 7663', description: '2" x 4", 10/Sheet, Clear', size: '2" x 4"', perSheet: 10, color: 'Clear', pageSize: 'Letter', category: 'Clear', previewColor: '#94a3b8' },
  { id: 'avery-8663', name: 'Avery® 8663', description: '2" x 4", 10/Sheet, Clear', size: '2" x 4"', perSheet: 10, color: 'Clear', pageSize: 'Letter', category: 'Clear', previewColor: '#94a3b8' },
  { id: 'avery-15663', name: 'Avery® 15663', description: '2" x 4", 10/Sheet, Clear', size: '2" x 4"', perSheet: 10, color: 'Clear', pageSize: 'Letter', category: 'Clear', previewColor: '#94a3b8' },
  { id: 'avery-18663', name: 'Avery® 18663', description: '2" x 4", 10/Sheet, Clear', size: '2" x 4"', perSheet: 10, color: 'Clear', pageSize: 'Letter', category: 'Clear', previewColor: '#94a3b8' },
  { id: 'avery-95662', name: 'Avery® 95662', description: '2" x 4", 10/Sheet, Clear', size: '2" x 4"', perSheet: 10, color: 'Clear', pageSize: 'Letter', category: 'Clear', previewColor: '#94a3b8' },

  // 2" x 4" — Neon / Specialty
  { id: 'avery-5523', name: 'Avery® 5523', description: '2" x 4", 10/Sheet', size: '2" x 4"', perSheet: 10, color: 'White', pageSize: 'Letter', category: 'Shipping', previewColor: '#c084fc' },
  { id: 'avery-5978', name: 'Avery® 5978', description: '2" x 4", 10/Sheet, Assorted Neon', size: '2" x 4"', perSheet: 10, color: 'Assorted Neon', pageSize: 'Letter', category: 'Neon', previewColor: '#a3e635' },
  { id: 'avery-5956', name: 'Avery® 5956', description: '2" x 4", 10/Sheet, Assorted Neon', size: '2" x 4"', perSheet: 10, color: 'Assorted Neon', pageSize: 'Letter', category: 'Neon', previewColor: '#a3e635' },
  { id: 'avery-5964', name: 'Avery® 5964', description: '2" x 4", 10/Sheet, Assorted Neon', size: '2" x 4"', perSheet: 10, color: 'Assorted Neon', pageSize: 'Letter', category: 'Neon', previewColor: '#a3e635' },
  { id: 'avery-5974', name: 'Avery® 5974', description: '2" x 4", 10/Sheet, Neon Magenta', size: '2" x 4"', perSheet: 10, color: 'Neon Magenta', pageSize: 'Letter', category: 'Neon', previewColor: '#f0abfc' },
  { id: 'avery-5976', name: 'Avery® 5976', description: '2" x 4", 10/Sheet, Neon Green', size: '2" x 4"', perSheet: 10, color: 'Neon Green', pageSize: 'Letter', category: 'Neon', previewColor: '#4ade80' },
  { id: 'avery-5784', name: 'Avery® 5784', description: '2" x 4", 10/Sheet, Brown Kraft', size: '2" x 4"', perSheet: 10, color: 'Brown Kraft', pageSize: 'Letter', category: 'Specialty', previewColor: '#92400e' },

  // 3-1/3" x 4" — 6 per Sheet
  { id: 'avery-5164', name: 'Avery® 5164', description: '3-1/3" x 4", 6/Sheet', size: '3-1/3" x 4"', perSheet: 6, color: 'White', pageSize: 'Letter', category: 'Shipping', previewColor: '#818cf8' },
  { id: 'avery-8164', name: 'Avery® 8164', description: '3-1/3" x 4", 6/Sheet', size: '3-1/3" x 4"', perSheet: 6, color: 'White', pageSize: 'Letter', category: 'Shipping', previewColor: '#818cf8' },
  { id: 'avery-5264', name: 'Avery® 5264', description: '3-1/3" x 4", 6/Sheet', size: '3-1/3" x 4"', perSheet: 6, color: 'White', pageSize: 'Letter', category: 'Shipping', previewColor: '#818cf8' },
  { id: 'avery-5524', name: 'Avery® 5524', description: '3-1/3" x 4", 6/Sheet', size: '3-1/3" x 4"', perSheet: 6, color: 'White', pageSize: 'Letter', category: 'Shipping', previewColor: '#818cf8' },
  { id: 'avery-6436', name: 'Avery® 6436', description: '3-1/3" x 4", 6/Sheet', size: '3-1/3" x 4"', perSheet: 6, color: 'White', pageSize: 'Letter', category: 'Shipping', previewColor: '#818cf8' },
  { id: 'avery-8254', name: 'Avery® 8254', description: '3-1/3" x 4", 6/Sheet', size: '3-1/3" x 4"', perSheet: 6, color: 'White', pageSize: 'Letter', category: 'Shipping', previewColor: '#818cf8' },
  { id: 'avery-8464', name: 'Avery® 8464', description: '3-1/3" x 4", 6/Sheet', size: '3-1/3" x 4"', perSheet: 6, color: 'White', pageSize: 'Letter', category: 'Shipping', previewColor: '#818cf8' },
  { id: 'avery-8564', name: 'Avery® 8564', description: '3-1/3" x 4", 6/Sheet', size: '3-1/3" x 4"', perSheet: 6, color: 'White', pageSize: 'Letter', category: 'Shipping', previewColor: '#818cf8' },
  { id: 'avery-15264', name: 'Avery® 15264', description: '3-1/3" x 4", 6/Sheet', size: '3-1/3" x 4"', perSheet: 6, color: 'White', pageSize: 'Letter', category: 'Shipping', previewColor: '#818cf8' },
  { id: 'avery-22513', name: 'Avery® 22513', description: '3-1/3" x 4", 6/Sheet', size: '3-1/3" x 4"', perSheet: 6, color: 'White', pageSize: 'Letter', category: 'Shipping', previewColor: '#818cf8' },
  { id: 'avery-45464', name: 'Avery® 45464', description: '3-1/3" x 4", 6/Sheet', size: '3-1/3" x 4"', perSheet: 6, color: 'White', pageSize: 'Letter', category: 'Shipping', previewColor: '#818cf8' },
  { id: 'avery-48264', name: 'Avery® 48264', description: '3-1/3" x 4", 6/Sheet', size: '3-1/3" x 4"', perSheet: 6, color: 'White', pageSize: 'Letter', category: 'Shipping', previewColor: '#818cf8' },
  { id: 'avery-48464', name: 'Avery® 48464', description: '3-1/3" x 4", 6/Sheet', size: '3-1/3" x 4"', perSheet: 6, color: 'White', pageSize: 'Letter', category: 'Shipping', previewColor: '#818cf8' },
  { id: 'avery-48864', name: 'Avery® 48864', description: '3-1/3" x 4", 6/Sheet', size: '3-1/3" x 4"', perSheet: 6, color: 'White', pageSize: 'Letter', category: 'Shipping', previewColor: '#818cf8' },
  { id: 'avery-55164', name: 'Avery® 55164', description: '3-1/3" x 4", 6/Sheet', size: '3-1/3" x 4"', perSheet: 6, color: 'White', pageSize: 'Letter', category: 'Shipping', previewColor: '#818cf8' },
  { id: 'avery-55464', name: 'Avery® 55464', description: '3-1/3" x 4", 6/Sheet', size: '3-1/3" x 4"', perSheet: 6, color: 'White', pageSize: 'Letter', category: 'Shipping', previewColor: '#818cf8' },
  { id: 'avery-58164', name: 'Avery® 58164', description: '3-1/3" x 4", 6/Sheet', size: '3-1/3" x 4"', perSheet: 6, color: 'White', pageSize: 'Letter', category: 'Shipping', previewColor: '#818cf8' },
  { id: 'avery-95905', name: 'Avery® 95905', description: '3-1/3" x 4", 6/Sheet', size: '3-1/3" x 4"', perSheet: 6, color: 'White', pageSize: 'Letter', category: 'Shipping', previewColor: '#818cf8' },
  { id: 'avery-95940', name: 'Avery® 95940', description: '3-1/3" x 4", 6/Sheet', size: '3-1/3" x 4"', perSheet: 6, color: 'White', pageSize: 'Letter', category: 'Shipping', previewColor: '#818cf8' },
  // 3-1/3" x 4" — Clear
  { id: 'avery-5664', name: 'Avery® 5664', description: '3-1/3" x 4", 6/Sheet, Clear', size: '3-1/3" x 4"', perSheet: 6, color: 'Clear', pageSize: 'Letter', category: 'Clear', previewColor: '#94a3b8' },
  { id: 'avery-15264c', name: 'Avery® 15264 (Clear)', description: '3-1/3" x 4", 6/Sheet, Clear', size: '3-1/3" x 4"', perSheet: 6, color: 'Clear', pageSize: 'Letter', category: 'Clear', previewColor: '#94a3b8' },
  { id: 'avery-15664', name: 'Avery® 15664', description: '3-1/3" x 4", 6/Sheet, Clear', size: '3-1/3" x 4"', perSheet: 6, color: 'Clear', pageSize: 'Letter', category: 'Clear', previewColor: '#94a3b8' },
  { id: 'avery-18664', name: 'Avery® 18664', description: '3-1/3" x 4", 6/Sheet, Clear', size: '3-1/3" x 4"', perSheet: 6, color: 'Clear', pageSize: 'Letter', category: 'Clear', previewColor: '#94a3b8' },
  { id: 'avery-88662', name: 'Avery® 88662', description: '3-1/3" x 4", 6/Sheet, Clear', size: '3-1/3" x 4"', perSheet: 6, color: 'Clear', pageSize: 'Letter', category: 'Clear', previewColor: '#94a3b8' },

  // 1-1/3" x 4" — 14 per Sheet
  { id: 'avery-5162', name: 'Avery® 5162', description: '1-1/3" x 4", 14/Sheet', size: '1-1/3" x 4"', perSheet: 14, color: 'White', pageSize: 'Letter', category: 'Address', previewColor: '#34d399' },
  { id: 'avery-8162', name: 'Avery® 8162', description: '1-1/3" x 4", 14/Sheet', size: '1-1/3" x 4"', perSheet: 14, color: 'White', pageSize: 'Letter', category: 'Address', previewColor: '#34d399' },
  { id: 'avery-5262', name: 'Avery® 5262', description: '1-1/3" x 4", 14/Sheet', size: '1-1/3" x 4"', perSheet: 14, color: 'White', pageSize: 'Letter', category: 'Address', previewColor: '#34d399' },
  { id: 'avery-5522', name: 'Avery® 5522', description: '1-1/3" x 4", 14/Sheet', size: '1-1/3" x 4"', perSheet: 14, color: 'White', pageSize: 'Letter', category: 'Address', previewColor: '#34d399' },
  { id: 'avery-5962', name: 'Avery® 5962', description: '1-1/3" x 4", 14/Sheet', size: '1-1/3" x 4"', perSheet: 14, color: 'White', pageSize: 'Letter', category: 'Address', previewColor: '#34d399' },
  { id: 'avery-6445', name: 'Avery® 6445', description: '1-1/3" x 4", 14/Sheet', size: '1-1/3" x 4"', perSheet: 14, color: 'White', pageSize: 'Letter', category: 'Address', previewColor: '#34d399' },
  { id: 'avery-6455', name: 'Avery® 6455', description: '1-1/3" x 4", 14/Sheet', size: '1-1/3" x 4"', perSheet: 14, color: 'White', pageSize: 'Letter', category: 'Address', previewColor: '#34d399' },
  { id: 'avery-8252', name: 'Avery® 8252', description: '1-1/3" x 4", 14/Sheet', size: '1-1/3" x 4"', perSheet: 14, color: 'White', pageSize: 'Letter', category: 'Address', previewColor: '#34d399' },
  { id: 'avery-8462', name: 'Avery® 8462', description: '1-1/3" x 4", 14/Sheet', size: '1-1/3" x 4"', perSheet: 14, color: 'White', pageSize: 'Letter', category: 'Address', previewColor: '#34d399' },
  { id: 'avery-18262', name: 'Avery® 18262', description: '1-1/3" x 4", 14/Sheet', size: '1-1/3" x 4"', perSheet: 14, color: 'White', pageSize: 'Letter', category: 'Address', previewColor: '#34d399' },
  { id: 'avery-48462', name: 'Avery® 48462', description: '1-1/3" x 4", 14/Sheet', size: '1-1/3" x 4"', perSheet: 14, color: 'White', pageSize: 'Letter', category: 'Address', previewColor: '#34d399' },
  { id: 'avery-95522', name: 'Avery® 95522', description: '1-1/3" x 4", 14/Sheet', size: '1-1/3" x 4"', perSheet: 14, color: 'White', pageSize: 'Letter', category: 'Address', previewColor: '#34d399' },
  { id: 'avery-8124', name: 'Avery® 8124', description: '1-1/3" x 4", 14/Sheet, Matte Clear', size: '1-1/3" x 4"', perSheet: 14, color: 'Matte Clear', pageSize: 'Letter', category: 'Clear', previewColor: '#94a3b8' },
  // 1-1/3" x 4" — Clear
  { id: 'avery-5662', name: 'Avery® 5662', description: '1-1/3" x 4", 14/Sheet, Clear', size: '1-1/3" x 4"', perSheet: 14, color: 'Clear', pageSize: 'Letter', category: 'Clear', previewColor: '#94a3b8' },
  { id: 'avery-8662', name: 'Avery® 8662', description: '1-1/3" x 4", 14/Sheet, Clear', size: '1-1/3" x 4"', perSheet: 14, color: 'Clear', pageSize: 'Letter', category: 'Clear', previewColor: '#94a3b8' },
  { id: 'avery-15662', name: 'Avery® 15662', description: '1-1/3" x 4", 14/Sheet, Clear', size: '1-1/3" x 4"', perSheet: 14, color: 'Clear', pageSize: 'Letter', category: 'Clear', previewColor: '#94a3b8' },
  { id: 'avery-18662', name: 'Avery® 18662', description: '1-1/3" x 4", 14/Sheet, Clear', size: '1-1/3" x 4"', perSheet: 14, color: 'Clear', pageSize: 'Letter', category: 'Clear', previewColor: '#94a3b8' },

  // 1" x 4" — 20 per Sheet
  { id: 'avery-5161', name: 'Avery® 5161', description: '1" x 4", 20/Sheet', size: '1" x 4"', perSheet: 20, color: 'White', pageSize: 'Letter', category: 'Address', previewColor: '#2dd4bf' },
  { id: 'avery-8161', name: 'Avery® 8161', description: '1" x 4", 20/Sheet', size: '1" x 4"', perSheet: 20, color: 'White', pageSize: 'Letter', category: 'Address', previewColor: '#2dd4bf' },
  { id: 'avery-5261', name: 'Avery® 5261', description: '1" x 4", 20/Sheet', size: '1" x 4"', perSheet: 20, color: 'White', pageSize: 'Letter', category: 'Address', previewColor: '#2dd4bf' },
  { id: 'avery-5961', name: 'Avery® 5961', description: '1" x 4", 20/Sheet', size: '1" x 4"', perSheet: 20, color: 'White', pageSize: 'Letter', category: 'Address', previewColor: '#2dd4bf' },
  { id: 'avery-8461', name: 'Avery® 8461', description: '1" x 4", 20/Sheet', size: '1" x 4"', perSheet: 20, color: 'White', pageSize: 'Letter', category: 'Address', previewColor: '#2dd4bf' },
  { id: 'avery-15661', name: 'Avery® 15661', description: '1" x 4", 20/Sheet, Clear', size: '1" x 4"', perSheet: 20, color: 'Clear', pageSize: 'Letter', category: 'Clear', previewColor: '#94a3b8' },
  { id: 'avery-18661', name: 'Avery® 18661', description: '1" x 4", 20/Sheet, Clear', size: '1" x 4"', perSheet: 20, color: 'Clear', pageSize: 'Letter', category: 'Clear', previewColor: '#94a3b8' },
  { id: 'avery-5661', name: 'Avery® 5661', description: '1" x 4", 20/Sheet, Clear', size: '1" x 4"', perSheet: 20, color: 'Clear', pageSize: 'Letter', category: 'Clear', previewColor: '#94a3b8' },

  // 1/2" x 1-3/4" — 80 per Sheet
  { id: 'avery-5167', name: 'Avery® 5167', description: '1/2" x 1-3/4", 80/Sheet', size: '1/2" x 1-3/4"', perSheet: 80, color: 'White', pageSize: 'Letter', category: 'Small', previewColor: '#fb923c' },
  { id: 'avery-8167', name: 'Avery® 8167', description: '1/2" x 1-3/4", 80/Sheet', size: '1/2" x 1-3/4"', perSheet: 80, color: 'White', pageSize: 'Letter', category: 'Small', previewColor: '#fb923c' },
  { id: 'avery-5267', name: 'Avery® 5267', description: '1/2" x 1-3/4", 80/Sheet', size: '1/2" x 1-3/4"', perSheet: 80, color: 'White', pageSize: 'Letter', category: 'Small', previewColor: '#fb923c' },
  { id: 'avery-5967', name: 'Avery® 5967', description: '1/2" x 1-3/4", 80/Sheet', size: '1/2" x 1-3/4"', perSheet: 80, color: 'White', pageSize: 'Letter', category: 'Small', previewColor: '#fb923c' },
  { id: 'avery-8927', name: 'Avery® 8927', description: '1/2" x 1-3/4", 80/Sheet', size: '1/2" x 1-3/4"', perSheet: 80, color: 'White', pageSize: 'Letter', category: 'Small', previewColor: '#fb923c' },
  { id: 'avery-18167', name: 'Avery® 18167', description: '1/2" x 1-3/4", 80/Sheet', size: '1/2" x 1-3/4"', perSheet: 80, color: 'White', pageSize: 'Letter', category: 'Small', previewColor: '#fb923c' },
  { id: 'avery-48467', name: 'Avery® 48467', description: '1/2" x 1-3/4", 80/Sheet', size: '1/2" x 1-3/4"', perSheet: 80, color: 'White', pageSize: 'Letter', category: 'Small', previewColor: '#fb923c' },
  { id: 'avery-48867', name: 'Avery® 48867', description: '1/2" x 1-3/4", 80/Sheet', size: '1/2" x 1-3/4"', perSheet: 80, color: 'White', pageSize: 'Letter', category: 'Small', previewColor: '#fb923c' },
  { id: 'avery-5667', name: 'Avery® 5667', description: '1/2" x 1-3/4", 80/Sheet, Clear', size: '1/2" x 1-3/4"', perSheet: 80, color: 'Clear', pageSize: 'Letter', category: 'Clear', previewColor: '#94a3b8' },
  { id: 'avery-8667', name: 'Avery® 8667', description: '1/2" x 1-3/4", 80/Sheet, Clear', size: '1/2" x 1-3/4"', perSheet: 80, color: 'Clear', pageSize: 'Letter', category: 'Clear', previewColor: '#94a3b8' },
  { id: 'avery-15667', name: 'Avery® 15667', description: '1/2" x 1-3/4", 80/Sheet, Clear', size: '1/2" x 1-3/4"', perSheet: 80, color: 'Clear', pageSize: 'Letter', category: 'Clear', previewColor: '#94a3b8' },
  { id: 'avery-18667', name: 'Avery® 18667', description: '1/2" x 1-3/4", 80/Sheet, Clear', size: '1/2" x 1-3/4"', perSheet: 80, color: 'Clear', pageSize: 'Letter', category: 'Clear', previewColor: '#94a3b8' },
  { id: 'avery-38667', name: 'Avery® 38667', description: '1/2" x 1-3/4", 80/Sheet, Clear', size: '1/2" x 1-3/4"', perSheet: 80, color: 'Clear', pageSize: 'Letter', category: 'Clear', previewColor: '#94a3b8' },
  { id: 'avery-95667', name: 'Avery® 95667', description: '1/2" x 1-3/4", 80/Sheet, Clear', size: '1/2" x 1-3/4"', perSheet: 80, color: 'Clear', pageSize: 'Letter', category: 'Clear', previewColor: '#94a3b8' },

  // 2/3" x 1-3/4" — 60 per Sheet
  { id: 'avery-5195', name: 'Avery® 5195', description: '2/3" x 1-3/4", 60/Sheet', size: '2/3" x 1-3/4"', perSheet: 60, color: 'White', pageSize: 'Letter', category: 'Small', previewColor: '#fb923c' },
  { id: 'avery-8195', name: 'Avery® 8195', description: '2/3" x 1-3/4", 60/Sheet', size: '2/3" x 1-3/4"', perSheet: 60, color: 'White', pageSize: 'Letter', category: 'Small', previewColor: '#fb923c' },
  { id: 'avery-5155', name: 'Avery® 5155', description: '2/3" x 1-3/4", 60/Sheet', size: '2/3" x 1-3/4"', perSheet: 60, color: 'White', pageSize: 'Letter', category: 'Small', previewColor: '#fb923c' },
  { id: 'avery-6430', name: 'Avery® 6430', description: '2/3" x 1-3/4", 60/Sheet', size: '2/3" x 1-3/4"', perSheet: 60, color: 'White', pageSize: 'Letter', category: 'Small', previewColor: '#fb923c' },
  { id: 'avery-6523', name: 'Avery® 6523', description: '2/3" x 1-3/4", 60/Sheet', size: '2/3" x 1-3/4"', perSheet: 60, color: 'White', pageSize: 'Letter', category: 'Small', previewColor: '#fb923c' },
  { id: 'avery-6524', name: 'Avery® 6524', description: '2/3" x 1-3/4", 60/Sheet', size: '2/3" x 1-3/4"', perSheet: 60, color: 'White', pageSize: 'Letter', category: 'Small', previewColor: '#fb923c' },
  { id: 'avery-18294', name: 'Avery® 18294', description: '2/3" x 1-3/4", 60/Sheet', size: '2/3" x 1-3/4"', perSheet: 60, color: 'White', pageSize: 'Letter', category: 'Small', previewColor: '#fb923c' },
  { id: 'avery-42895', name: 'Avery® 42895', description: '2/3" x 1-3/4", 60/Sheet', size: '2/3" x 1-3/4"', perSheet: 60, color: 'White', pageSize: 'Letter', category: 'Small', previewColor: '#fb923c' },
  { id: 'avery-48335', name: 'Avery® 48335', description: '2/3" x 1-3/4", 60/Sheet', size: '2/3" x 1-3/4"', perSheet: 60, color: 'White', pageSize: 'Letter', category: 'Small', previewColor: '#fb923c' },
  { id: 'avery-88695', name: 'Avery® 88695', description: '2/3" x 1-3/4", 60/Sheet', size: '2/3" x 1-3/4"', perSheet: 60, color: 'White', pageSize: 'Letter', category: 'Small', previewColor: '#fb923c' },
  { id: 'avery-6520', name: 'Avery® 6520', description: '2/3" x 1-3/4", 60/Sheet, Clear', size: '2/3" x 1-3/4"', perSheet: 60, color: 'Clear', pageSize: 'Letter', category: 'Clear', previewColor: '#94a3b8' },
  { id: 'avery-15695', name: 'Avery® 15695', description: '2/3" x 1-3/4", 60/Sheet, Clear', size: '2/3" x 1-3/4"', perSheet: 60, color: 'Clear', pageSize: 'Letter', category: 'Clear', previewColor: '#94a3b8' },
  { id: 'avery-18695', name: 'Avery® 18695', description: '2/3" x 1-3/4", 60/Sheet, Clear', size: '2/3" x 1-3/4"', perSheet: 60, color: 'Clear', pageSize: 'Letter', category: 'Clear', previewColor: '#94a3b8' },

  // 5-1/2" x 8-1/2" — 2 per Sheet (Half Sheet)
  { id: 'avery-5126', name: 'Avery® 5126', description: '5-1/2" x 8-1/2", 2/Sheet', size: '5-1/2" x 8-1/2"', perSheet: 2, color: 'White', pageSize: 'Letter', category: 'Large', previewColor: '#f87171' },
  { id: 'avery-8126', name: 'Avery® 8126', description: '5-1/2" x 8-1/2", 2/Sheet', size: '5-1/2" x 8-1/2"', perSheet: 2, color: 'White', pageSize: 'Letter', category: 'Large', previewColor: '#f87171' },
  { id: 'avery-5526', name: 'Avery® 5526', description: '5-1/2" x 8-1/2", 2/Sheet', size: '5-1/2" x 8-1/2"', perSheet: 2, color: 'White', pageSize: 'Letter', category: 'Large', previewColor: '#f87171' },
  { id: 'avery-5783', name: 'Avery® 5783', description: '5-1/2" x 8-1/2", 2/Sheet, Brown Kraft', size: '5-1/2" x 8-1/2"', perSheet: 2, color: 'Brown Kraft', pageSize: 'Letter', category: 'Large', previewColor: '#92400e' },
  { id: 'avery-5912', name: 'Avery® 5912', description: '5-1/2" x 8-1/2", 2/Sheet', size: '5-1/2" x 8-1/2"', perSheet: 2, color: 'White', pageSize: 'Letter', category: 'Large', previewColor: '#f87171' },
  { id: 'avery-5917', name: 'Avery® 5917', description: '5-1/2" x 8-1/2", 2/Sheet', size: '5-1/2" x 8-1/2"', perSheet: 2, color: 'White', pageSize: 'Letter', category: 'Large', previewColor: '#f87171' },
  { id: 'avery-6440', name: 'Avery® 6440', description: '5-1/2" x 8-1/2", 2/Sheet', size: '5-1/2" x 8-1/2"', perSheet: 2, color: 'White', pageSize: 'Letter', category: 'Large', previewColor: '#f87171' },
  { id: 'avery-8426', name: 'Avery® 8426', description: '5-1/2" x 8-1/2", 2/Sheet', size: '5-1/2" x 8-1/2"', perSheet: 2, color: 'White', pageSize: 'Letter', category: 'Large', previewColor: '#f87171' },
  { id: 'avery-15516', name: 'Avery® 15516', description: '5-1/2" x 8-1/2", 2/Sheet', size: '5-1/2" x 8-1/2"', perSheet: 2, color: 'White', pageSize: 'Letter', category: 'Large', previewColor: '#f87171' },
  { id: 'avery-18126', name: 'Avery® 18126', description: '5-1/2" x 8-1/2", 2/Sheet', size: '5-1/2" x 8-1/2"', perSheet: 2, color: 'White', pageSize: 'Letter', category: 'Large', previewColor: '#f87171' },
  { id: 'avery-48126', name: 'Avery® 48126', description: '5-1/2" x 8-1/2", 2/Sheet', size: '5-1/2" x 8-1/2"', perSheet: 2, color: 'White', pageSize: 'Letter', category: 'Large', previewColor: '#f87171' },
  { id: 'avery-85783', name: 'Avery® 85783', description: '5-1/2" x 8-1/2", 2/Sheet, Brown Kraft', size: '5-1/2" x 8-1/2"', perSheet: 2, color: 'Brown Kraft', pageSize: 'Letter', category: 'Large', previewColor: '#92400e' },
  { id: 'avery-91041', name: 'Avery® 91041', description: '5-1/2" x 8-1/2", 2/Sheet', size: '5-1/2" x 8-1/2"', perSheet: 2, color: 'White', pageSize: 'Letter', category: 'Large', previewColor: '#f87171' },
  { id: 'avery-95526', name: 'Avery® 95526', description: '5-1/2" x 8-1/2", 2/Sheet', size: '5-1/2" x 8-1/2"', perSheet: 2, color: 'White', pageSize: 'Letter', category: 'Large', previewColor: '#f87171' },
  { id: 'avery-95900', name: 'Avery® 95900', description: '5-1/2" x 8-1/2", 2/Sheet', size: '5-1/2" x 8-1/2"', perSheet: 2, color: 'White', pageSize: 'Letter', category: 'Large', previewColor: '#f87171' },
  { id: 'avery-95930', name: 'Avery® 95930', description: '5-1/2" x 8-1/2", 2/Sheet', size: '5-1/2" x 8-1/2"', perSheet: 2, color: 'White', pageSize: 'Letter', category: 'Large', previewColor: '#f87171' },

  // 3-1/2" x 5" — 4 per Sheet
  { id: 'avery-5168', name: 'Avery® 5168', description: '3-1/2" x 5", 4/Sheet', size: '3-1/2" x 5"', perSheet: 4, color: 'White', pageSize: 'Letter', category: 'Large', previewColor: '#fb7185' },
  { id: 'avery-8168', name: 'Avery® 8168', description: '3-1/2" x 5", 4/Sheet', size: '3-1/2" x 5"', perSheet: 4, color: 'White', pageSize: 'Letter', category: 'Large', previewColor: '#fb7185' },
  { id: 'avery-27950', name: 'Avery® 27950', description: '3-1/2" x 5", 4/Sheet', size: '3-1/2" x 5"', perSheet: 4, color: 'White', pageSize: 'Letter', category: 'Large', previewColor: '#fb7185' },
  { id: 'avery-95935', name: 'Avery® 95935', description: '3-1/2" x 5", 4/Sheet', size: '3-1/2" x 5"', perSheet: 4, color: 'White', pageSize: 'Letter', category: 'Large', previewColor: '#fb7185' },

  // Full Sheet — 1 per Sheet
  { id: 'avery-5165', name: 'Avery® 5165', description: '8-1/2" x 11", 1/Sheet', size: '8-1/2" x 11"', perSheet: 1, color: 'White', pageSize: 'Letter', category: 'Large', previewColor: '#a78bfa' },
  { id: 'avery-8165', name: 'Avery® 8165', description: '8-1/2" x 11", 1/Sheet', size: '8-1/2" x 11"', perSheet: 1, color: 'White', pageSize: 'Letter', category: 'Large', previewColor: '#a78bfa' },
  { id: 'avery-5265', name: 'Avery® 5265', description: '8-1/2" x 11", 1/Sheet', size: '8-1/2" x 11"', perSheet: 1, color: 'White', pageSize: 'Letter', category: 'Large', previewColor: '#a78bfa' },
  { id: 'avery-5353', name: 'Avery® 5353', description: '8-1/2" x 11", 1/Sheet', size: '8-1/2" x 11"', perSheet: 1, color: 'White', pageSize: 'Letter', category: 'Large', previewColor: '#a78bfa' },
  { id: 'avery-8255', name: 'Avery® 8255', description: '8-1/2" x 11", 1/Sheet', size: '8-1/2" x 11"', perSheet: 1, color: 'White', pageSize: 'Letter', category: 'Large', previewColor: '#a78bfa' },
  { id: 'avery-8465', name: 'Avery® 8465', description: '8-1/2" x 11", 1/Sheet', size: '8-1/2" x 11"', perSheet: 1, color: 'White', pageSize: 'Letter', category: 'Large', previewColor: '#a78bfa' },
  { id: 'avery-15265', name: 'Avery® 15265', description: '8-1/2" x 11", 1/Sheet', size: '8-1/2" x 11"', perSheet: 1, color: 'White', pageSize: 'Letter', category: 'Large', previewColor: '#a78bfa' },
  { id: 'avery-18665', name: 'Avery® 18665', description: '8-1/2" x 11", 1/Sheet', size: '8-1/2" x 11"', perSheet: 1, color: 'White', pageSize: 'Letter', category: 'Large', previewColor: '#a78bfa' },
  { id: 'avery-48165', name: 'Avery® 48165', description: '8-1/2" x 11", 1/Sheet', size: '8-1/2" x 11"', perSheet: 1, color: 'White', pageSize: 'Letter', category: 'Large', previewColor: '#a78bfa' },
  { id: 'avery-48809', name: 'Avery® 48809', description: '8-1/2" x 11", 1/Sheet, Matte White', size: '8-1/2" x 11"', perSheet: 1, color: 'Matte White', pageSize: 'Letter', category: 'Large', previewColor: '#a78bfa' },
  { id: 'avery-64506', name: 'Avery® 64506', description: '8-1/2" x 11", 1/Sheet', size: '8-1/2" x 11"', perSheet: 1, color: 'White', pageSize: 'Letter', category: 'Large', previewColor: '#a78bfa' },
  { id: 'avery-95920-full', name: 'Avery® 95920', description: '8-1/2" x 11", 1/Sheet', size: '8-1/2" x 11"', perSheet: 1, color: 'White', pageSize: 'Letter', category: 'Large', previewColor: '#a78bfa' },
  { id: 'avery-8665', name: 'Avery® 8665', description: '8-1/2" x 11", 1/Sheet, Clear', size: '8-1/2" x 11"', perSheet: 1, color: 'Clear', pageSize: 'Letter', category: 'Clear', previewColor: '#94a3b8' },
  { id: 'avery-15665', name: 'Avery® 15665', description: '8-1/2" x 11", 1/Sheet, Clear', size: '8-1/2" x 11"', perSheet: 1, color: 'Clear', pageSize: 'Letter', category: 'Clear', previewColor: '#94a3b8' },

  // Specialty Sizes
  { id: 'avery-5292', name: 'Avery® 5292', description: '4" x 6", 1/Sheet', size: '4" x 6"', perSheet: 1, color: 'White', pageSize: '4" x 6"', category: 'Large', previewColor: '#fb7185' },
  { id: 'avery-22612', name: 'Avery® 22612', description: '2" diameter, 12/Sheet', size: '2" diameter', perSheet: 12, color: 'White', pageSize: 'Letter', category: 'Round', previewColor: '#e879f9' },
  { id: 'avery-5590', name: 'Avery® 5590', description: '1" diameter, 15/Sheet, Gold Foil', size: '1" diameter', perSheet: 15, color: 'Gold Foil', pageSize: '4" x 6"', category: 'Specialty', previewColor: '#fcd34d' },
  { id: 'avery-5589', name: 'Avery® 5589', description: '1" diameter, 15/Sheet, Silver Foil', size: '1" diameter', perSheet: 15, color: 'Silver Foil', pageSize: '4" x 6"', category: 'Specialty', previewColor: '#cbd5e1' },
  { id: 'avery-5868', name: 'Avery® 5868', description: '2" diameter, 4/Sheet, Gold', size: '2" diameter', perSheet: 4, color: 'Gold', pageSize: '4" x 6"', category: 'Round', previewColor: '#fcd34d' },
  { id: 'avery-72450', name: 'Avery® 72450', description: '1-3/5", 6/Sheet, Silver', size: '1-3/5"', perSheet: 6, color: 'Silver', pageSize: '4" x 6"', category: 'Round', previewColor: '#cbd5e1' },
  { id: 'avery-4331', name: 'Avery® 4331', description: '2" x 2-5/8", 15/Sheet, Assorted Colors', size: '2" x 2-5/8"', perSheet: 15, color: 'Assorted Colors', pageSize: 'Letter', category: 'Specialty', previewColor: '#f472b6' },
  { id: 'avery-8987', name: 'Avery® 8987', description: '3/4" x 2-1/4", 30/Sheet, Gold', size: '3/4" x 2-1/4"', perSheet: 30, color: 'Gold', pageSize: 'Letter', category: 'Specialty', previewColor: '#fcd34d' },
  { id: 'avery-8986', name: 'Avery® 8986', description: '3/4" x 2-1/4", 30/Sheet, Silver', size: '3/4" x 2-1/4"', perSheet: 30, color: 'Silver', pageSize: 'Letter', category: 'Specialty', previewColor: '#cbd5e1' },

  // Miscellaneous / Unique Sizes
  { id: 'avery-5351', name: 'Avery® 5351', description: '1" x 2-13/16", 33/Sheet', size: '1" x 2-13/16"', perSheet: 33, color: 'White', pageSize: 'Letter', category: 'Address', previewColor: '#60a5fa' },
  { id: 'avery-5354', name: 'Avery® 5354', description: '1" x 2-13/16", 33/Sheet', size: '1" x 2-13/16"', perSheet: 33, color: 'White', pageSize: 'Letter', category: 'Address', previewColor: '#60a5fa' },
  { id: 'avery-5352', name: 'Avery® 5352', description: '2" x 4-1/4", 10/Sheet', size: '2" x 4-1/4"', perSheet: 10, color: 'White', pageSize: 'Letter', category: 'Shipping', previewColor: '#c084fc' },
  { id: 'avery-5360', name: 'Avery® 5360', description: '1-1/2" x 2-13/16", 21/Sheet', size: '1-1/2" x 2-13/16"', perSheet: 21, color: 'White', pageSize: 'Letter', category: 'Address', previewColor: '#60a5fa' },
  { id: 'avery-5159', name: 'Avery® 5159', description: '1-1/2" x 4", 14/Sheet', size: '1-1/2" x 4"', perSheet: 14, color: 'White', pageSize: 'Letter', category: 'Address', previewColor: '#2dd4bf' },
  { id: 'avery-5259', name: 'Avery® 5259', description: '1-1/2" x 4", 14/Sheet', size: '1-1/2" x 4"', perSheet: 14, color: 'White', pageSize: 'Letter', category: 'Address', previewColor: '#2dd4bf' },
  { id: 'avery-6871', name: 'Avery® 6871', description: '1-1/4" x 2-3/8", 18/Sheet', size: '1-1/4" x 2-3/8"', perSheet: 18, color: 'White', pageSize: 'Letter', category: 'Address', previewColor: '#60a5fa' },
  { id: 'avery-6870', name: 'Avery® 6870', description: '3/4" x 2-1/4", 30/Sheet', size: '3/4" x 2-1/4"', perSheet: 30, color: 'White', pageSize: 'Letter', category: 'Small', previewColor: '#fb923c' },
  { id: 'avery-8257', name: 'Avery® 8257', description: '3/4" x 2-1/4", 30/Sheet', size: '3/4" x 2-1/4"', perSheet: 30, color: 'White', pageSize: 'Letter', category: 'Small', previewColor: '#fb923c' },
  { id: 'avery-6873', name: 'Avery® 6873', description: '2" x 3-3/4", 8/Sheet', size: '2" x 3-3/4"', perSheet: 8, color: 'White', pageSize: 'Letter', category: 'Shipping', previewColor: '#c084fc' },
  { id: 'avery-6874', name: 'Avery® 6874', description: '3" x 3-3/4", 6/Sheet', size: '3" x 3-3/4"', perSheet: 6, color: 'White', pageSize: 'Letter', category: 'Shipping', previewColor: '#818cf8' },
  { id: 'avery-6876', name: 'Avery® 6876', description: '4-3/4" x 7-3/4", 2/Sheet', size: '4-3/4" x 7-3/4"', perSheet: 2, color: 'White', pageSize: 'Letter', category: 'Large', previewColor: '#f87171' },
  { id: 'avery-6878', name: 'Avery® 6878', description: '3-3/4" x 4-3/4", 4/Sheet', size: '3-3/4" x 4-3/4"', perSheet: 4, color: 'White', pageSize: 'Letter', category: 'Large', previewColor: '#fb7185' },
  { id: 'avery-6879', name: 'Avery® 6879', description: '1-1/4" x 3-3/4", 12/Sheet', size: '1-1/4" x 3-3/4"', perSheet: 12, color: 'White', pageSize: 'Letter', category: 'Address', previewColor: '#2dd4bf' },
  { id: 'avery-5821', name: 'Avery® 5821', description: '2-1/2" x 4", 8/Sheet', size: '2-1/2" x 4"', perSheet: 8, color: 'White', pageSize: 'Letter', category: 'Shipping', previewColor: '#c084fc' },
  { id: 'avery-5815', name: 'Avery® 5815', description: '2-1/2" x 4", 8/Sheet', size: '2-1/2" x 4"', perSheet: 8, color: 'White', pageSize: 'Letter', category: 'Shipping', previewColor: '#c084fc' },
  { id: 'avery-5816', name: 'Avery® 5816', description: '2-1/2" x 4", 8/Sheet', size: '2-1/2" x 4"', perSheet: 8, color: 'White', pageSize: 'Letter', category: 'Shipping', previewColor: '#c084fc' },
  { id: 'avery-5817', name: 'Avery® 5817', description: '2-1/2" x 4", 8/Sheet', size: '2-1/2" x 4"', perSheet: 8, color: 'White', pageSize: 'Letter', category: 'Shipping', previewColor: '#c084fc' },
  { id: 'avery-5127', name: 'Avery® 5127', description: '5-1/16" x 7-5/8", 2/Sheet', size: '5-1/16" x 7-5/8"', perSheet: 2, color: 'White', pageSize: 'Letter', category: 'Large', previewColor: '#f87171' },
  { id: 'avery-8127', name: 'Avery® 8127', description: '5-1/16" x 7-5/8", 2/Sheet', size: '5-1/16" x 7-5/8"', perSheet: 2, color: 'White', pageSize: 'Letter', category: 'Large', previewColor: '#f87171' },
  { id: 'avery-5735', name: 'Avery® 5735', description: '1" x 3", 12/Sheet', size: '1" x 3"', perSheet: 12, color: 'White', pageSize: 'Letter', category: 'Address', previewColor: '#2dd4bf' },
  { id: 'avery-8217', name: 'Avery® 8217', description: '7-17/20" x 1-3/4", 5/Sheet', size: '7-17/20" x 1-3/4"', perSheet: 5, color: 'White', pageSize: 'Letter', category: 'Large', previewColor: '#a78bfa' },
  { id: 'avery-22838', name: 'Avery® 22838', description: '7-17/20" x 1-3/4", 5/Sheet', size: '7-17/20" x 1-3/4"', perSheet: 5, color: 'White', pageSize: 'Letter', category: 'Large', previewColor: '#a78bfa' },
  { id: 'avery-8867', name: 'Avery® 8867', description: '2" x 1-3/4", 80/Sheet', size: '2" x 1-3/4"', perSheet: 80, color: 'White', pageSize: 'Letter', category: 'Small', previewColor: '#fb923c' },
  { id: 'avery-82822', name: 'Avery® 82822', description: '2" x 3", 8/Sheet', size: '2" x 3"', perSheet: 8, color: 'White', pageSize: 'Letter', category: 'Shipping', previewColor: '#c084fc' },
  { id: 'avery-5909', name: 'Avery® 5909', description: '1" x 4", 10/Sheet', size: '1" x 4"', perSheet: 10, color: 'White', pageSize: 'Letter', category: 'Address', previewColor: '#2dd4bf' },
  { id: 'avery-5286', name: 'Avery® 5286', description: '3" x 4", 2/Sheet (4" x 6")', size: '3" x 4"', perSheet: 2, color: 'White', pageSize: '4" x 6"', category: 'Large', previewColor: '#fb7185' },
  { id: 'avery-41560', name: 'Avery® 41560', description: '1" x 2-5/8", 4/Sheet (4" x 6"), Ivory', size: '1" x 2-5/8"', perSheet: 4, color: 'Ivory', pageSize: '4" x 6"', category: 'Specialty', previewColor: '#fef9c3' },
];

const CATEGORIES = ['All', 'Favorites', 'Address', 'Shipping', 'Large', 'Small', 'Clear', 'Neon', 'Round', 'Specialty'];

const categoryColors = {
  Address:   '#60a5fa',
  Shipping:  '#c084fc',
  Large:     '#f87171',
  Small:     '#fb923c',
  Clear:     '#94a3b8',
  Neon:      '#4ade80',
  Round:     '#e879f9',
  Specialty: '#fcd34d',
};

export function TemplateSelector({ onSelect, selectedId }) {
  const { profile, toggleFavorite } = useAuth();
  const favorites = profile?.favorites ?? [];

  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = templates.filter((t) => {
    const matchCat =
      activeCategory === 'All'       ? true :
      activeCategory === 'Favorites' ? favorites.includes(t.id) :
      t.category === activeCategory;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      t.name.toLowerCase().includes(q) ||
      t.size.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.pageSize.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  return (
    <section className="template-selector" aria-label="Choose your template">
      <div className="template-selector__toolbar">
        <label className="template-selector__search" htmlFor="template-search">
          <span className="template-selector__search-icon" aria-hidden="true">⌕</span>
          <input
            id="template-search"
            type="text"
            className="template-selector__search-input"
            placeholder={'Search by Avery code, size, or page format'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>

        <p className="template-selector__results">
          {filtered.length === 0 ? 'No templates found' : `${filtered.length} template${filtered.length !== 1 ? 's' : ''} shown`}
        </p>
      </div>

      <div className="template-selector__filters" role="tablist" aria-label="Template categories">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat;
          const count = cat === 'All'
            ? templates.length
            : cat === 'Favorites'
              ? favorites.length
              : templates.filter((template) => template.category === cat).length;

          return (
            <button
              key={cat}
              type="button"
              className={`template-filter ${isActive ? 'template-filter--active' : ''}`}
              onClick={() => setActiveCategory(cat)}
              aria-pressed={isActive}
            >
              <span className="template-filter__label">{cat}</span>
              <span className="template-filter__count">{count}</span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="template-selector__empty">
          <h3 className="template-selector__empty-title">No templates match that filter.</h3>
          <p className="template-selector__empty-copy">
            Try a different Avery number, broaden the category, or clear your search to browse the full library.
          </p>
        </div>
      ) : (
        <div className="template-selector__grid">
          {filtered.map((template) => {
            const isSelected = selectedId === template.id;
            const isFavorite = favorites.includes(template.id);
            const accent = categoryColors[template.category] || '#60a5fa';

            return (
              <article
                key={template.id}
                className={`template-card ${isSelected ? 'template-card--selected' : ''}`}
                onClick={() => onSelect(template)}
                style={{ '--template-accent': accent, '--template-preview': template.previewColor }}
              >
                <button
                  type="button"
                  className={`template-card__favorite ${isFavorite ? 'template-card__favorite--active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(template.id);
                  }}
                  aria-label={isFavorite ? `Remove ${template.name} from favorites` : `Add ${template.name} to favorites`}
                  title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  {isFavorite ? '★' : '☆'}
                </button>

                <div className="template-card__preview" aria-hidden="true">
                  <MiniTemplateSheetPreview template={template} />
                </div>

                <div className="template-card__body">
                  <div className="template-card__meta">
                    <span className="template-card__category">{template.category}</span>
                    <span className="template-card__page">{template.pageSize}</span>
                  </div>

                  <div>
                    <h3 className="template-card__title">{template.name}</h3>
                    <p className="template-card__subtitle">{template.description}</p>
                  </div>

                  <dl className="template-card__specs">
                    <div>
                      <dt>Size</dt>
                      <dd>{template.size}</dd>
                    </div>
                    <div>
                      <dt>Per sheet</dt>
                      <dd>{template.perSheet}</dd>
                    </div>
                    <div>
                      <dt>Material</dt>
                      <dd>{template.color}</dd>
                    </div>
                  </dl>
                </div>

                <div className="template-card__footer">
                  <span className="template-card__cta">{isSelected ? 'Selected' : 'Use template'}</span>
                  <span className="template-card__arrow" aria-hidden="true">→</span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
