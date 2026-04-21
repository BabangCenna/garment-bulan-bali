'use client'

// Lightweight link component — active-aware, works with Next.js Link juga
const NavLink = ({
  href,
  children,
  active,
  icon,
  badge,
  exact     = false,
  variant   = 'default', // 'default' | 'pill' | 'underline'
  className = '',
  ...props
}) => {
  return (
    <a
      href={href}
      className={[
        'navlink',
        `navlink-${variant}`,
        active ? 'navlink-active' : '',
        className,
      ].filter(Boolean).join(' ')}
      {...props}
    >
      {icon && <span className="navlink-icon">{icon}</span>}
      <span>{children}</span>
      {badge !== undefined && (
        <span className="navlink-badge">{badge}</span>
      )}
    </a>
  )
}

export default NavLink