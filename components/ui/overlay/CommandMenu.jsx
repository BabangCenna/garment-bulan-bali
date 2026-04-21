'use client'
import { useState, useEffect, useRef } from 'react'

// Versi standalone (non-overlay) — bisa diembed di mana saja
// Untuk versi overlay gunakan CommandPalette di navigation
const CommandMenu = ({
  items        = [], // [{ label, description, icon, group, onSelect, keywords }]
  placeholder  = 'Cari...',
  maxHeight    = 280,
  className    = '',
}) => {
  const [query,   setQuery]   = useState('')
  const [active,  setActive]  = useState(0)
  const inputRef              = useRef(null)

  const filtered = query.trim()
    ? items.filter(item =>
        item.label.toLowerCase().includes(query.toLowerCase()) ||
        item.keywords?.some(k => k.toLowerCase().includes(query.toLowerCase()))
      )
    : items

  const groups = filtered.reduce((acc, item) => {
    const g = item.group || ''
    if (!acc[g]) acc[g] = []
    acc[g].push(item)
    return acc
  }, {})

  const flat = Object.values(groups).flat()

  const select = (item) => { item.onSelect?.(); setQuery('') }

  const onKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(v => Math.min(v + 1, flat.length - 1)) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setActive(v => Math.max(v - 1, 0)) }
    if (e.key === 'Enter' && flat[active]) select(flat[active])
  }

  useEffect(() => { setActive(0) }, [query])

  return (
    <div className={['cmd-menu', className].filter(Boolean).join(' ')}>
      <div className="cmd-menu-search">
        <i className="fa-solid fa-magnifying-glass" style={{ color: 'var(--color-text-muted)', fontSize: 14 }} />
        <input
          ref={inputRef}
          type="text"
          className="cmd-input"
          placeholder={placeholder}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={onKey}
        />
        {query && (
          <button type="button" className="combobox-clear" onClick={() => setQuery('')}>
            <i className="fa-solid fa-xmark" />
          </button>
        )}
      </div>
      <div className="cmd-menu-list" style={{ maxHeight }}>
        {flat.length === 0 && (
          <div className="cmd-empty">Tidak ada hasil{query ? ` untuk "${query}"` : ''}</div>
        )}
        {Object.entries(groups).map(([group, groupItems]) => (
          <div key={group}>
            {group && <div className="cmd-group-label">{group}</div>}
            {groupItems.map((item) => {
              const idx = flat.indexOf(item)
              return (
                <button
                  key={idx}
                  type="button"
                  className={['cmd-item', idx === active ? 'cmd-item-active' : ''].filter(Boolean).join(' ')}
                  onClick={() => select(item)}
                  onMouseEnter={() => setActive(idx)}
                >
                  {item.icon && <span className="cmd-item-icon">{item.icon}</span>}
                  <span className="cmd-item-body">
                    <span className="cmd-item-label">{item.label}</span>
                    {item.description && <span className="cmd-item-desc">{item.description}</span>}
                  </span>
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

export default CommandMenu