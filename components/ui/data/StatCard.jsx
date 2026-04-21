'use client'

const StatCard = ({
  label,
  value,
  icon,
  trend,       // { value: '+12%', direction: 'up' | 'down' | 'neutral' }
  color  = 'primary', // 'primary' | 'success' | 'danger' | 'warning'
  footer,
  className = '',
}) => {
  const trendIcon = {
    up:      'fa-arrow-trend-up',
    down:    'fa-arrow-trend-down',
    neutral: 'fa-minus',
  }[trend?.direction] ?? 'fa-minus'

  const trendColor = {
    up:      'var(--color-success)',
    down:    'var(--color-danger)',
    neutral: 'var(--color-text-muted)',
  }[trend?.direction] ?? 'var(--color-text-muted)'

  return (
    <div className={['stat-card', className].filter(Boolean).join(' ')}>
      <div className="stat-card-top">
        <div className="stat-card-info">
          <div className="stat-card-label">{label}</div>
          <div className="stat-card-value">{value}</div>
          {trend && (
            <div className="stat-card-trend" style={{ color: trendColor }}>
              <i className={`fa-solid ${trendIcon}`} />
              <span>{trend.value}</span>
            </div>
          )}
        </div>
        {icon && (
          <div className={`stat-card-icon stat-card-icon-${color}`}>
            {icon}
          </div>
        )}
      </div>
      {footer && <div className="stat-card-footer">{footer}</div>}
    </div>
  )
}

export default StatCard