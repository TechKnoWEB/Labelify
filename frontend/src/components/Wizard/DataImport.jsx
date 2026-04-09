import { useState, useRef } from 'react';
import { API_BASE } from '../../lib/api';

export function DataImport({ editorFields, onComplete }) {
  const [csvData, setCsvData] = useState(null);
  const [mappings, setMappings] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const processFile = async (file) => {
    if (!file) return;
    const name = file.name.toLowerCase();
    const isXlsx = name.endsWith('.xlsx') || name.endsWith('.xls');
    const isCsv  = name.endsWith('.csv');
    if (!isCsv && !isXlsx) {
      setError('Please upload a .csv, .xls, or .xlsx file.');
      return;
    }
    setIsUploading(true);
    setError('');
    const formData = new FormData();
    formData.append('file', file);
    const endpoint = isXlsx ? 'parse-xlsx' : 'parse-csv';
    try {
      const res = await fetch(`${API_BASE}/api/${endpoint}`, {
        method: 'POST',
        body: formData,
      });
      const text = await res.text();
      if (!text) throw new Error('Server returned an empty response. Check that VITE_BACKEND_URL is correct and the backend is running.');
      let data;
      try { data = JSON.parse(text); } catch { throw new Error('Server returned an unexpected response (not JSON). The backend URL may be wrong.'); }
      if (!res.ok) throw new Error(data.error || 'Parse failed');
      setCsvData(data);
      // Auto-map fields to headers by keyword match
      const initial = {};
      editorFields.forEach(field => {
        const keyword = field.content.toLowerCase().split(' ')[0];
        const match = data.headers.find(h => h.toLowerCase().includes(keyword));
        if (match) initial[field.id] = match;
      });
      setMappings(initial);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInput = (e) => processFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    processFile(e.dataTransfer.files[0]);
  };

  const handleMappingChange = (fieldId, headerValue) => {
    setMappings(prev => ({ ...prev, [fieldId]: headerValue }));
  };

  const handleGenerate = () => {
    onComplete(csvData, mappings);
  };

  return (
    <div className="glass" style={{ padding: '2.5rem' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '2rem', fontWeight: 700 }}>Step 3: Mail Merge (Data Mapping)</h2>

      {!csvData ? (
        <div>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: '4rem',
              border: `2px dashed ${dragOver ? 'var(--accent-primary)' : 'var(--border-color)'}`,
              borderRadius: '16px',
              textAlign: 'center',
              background: dragOver ? 'rgba(59,130,246,0.07)' : 'rgba(0,0,0,0.1)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📄</div>
            <div style={{ fontSize: '1.25rem', marginBottom: '0.75rem', fontWeight: 600 }}>
              {isUploading ? 'Parsing file...' : 'Upload your recipient data'}
            </div>
            <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              Drag & drop here, or click to browse
            </p>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.78rem' }}>
              Supported formats: <strong style={{ color: 'var(--text-secondary)' }}>.csv &nbsp;·&nbsp; .xls &nbsp;·&nbsp; .xlsx</strong>
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xls,.xlsx"
              onChange={handleFileInput}
              style={{ display: 'none' }}
            />
            <span className="btn-primary" style={{ pointerEvents: 'none', display: 'inline-block' }}>
              {isUploading ? 'Parsing...' : 'Select File'}
            </span>
          </div>
          {error && (
            <div style={{ marginTop: '1rem', color: '#f87171', fontSize: '0.875rem', textAlign: 'center' }}>
              {error}
            </div>
          )}
        </div>
      ) : (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
            {/* Field Mapping */}
            <div>
              <h3 style={{ marginBottom: '1.5rem' }}>Map Fields to Columns</h3>
              {editorFields.map(field => (
                <div key={field.id} style={{ marginBottom: '1.25rem' }}>
                  <label className="input-label" style={{ fontWeight: 700, color: 'white' }}>
                    "{field.content}"
                  </label>
                  <select
                    className="input-field"
                    value={mappings[field.id] || ''}
                    onChange={(e) => handleMappingChange(field.id, e.target.value)}
                  >
                    <option value="">-- Choose Data Column --</option>
                    {csvData.headers.map(header => (
                      <option key={header} value={header}>{header}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            {/* CSV Preview */}
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '12px' }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>
                Data Preview ({csvData.rows.length} rows)
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
                      {csvData.headers.slice(0, 4).map(h => (
                        <th key={h} style={{ padding: '6px 8px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                      {csvData.headers.length > 4 && <th style={{ padding: '6px 8px', color: 'var(--text-muted)' }}>…</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {csvData.rows.slice(0, 5).map((row, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        {row.slice(0, 4).map((cell, j) => (
                          <td key={j} style={{ padding: '6px 8px', color: 'var(--text-muted)', whiteSpace: 'nowrap', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cell}</td>
                        ))}
                        {row.length > 4 && <td style={{ padding: '6px 8px' }}>…</td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {csvData.rows.length > 5 && (
                <p style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  + {csvData.rows.length - 5} more rows
                </p>
              )}
            </div>
          </div>

          <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              className="btn-primary"
              style={{ backgroundColor: 'transparent', border: '1px solid var(--border-color)' }}
              onClick={() => { setCsvData(null); setError(''); }}
            >
              &larr; Switch File
            </button>
            <button
              className="btn-primary"
              style={{ padding: '0.75rem 3rem' }}
              onClick={handleGenerate}
            >
              Generate Labels &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
