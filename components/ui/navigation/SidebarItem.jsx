'use client'

// Standalone — bisa dipakai di luar Sidebar jika perlu render manual
const SidebarItem = ({
  label,
  href,
  icon,
  active   = false,
  badge,
  disabled = false,
  indent   = 0,
  onClick,
  className = '',
}) => (
  
    href={disabled ? undefined : href}
    onClick={!disabled ? onClick : undefined}
    className={[
      'sidebar-item',
      active   ? 'sidebar-item-active'   : '',
      disabled ? 'sidebar-item-disabled' : '',
      className,
    ].filter(Boolean).join(' ')}
    style={indent ? { paddingLeft: 10 + indent * 14 } : {}}
  >
    {icon && <span className="sidebar-item-icon">{icon}</span>}
    <span className="sidebar-item-label">{label}</span>
    {badge !== undefined && (
      <span className="sidebar-item-badge">{badge}</span>
    )}
  </a>
)

export default SidebarItem