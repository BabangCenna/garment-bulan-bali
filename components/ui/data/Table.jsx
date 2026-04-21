'use client'

const Table = ({
  columns = [], // [{ key, label, width, align, render }]
  data    = [],
  striped  = false,
  bordered = false,
  hover    = true,
  compact  = false,
  loading  = false,
  empty    = 'Tidak ada data',
  className = '',
}) => {
  return (
    <div className="table-responsive">
      <table className={[
        'table',
        striped  ? 'table-striped'  : '',
        bordered ? 'table-bordered' : '',
        hover    ? 'table-hover'    : '',
        compact  ? 'table-compact'  : '',
        className,
      ].filter(Boolean).join(' ')}>
        <thead>
          <tr>
            {columns.map(col => (
              <th
                key={col.key}
                style={{ width: col.width, textAlign: col.align || 'left' }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="table-state-cell">
                <i className="fa-solid fa-circle-notch fa-spin" />
                <span>Memuat data...</span>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="table-state-cell">
                <i className="fa-regular fa-folder-open" style={{ fontSize: 24 }} />
                <span>{empty}</span>
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr key={row.id ?? i}>
                {columns.map(col => (
                  <td key={col.key} style={{ textAlign: col.align || 'left' }}>
                    {col.render ? col.render(row[col.key], row, i) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

export default Table