'use client'
import { useState, useEffect, useRef } from 'react'

const CommandPalette = ({
  items    = [], // [{ label, description, icon, group, onSelect, keywords }]
  trigger  = ['Meta', 'k'], // key combo
  placeholder = 'Cari perintah...',
}) => {
  const [open, setOpen]     = useState(false)
  const [query, setQuery]   = useState('')
  const [active, setActive] = useState(0)
  const inputRef            = useRef(null)

  // keyboard open/close
  useEffect(() => {
    const down = (e) => {
      if (trigger.every(k => k === 'Meta' ? e.metaKey || e.ctrlKey : e.key === k)) {
        e.preventDefault()
        setOpen(v => !v)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  useEffect(() => { if (open) { setQuery(''); setActive(0); setTimeout(() => inputRef.current?.focus(), 50) } }, [open])

  const filtered = query.trim()
    ? items.filter(item =>
        item.label.toLowerCase().includes(query.toLowerCase()) ||
        item.keywords?.some(k => k.toLowerCase().includes(query.toLowerCase()))
      )
    : items

  // group
  const groups = filtered.reduce((acc, item) => {
    const g = item.group || ''
    if (!acc[g]) acc[g] = []
    acc[g].push(item)
    return acc
  }, {})

  const flat = Object.values(groups).flat()

  const select = (item) => { item.onSelect?.(); setOpen(false) }

  const onKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(v => Math.min(v + 1, flat.length - 1)) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setActive(v => Math.max(v - 1, 0)) }
    if (e.key === 'Enter' && flat[active]) select(flat[active])
  }

  if (!open) return null

  return (
    <div className="cmd-backdrop" onClick={() => setOpen(false)}>
      <div className="cmd-panel" onClick={e => e.stopPropagation()}>
        <div className="cmd-search">
          <i className="fa-solid fa-magnifying-glass cmd-search-icon" />
          <input
            ref={inputRef}
            type="text"
            className="cmd-input"
            placeholder={placeholder}
            value={query}
            onChange={e => { setQuery(e.target.value); setActive(0) }}
            onKeyDown={onKey}
          />
          <kbd className="kbd">Esc</kbd>
        </div>

        <div className="cmd-list">
          {flat.length === 0 && (
            <div className="cmd-empty">Tidak ada hasil untuk "{query}"</div>
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
                    <i className="fa-solid fa-arrow-turn-down cmd-item-enter" />
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CommandPalette