'use client'
import { useState, useRef, useEffect } from 'react'

const Combobox = ({
  label,
  hint,
  error,
  required,
  options      = [], // [{ value, label, description, icon, disabled }]
  value,
  onChange,
  placeholder  = 'Ketik untuk mencari...',
  size         = 'md',
  clearable    = true,
  loading      = false,
  emptyText    = 'Tidak ada hasil',
  id,
  className    = '',
}) => {
  const [query,   setQuery]   = useState('')
  const [open,    setOpen]    = useState(false)
  const [focused, setFocused] = useState(null)
  const ref      = useRef(null)
  const inputRef = useRef(null)

  const selected = options.find(o => o.value === value)

  const filtered = query.trim()
    ? options.filter(o =>
        o.label.toLowerCase().includes(query.toLowerCase()) && !o.disabled
      )
    : options.filter(o => !o.disabled)

  useEffect(() => {
    const handler = (e) => { if (!ref.current?.contains(e.target)) close() }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const open_ = () => {
    setOpen(true)
    setQuery('')
    setFocused(null)
  }

  const close = () => {
    setOpen(false)
    setQuery('')
  }

  const select = (opt) => {
    onChange?.(opt.value)
    close()
  }

  const clear = (e) => {
    e.stopPropagation()
    onChange?.(null)
    setQuery('')
  }

  const onKey = (e) => {
    if (!open) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setFocused(v => Math.min((v ?? -1) + 1, filtered.length - 1)) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setFocused(v => Math.max((v ?? 0) - 1, 0)) }
    if (e.key === 'Enter' && focused !== null && filtered[focused]) select(filtered[focused])
    if (e.key === 'Escape') close()
  }

  const sizeClass = { sm: 'input-sm', md: 'input-md', lg: 'input-lg' }[size]

  return (
    <div className={['form-group', className].filter(Boolean).join(' ')} ref={ref}>
      {label && (
        <label htmlFor={id} className="form-label">
          {label}{required && <span className="req"> *</span>}
        </label>
      )}

      <div className={['combobox-control input-default', sizeClass, open ? 'is-open' : '', error ? 'is-error' : ''].filter(Boolean).join(' ')} onClick={open_}>
        {open ? (
          <input
            ref={inputRef}
            autoFocus
            type="text"
            className="combobox-search"
            placeholder={placeholder}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={onKey}
            onClick={e => e.stopPropagation()}
          />
        ) : (
          <span className={selected ? 'combobox-value' : 'combobox-placeholder'}>
            {selected?.icon && <span className="combobox-value-icon">{selected.icon}</span>}
            {selected?.label ?? placeholder}
          </span>
        )}
        <div className="combobox-right">
          {clearable && value && !open && (
            <button type="button" className="combobox-clear" onClick={clear}>
              <i className="fa-solid fa-xmark" />
            </button>
          )}
          {loading
            ? <i className="fa-solid fa-circle-notch fa-spin" style={{ color: 'var(--color-text-muted)', fontSize: 13 }} />
            : <i className={`fa-solid fa-chevron-${open ? 'up' : 'down'}`} style={{ color: 'var(--color-text-muted)', fontSize: 12 }} />
          }
        </div>
      </div>

      {open && (
        <div className="combobox-dropdown">
          {filtered.length === 0
            ? <div className="combobox-empty">{loading ? 'Memuat...' : emptyText}</div>
            : filtered.map((opt, i) => (
                <button
                  key={opt.value}
                  type="button"
                  className={['combobox-option', i === focused ? 'combobox-option-focused' : '', opt.value === value ? 'combobox-option-selected' : ''].filter(Boolean).join(' ')}
                  onClick={() => select(opt)}
                  onMouseEnter={() => setFocused(i)}
                >
                  {opt.icon && <span className="combobox-option-icon">{opt.icon}</span>}
                  <span className="combobox-option-body">
                    <span className="combobox-option-label">{opt.label}</span>
                    {opt.description && <span className="combobox-option-desc">{opt.description}</span>}
                  </span>
                  {opt.value === value && <i className="fa-solid fa-check combobox-option-check" />}
                </button>
              ))
          }
        </div>
      )}

      {error && <div className="form-error"><i className="fa-solid fa-circle-exclamation" />{error}</div>}
      {hint && !error && <div className="form-hint">{hint}</div>}
    </div>
  )
}

export default Combobox