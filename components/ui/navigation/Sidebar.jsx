'use client'
import { useState } from 'react'

const Sidebar = ({
  brand,           // { logo, name, href }
  items    = [],   // [{ label, href, icon, active, badge, children, divider }]
  collapsed = false,
  onCollapse,
  width    = 240,
  footer,
  className = '',
}) => {
  const [open, setOpen] = useState({})

  const toggleGroup = (i) => setOpen(v => ({ ...v, [i]: !v[i] }))

  return (
    <aside
      className={['sidebar', collapsed ? 'sidebar-collapsed' : '', className].filter(Boolean).join(' ')}
      style={{ width: collapsed ? 56 : width }}
    >
      {/* Brand */}
      <div className="sidebar-brand">
        {brand?.logo && (
          <a href={brand?.href ?? '#'} className="sidebar-brand-logo">
            {brand.logo}
          </a>
        )}
        {!collapsed && brand?.name && (
          <a href={brand?.href ?? '#'} className="sidebar-brand-name">
            {brand.name}
          </a>
        )}
        {onCollapse && (
          <button type="button" className="sidebar-collapse-btn" onClick={onCollapse}>
            <i className={`fa-solid fa-chevron-${collapsed ? 'right' : 'left'}`} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {items.map((item, i) => {
          if (item.divider) {
            return (
              <div key={i} className="sidebar-divider">
                {!collapsed && item.label && (
                  <span className="sidebar-divider-label">{item.label}</span>
                )}
              </div>
            )
          }

          const hasChildren = item.children?.length > 0
          const isOpen      = open[i]

          return (
            <div key={i}>
              
                href={hasChildren ? undefined : item.href}
                className={['sidebar-item', item.active ? 'sidebar-item-active' : ''].filter(Boolean).join(' ')}
                onClick={hasChildren ? () => toggleGroup(i) : undefined}
                title={collapsed ? item.label : undefined}
              >
                {item.icon && <span className="sidebar-item-icon">{item.icon}</span>}
                {!collapsed && (
                  <>
                    <span className="sidebar-item-label">{item.label}</span>
                    {item.badge && <span className="sidebar-item-badge">{item.badge}</span>}
                    {hasChildren && (
                      <i className={`fa-solid fa-chevron-${isOpen ? 'up' : 'down'} sidebar-item-chevron`} />
                    )}
                  </>
                )}
              </a>

              {/* Sub items */}
              {hasChildren && isOpen && !collapsed && (
                <div className="sidebar-sub">
                  {item.children.map((child, j) => (
                    
                      key={j}
                      href={child.href}
                      className={['sidebar-sub-item', child.active ? 'sidebar-item-active' : ''].filter(Boolean).join(' ')}
                    >
                      {child.icon && <span className="sidebar-item-icon">{child.icon}</span>}
                      <span>{child.label}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Footer */}
      {footer && !collapsed && (
        <div className="sidebar-footer">{footer}</div>
      )}
    </aside>
  )
}

export default Sidebar