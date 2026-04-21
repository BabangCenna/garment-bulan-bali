'use client'

const Card = ({
  children,
  title,
  subtitle,
  headerRight,
  footer,
  padding  = 'md',  // 'sm' | 'md' | 'lg' | 'none'
  bordered = true,
  shadow   = false,
  className = '',
  ...props
}) => {
  const hasHeader = title || subtitle || headerRight

  return (
    <div
      className={[
        'card',
        `card-pad-${padding}`,
        bordered ? 'card-bordered' : '',
        shadow   ? 'card-shadow'   : '',
        className,
      ].filter(Boolean).join(' ')}
      {...props}
    >
      {hasHeader && (
        <div className="card-header">
          <div className="card-header-text">
            {title    && <div className="card-title">{title}</div>}
            {subtitle && <div className="card-subtitle">{subtitle}</div>}
          </div>
          {headerRight && <div className="card-header-right">{headerRight}</div>}
        </div>
      )}
      <div className="card-body">{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  )
}

export default Card