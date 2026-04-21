'use client'

const ProgressBar = ({
  value    = 0,   // 0-100
  max      = 100,
  variant  = 'primary', // 'primary' | 'success' | 'danger' | 'warning'
  size     = 'md',      // 'xs' | 'sm' | 'md' | 'lg'
  label,
  showValue = false,
  striped   = false,
  animated  = false,
  className = '',
}) => {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div className={['progress-wrap', className].filter(Boolean).join(' ')}>
      {(label || showValue) && (
        <div className="progress-header">
          {label && <span className="progress-label">{label}</span>}
          {showValue && <span className="progress-value">{Math.round(pct)}%</span>}
        </div>
      )}
      <div className={['progress-track', `progress-track-${size}`].join(' ')}>
        <div
          className={[
            'progress-bar',
            `progress-bar-${variant}`,
            striped  ? 'progress-striped'  : '',
            animated ? 'progress-animated' : '',
          ].filter(Boolean).join(' ')}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  )
}

export default ProgressBar
