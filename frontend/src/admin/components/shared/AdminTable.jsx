import { ChevronUp, ChevronDown, Search } from 'lucide-react';

/**
 * Reusable admin table with search, sort, pagination, and skeleton loading.
 *
 * Props:
 *   columns  : [{ key, label, sortable?, render?(value, row) => node, width? }]
 *   rows     : array of objects
 *   loading  : boolean
 *   total    : number (total records for pagination info)
 *   page     : number (1-based)
 *   pageSize : number
 *   onPage   : (n) => void
 *   sortKey  : string
 *   sortDir  : 'asc' | 'desc'
 *   onSort   : (key) => void
 *   search   : string
 *   onSearch : (val) => void
 *   searchPlaceholder : string
 *   toolbar  : React node (extra toolbar content on the right)
 *   emptyText: string
 */
export default function AdminTable({
  columns = [],
  rows = [],
  loading = false,
  total = 0,
  page = 1,
  pageSize = 25,
  onPage,
  sortKey,
  sortDir,
  onSort,
  search = '',
  onSearch,
  searchPlaceholder = 'Search…',
  toolbar,
  emptyText = 'No records found.',
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to   = Math.min(page * pageSize, total);

  function SortIcon({ col }) {
    if (!col.sortable) return null;
    if (sortKey !== col.key) return <ChevronUp size={12} style={{ opacity: 0.3 }} />;
    return sortDir === 'asc'
      ? <ChevronUp size={12} style={{ color: 'var(--acc-prim-lt)' }} />
      : <ChevronDown size={12} style={{ color: 'var(--acc-prim-lt)' }} />;
  }

  const skeletonRows = Array.from({ length: pageSize > 10 ? 10 : pageSize });

  return (
    <div className="adm-table-wrap">
      {/* Toolbar */}
      {(onSearch || toolbar) && (
        <div className="adm-table-toolbar">
          {onSearch && (
            <div className="adm-table-search">
              <Search size={14} color="var(--text-muted)" />
              <input
                value={search}
                onChange={(e) => onSearch(e.target.value)}
                placeholder={searchPlaceholder}
              />
            </div>
          )}
          {toolbar && <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>{toolbar}</div>}
        </div>
      )}

      {/* Table */}
      <div className="adm-table-overflow">
        <table className="adm-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={col.sortable ? 'sortable' : ''}
                  style={{ width: col.width }}
                  onClick={() => col.sortable && onSort?.(col.key)}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                    {col.label}
                    <SortIcon col={col} />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              skeletonRows.map((_, i) => (
                <tr key={i}>
                  {columns.map((col) => (
                    <td key={col.key}>
                      <div className="adm-skeleton" style={{ width: '70%', opacity: 0.6 - i * 0.04 }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="adm-table-empty">{emptyText}</td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr key={row.id ?? i}>
                  {columns.map((col) => (
                    <td key={col.key}>
                      {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {onPage && (
        <div className="adm-pagination">
          <span className="adm-pagination-info">
            {total === 0 ? 'No records' : `${from}–${to} of ${total}`}
          </span>
          <div className="adm-pagination-btns">
            <button className="adm-page-btn" disabled={page <= 1} onClick={() => onPage(page - 1)}>← Prev</button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let p;
              if (totalPages <= 7) { p = i + 1; }
              else if (page <= 4)  { p = i + 1; if (i === 6) p = totalPages; }
              else if (page >= totalPages - 3) { p = totalPages - 6 + i; if (i === 0) p = 1; }
              else { const mid = [1, page - 2, page - 1, page, page + 1, page + 2, totalPages]; p = mid[i]; }
              return (
                <button
                  key={p}
                  className={`adm-page-btn ${p === page ? 'adm-page-btn--active' : ''}`}
                  onClick={() => onPage(p)}
                >
                  {p}
                </button>
              );
            })}
            <button className="adm-page-btn" disabled={page >= totalPages} onClick={() => onPage(page + 1)}>Next →</button>
          </div>
        </div>
      )}
    </div>
  );
}
