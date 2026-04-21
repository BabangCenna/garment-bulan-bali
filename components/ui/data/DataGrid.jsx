// components/ui/data/DataGrid.jsx
'use client'
import { useState, useCallback } from 'react'
import Button from '@/components/ui/button/Button'

const DataGrid = ({
  columns  = [], // [{ key, label, width, type, editable, options, render }]
  data     = [],
  onChange,      // (updatedRows) => void
  onSave,        // async (updatedRows) => void
  addable  = true,
  deletable = true,
  emptyRow = {},
  className = '',
}) => {
  const [rows,    setRows]    = useState(data)
  const [editing, setEditing] = useState(null) // { row, col }
  const [saving,  setSaving]  = useState(false)
  const [dirty,   setDirty]   = useState(false)

  const updateCell = useCallback((rowIdx, key, val) => {
    setRows(prev => {
      const next = prev.map((r, i) => i === rowIdx ? { ...r, [key]: val } : r)
      onChange?.(next)
      return next
    })
    setDirty(true)
  }, [onChange])

  const addRow = () => {
    setRows(prev => {
      const next = [...prev, { _id: Date.now(), ...emptyRow }]
      onChange?.(next)
      return next
    })
    setDirty(true)
  }

  const deleteRow = (rowIdx) => {
    setRows(prev => {
      const next = prev.filter((_, i) => i !== rowIdx)
      onChange?.(next)
      return next
    })
    setDirty(true)
  }

  const handleSave = async () => {
    if (!onSave) return
    setSaving(true)
    try {
      await onSave(rows)
      setDirty(false)
    } finally {
      setSaving(false)
    }
  }

  const isEditing = (r, c) => editing?.row === r && editing?.col === c

  const renderCell = (row, rowIdx, col) => {
    const val = row[col.key] ?? ''
    if (!col.editable) {
      return col.render
        ? col.render(val, row, rowIdx)
        : <span className="datagrid-cell-text">{val}</span>
    }

    if (isEditing(rowIdx, col.key)) {
      if (col.type === 'select' && col.options) {
        return (
          <select
            autoFocus
            className="datagrid-cell-input"
            value={val}
            onChange={e => updateCell(rowIdx, col.key, e.target.value)}
            onBlur={() => setEditing(null)}
          >
            {col.options.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        )
      }
      return (
        <input
          autoFocus
          type={col.type ?? 'text'}
          className="datagrid-cell-input"
          value={val}
          onChange={e => updateCell(rowIdx, col.key, e.target.value)}
          onBlur={() => setEditing(null)}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Escape') setEditing(null) }}
        />
      )
    }

    return (
      <div
        className="datagrid-cell-display"
        onClick={() => setEditing({ row: rowIdx, col: col.key })}
        title="Klik untuk edit"
      >
        {col.render ? col.render(val, row, rowIdx) : (val === '' ? <span className="datagrid-cell-empty">—</span> : String(val))}
        <i className="fa-solid fa-pen datagrid-edit-icon" />
      </div>
    )
  }

  return (
    <div className={['datagrid-wrap', className].filter(Boolean).join(' ')}>
      {/* toolbar */}
      {(addable || onSave) && (
        <div className="datagrid-toolbar">
          {addable && (
            <Button size="sm" variant="secondary" leftIcon={<i className="fa-solid fa-plus" />} onClick={addRow}>
              Tambah Baris
            </Button>
          )}
          {onSave && (
            <Button
              size="sm"
              variant="primary"
              loading={saving}
              disabled={!dirty}
              leftIcon={<i className="fa-solid fa-floppy-disk" />}
              onClick={handleSave}
            >
              {dirty ? 'Simpan Perubahan' : 'Tersimpan'}
            </Button>
          )}
          {dirty && (
            <span className="datagrid-dirty-badge">
              <i className="fa-solid fa-circle" style={{ fontSize: 7, color: 'var(--color-warning)' }} />
              Ada perubahan belum disimpan
            </span>
          )}
        </div>
      )}

      {/* table */}
      <div className="datagrid-scroll">
        <table className="datagrid">
          <thead>
            <tr>
              <th className="datagrid-th datagrid-th-no">#</th>
              {columns.map(col => (
                <th
                  key={col.key}
                  className="datagrid-th"
                  style={{ width: col.width, minWidth: col.width ?? 120 }}
                >
                  {col.label}
                  {col.editable && (
                    <i className="fa-solid fa-pen-to-square" style={{ fontSize: 9, marginLeft: 5, opacity: .5 }} />
                  )}
                </th>
              ))}
              {deletable && <th className="datagrid-th datagrid-th-action" />}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 2} className="datagrid-empty">
                  <i className="fa-regular fa-folder-open" style={{ fontSize: 20 }} />
                  <span>Belum ada data. Klik "Tambah Baris" untuk mulai.</span>
                </td>
              </tr>
            ) : (
              rows.map((row, rowIdx) => (
                <tr key={row._id ?? rowIdx} className="datagrid-row">
                  <td className="datagrid-td datagrid-td-no">{rowIdx + 1}</td>
                  {columns.map(col => (
                    <td key={col.key} className="datagrid-td">
                      {renderCell(row, rowIdx, col)}
                    </td>
                  ))}
                  {deletable && (
                    <td className="datagrid-td datagrid-td-action">
                      <button
                        type="button"
                        className="datagrid-delete-btn"
                        onClick={() => deleteRow(rowIdx)}
                        title="Hapus baris"
                      >
                        <i className="fa-solid fa-trash" />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* footer info */}
      <div className="datagrid-footer">
        {rows.length} baris
        {deletable && <span> · Klik sel untuk edit</span>}
      </div>
    </div>
  )
}

export default DataGrid