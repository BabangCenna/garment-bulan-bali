'use client'
import { useState, useMemo } from 'react'
import Table from './Table'

const DataTable = ({
  columns  = [],
  data     = [],
  loading  = false,
  pageSize = 10,
  searchable = true,
  searchPlaceholder = 'Cari...',
  searchKeys = [],   // keys to search in, default all string keys
  toolbar,           // extra JSX di kanan search
  empty,
  striped,
  bordered,
  compact,
  className = '',
}) => {
  const [search, setSearch]   = useState('')
  const [page, setPage]       = useState(1)
  const [perPage, setPerPage] = useState(pageSize)

  const keys = searchKeys.length
    ? searchKeys
    : columns.filter(c => !c.render).map(c => c.key)

  const filtered = useMemo(() => {
    if (!search.trim()) return data
    const q = search.toLowerCase()
    return data.filter(row =>
      keys.some(k => String(row[k] ?? '').toLowerCase().includes(q))
    )
  }, [data, search, keys])

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const paginated  = filtered.slice((page - 1) * perPage, page * perPage)

  const changePage = (p) => setPage(Math.min(Math.max(1, p), totalPages))

  const from = filtered.length === 0 ? 0 : (page - 1) * perPage + 1
  const to   = Math.min(page * perPage, filtered.length)

  return (
    <div className={['datatable', className].filter(Boolean).join(' ')}>
      {(searchable || toolbar) && (
        <div className="datatable-toolbar">
          {searchable && (
            <div className="input-wrap datatable-search">
              <span className="slot-icon left"><i className="fa-solid fa-magnifying-glass" /></span>
              <input
                type="search"
                className="input-base input-default input-md input-icon-left"
                placeholder={searchPlaceholder}
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }}
              />
            </div>
          )}
          {toolbar && <div className="datatable-toolbar-extra">{toolbar}</div>}
        </div>
      )}

      <Table
        columns={columns}
        data={paginated}
        loading={loading}
        empty={empty}
        striped={striped}
        bordered={bordered}
        compact={compact}
      />

      <div className="datatable-footer">
        <div className="datatable-info">
          {filtered.length === 0
            ? 'Tidak ada data'
            : `Menampilkan ${from}–${to} dari ${filtered.length} data`
          }
        </div>
        <div className="datatable-pagination">
          <select
            className="input-base input-default input-sm datatable-perpage"
            value={perPage}
            onChange={e => { setPerPage(Number(e.target.value)); setPage(1) }}
          >
            {[5, 10, 25, 50, 100].map(n => (
              <option key={n} value={n}>{n} / hal</option>
            ))}
          </select>
          <button className="btn btn-secondary btn-sm" onClick={() => changePage(1)} disabled={page === 1}>
            <i className="fa-solid fa-angles-left" />
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => changePage(page - 1)} disabled={page === 1}>
            <i className="fa-solid fa-angle-left" />
          </button>
          <span className="datatable-page-info">{page} / {totalPages}</span>
          <button className="btn btn-secondary btn-sm" onClick={() => changePage(page + 1)} disabled={page === totalPages}>
            <i className="fa-solid fa-angle-right" />
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => changePage(totalPages)} disabled={page === totalPages}>
            <i className="fa-solid fa-angles-right" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default DataTable