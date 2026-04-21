'use client'

const ProgressCircle = ({
  value    = 0,
  max      = 100,
  size     = 80,
  stroke   = 8,
  variant  = 'primary',
  label,
  showValue = true,
  className = '',
}) => {
  const pct    = Math.min(100, Math.max(0, (value / max) * 100))
  const r      = (size - stroke) / 2
  const circ   = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ

  const colors = {
    primary: 'var(--color-primary)',
    success: 'var(--color-success)',
    danger:  'var(--color-danger)',
    warning: 'var(--color-warning)',
  }

  return (
    <div className={['progress-circle', className].filter(Boolean).join(' ')} style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke="var(--color-bg-muted)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke={colors[variant] ?? colors.primary}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset .4s ease' }}
        />
      </svg>
      <div className="progress-circle-inner">
        {showValue && <span className="progress-circle-value">{Math.round(pct)}%</span>}
        {label && <span className="progress-circle-label">{label}</span>}
      </div>
    </div>
  )
}

export default ProgressCircle