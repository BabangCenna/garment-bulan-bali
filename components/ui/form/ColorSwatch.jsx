// components/ui/form/ColorSwatch.jsx
'use client'
import { forwardRef } from 'react'

const ColorSwatch = forwardRef(({
  label,
  hint,
  error,
  required,
  options   = [], // [{ value, label, color }] — color: hex string
  value,          // selected value
  onChange,
  multi     = false,
  size      = 'md',   // 'sm' | 'md' | 'lg'
  shape     = 'circle', // 'circle' | 'rounded' | 'square'
  showLabel = true,
  className = '',
}, ref) => {
  const sizes = { sm: 24, md: 32, lg: 44 }
  const swatchSize = sizes[size] ?? 32

  const isActive = (val) =>
    multi
      ? Array.isArray(value) && value.includes(val)
      : value === val

  const handleClick = (val) => {
    if (multi) {
      const curr = Array.isArray(value) ? value : []
      onChange?.(curr.includes(val) ? curr.filter(v => v !== val) : [...curr, val])
    } else {
      onChange?.(val === value ? null : val)
    }
  }

  const radiusMap = { circle: '50%', rounded: '6px', square: '0' }
  const radius    = radiusMap[shape] ?? '50%'

  return (
    <div className={['form-group', className].filter(Boolean).join(' ')}>
      {label && (
        <div className="form-label">
          {label}{required && <span className="req"> *</span>}
        </div>
      )}

      <div className="swatch-wrap">
        {options.map(opt => {
          const active = isActive(opt.value)
          return (
            <div key={opt.value} className="swatch-item">
              <button
                type="button"
                title={opt.label}
                onClick={() => handleClick(opt.value)}
                className={['swatch-btn', active ? 'swatch-btn-active' : ''].filter(Boolean).join(' ')}
                style={{
                  width:           swatchSize,
                  height:          swatchSize,
                  background:      opt.color,
                  borderRadius:    radius,
                  boxShadow:       active
                    ? `0 0 0 2px var(--color-bg-primary), 0 0 0 4px ${opt.color}`
                    : '0 1px 3px rgba(0,0,0,.2)',
                }}
              >
                {active && (
                  <i
                    className="fa-solid fa-check"
                    style={{
                      fontSize:  swatchSize * 0.38,
                      color:     isLightColor(opt.color) ? '#000' : '#fff',
                    }}
                  />
                )}
              </button>
              {showLabel && opt.label && (
                <span className="swatch-label">{opt.label}</span>
              )}
            </div>
          )
        })}
      </div>

      {error && <div className="form-error"><i className="fa-solid fa-circle-exclamation" />{error}</div>}
      {hint && !error && <div className="form-hint">{hint}</div>}
    </div>
  )
})

// helper: apakah warna terang?
function isLightColor(hex) {
  const c = hex.replace('#', '')
  const r = parseInt(c.substring(0, 2), 16)
  const g = parseInt(c.substring(2, 4), 16)
  const b = parseInt(c.substring(4, 6), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 128
}

ColorSwatch.displayName = 'ColorSwatch'
export default ColorSwatch