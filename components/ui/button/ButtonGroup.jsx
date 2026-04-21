// components/ui/button/ButtonGroup.jsx
'use client'
import { forwardRef } from 'react'

// ─── TOOLBAR MODE ─────────────────────────────────────────────────
// Beberapa tombol masing-masing punya aksi berbeda, tidak ada "active"
export const ButtonToolbar = ({
  items    = [], // [{ label, icon, onClick, variant, disabled, danger, divider, tooltip }]
  size     = 'md',
  variant  = 'secondary',
  vertical = false,
  className = '',
}) => (
  <div
    className={['btn-group', vertical ? 'btn-group-vertical' : '', className].filter(Boolean).join(' ')}
    role="toolbar"
  >
    {items.map((item, i) => {
      if (item.divider) {
        return (
          <div
            key={i}
            className="btn-group-divider"
            style={{
              width:      vertical ? '100%' : 1,
              height:     vertical ? 1 : 'auto',
              background: 'var(--color-border)',
              alignSelf:  'stretch',
              margin:     vertical ? '2px 0' : '0 2px',
              flexShrink: 0,
            }}
          />
        )
      }

      const btnVariant = item.danger ? 'danger' : (item.variant ?? variant)

      return (
        <button
          key={i}
          type="button"
          disabled={item.disabled}
          title={item.tooltip}
          onClick={item.onClick}
          className={[
            'btn',
            `btn-${btnVariant}`,
            `btn-${size}`,
          ].join(' ')}
          style={{ borderRadius: 0 }}
        >
          {item.icon && (
            <span className="btn-icon">
              {item.icon}
            </span>
          )}
          {item.label && <span>{item.label}</span>}
        </button>
      )
    })}
  </div>
)

// ─── TOGGLE MODE ──────────────────────────────────────────────────
// Pilihan eksklusif — satu aktif sekaligus (radio behaviour)
// Atau multi-pilih (checkbox behaviour)
export const ButtonToggleGroup = ({
  items    = [], // [{ value, label, icon, disabled }]
  value,         // single mode: string | multi mode: string[]
  onChange,      // single: (val) => void | multi: (vals) => void
  multi    = false,
  size     = 'md',
  variant  = 'secondary',
  activeVariant = 'primary',
  vertical = false,
  className = '',
}) => {
  const isActive = (val) =>
    multi
      ? Array.isArray(value) && value.includes(val)
      : value === val

  const handleClick = (val) => {
    if (multi) {
      const current = Array.isArray(value) ? value : []
      const next    = current.includes(val)
        ? current.filter(v => v !== val)
        : [...current, val]
      onChange?.(next)
    } else {
      onChange?.(val)
    }
  }

  return (
    <div
      className={['btn-group', vertical ? 'btn-group-vertical' : '', className].filter(Boolean).join(' ')}
      role={multi ? 'group' : 'radiogroup'}
    >
      {items.map((item, i) => {
        const active = isActive(item.value)
        return (
          <button
            key={item.value ?? i}
            type="button"
            disabled={item.disabled}
            onClick={() => !item.disabled && handleClick(item.value)}
            aria-pressed={active}
            className={[
              'btn',
              active ? `btn-${activeVariant}` : `btn-${variant}`,
              `btn-${size}`,
            ].join(' ')}
            style={{ borderRadius: 0 }}
          >
            {item.icon && (
              <span className="btn-icon">
                {item.icon}
              </span>
            )}
            {item.label && <span>{item.label}</span>}
          </button>
        )
      })}
    </div>
  )
}

// ─── COMBINED DEFAULT EXPORT ───────────────────────────────────────
// Pakai mode="toolbar" atau mode="toggle"
const ButtonGroup = ({
  mode     = 'toolbar',  // 'toolbar' | 'toggle'
  ...props
}) => {
  if (mode === 'toggle') return <ButtonToggleGroup {...props} />
  return <ButtonToolbar {...props} />
}

export default ButtonGroup