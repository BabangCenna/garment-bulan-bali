// components/ui/form/FilterBar.jsx
'use client'
import { useState } from 'react'

const FilterBar = ({
  filters   = [], // [{ key, label, value, render }]
  onRemove,       // (key) => void
  onClearAll,
  className = '',
}) => {
  const active = filters.filter(f => f.value !== undefined && f.value !== null && f.value !== '')
  if (active.length === 0) return null

  return (
    <div className={['filter-bar', className].filter(Boolean).join(' ')}>
      <span className="filter-bar-label">
        <i className="fa-solid fa-filter" />
        Filter aktif:
      </span>
      <div className="filter-bar-chips">
        {active.map(f => (
          <span key={f.key} className="filter-chip">
            <span className="filter-chip-label">{f.label}:</span>
            <span className="filter-chip-value">
              {f.render ? f.render(f.value) : String(f.value)}
            </span>
            <button
              type="button"
              className="filter-chip-remove"
              onClick={() => onRemove?.(f.key)}
            >
              <i className="fa-solid fa-xmark" />
            </button>
          </span>
        ))}
      </div>
      {active.length > 1 && (
        <button type="button" className="filter-bar-clear" onClick={onClearAll}>
          <i className="fa-solid fa-xmark" />
          Hapus semua
        </button>
      )}
    </div>
  )
}

export default FilterBar