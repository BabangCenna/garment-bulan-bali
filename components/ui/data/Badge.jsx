'use client'

const Badge = ({
  children,
  variant  = 'primary', // 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info'
  size     = 'md',      // 'sm' | 'md' | 'lg'
  pill     = false,
  dot      = false,
  icon,
  className = '',
  ...props
}) => {
  return (
    <span
      className={[
        'badge',
        `badge-${variant}`,
        `badge-${size}`,
        pill ? 'badge-pill' : '',
        className,
      ].filter(Boolean).join(' ')}
      {...props}
    >
      {dot && <span className="badge-dot" />}
      {icon && <span className="badge-icon">{icon}</span>}
      {children}
    </span>
  )
}

export default Badge