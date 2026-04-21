// components/ui/form/RatingInput.jsx
'use client'
import { useState } from 'react'

const LABELS = ['Sangat Buruk', 'Buruk', 'Cukup', 'Baik', 'Sangat Baik']

const RatingInput = ({
  label,
  hint,
  error,
  required,
  value     = 0,
  onChange,
  max       = 5,
  size      = 'md',   // 'sm' | 'md' | 'lg'
  showLabel = true,
  readonly  = false,
  icon      = 'fa-star', // fa icon name
  className = '',
}) => {
  const [hovered, setHovered] = useState(0)

  const display = hovered || value

  const sizes = { sm: 16, md: 24, lg: 32 }
  const iconSize = sizes[size] ?? 24

  return (
    <div className={['form-group', className].filter(Boolean).join(' ')}>
      {label && (
        <div className="form-label">
          {label}{required && <span className="req"> *</span>}
        </div>
      )}

      <div className="rating-wrap">
        <div
          className="rating-stars"
          onMouseLeave={() => !readonly && setHovered(0)}
        >
          {Array.from({ length: max }, (_, i) => {
            const idx   = i + 1
            const filled = idx <= display
            return (
              <button
                key={i}
                type="button"
                disabled={readonly}
                className={['rating-star', filled ? 'rating-star-filled' : 'rating-star-empty'].join(' ')}
                style={{ fontSize: iconSize, cursor: readonly ? 'default' : 'pointer' }}
                onMouseEnter={() => !readonly && setHovered(idx)}
                onClick={() => !readonly && onChange?.(idx === value ? 0 : idx)}
                aria-label={`${idx} bintang`}
              >
                <i className={`fa-${filled ? 'solid' : 'regular'} ${icon}`} />
              </button>
            )
          })}
        </div>

        {showLabel && (
          <div className="rating-label">
            {display > 0
              ? <><span className="rating-value">{display}</span><span className="rating-desc">/ {max} — {LABELS[display - 1]}</span></>
              : <span className="rating-placeholder">Belum dinilai</span>
            }
          </div>
        )}
      </div>

      {error && <div className="form-error"><i className="fa-solid fa-circle-exclamation" />{error}</div>}
      {hint && !error && <div className="form-hint">{hint}</div>}
    </div>
  )
}

export const RatingDisplay = ({ value = 0, max = 5, size = 'sm', showCount, count }) => {
  const sizes = { sm: 12, md: 16, lg: 20 }
  const iconSize = sizes[size] ?? 12
  return (
    <div className="rating-display">
      {Array.from({ length: max }, (_, i) => (
        <i
          key={i}
          className={`fa-${i < value ? 'solid' : 'regular'} fa-star rating-display-star`}
          style={{ fontSize: iconSize, color: i < value ? '#f08c00' : 'var(--color-border)' }}
        />
      ))}
      {showCount && count !== undefined && (
        <span className="rating-display-count">({count})</span>
      )}
    </div>
  )
}

export default RatingInput