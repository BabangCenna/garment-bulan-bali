'use client'
import { useState } from 'react'

const Navbar = ({
  brand,          // { logo, name, href }
  links    = [],  // [{ label, href, active, icon }]
  right,          // JSX slot kanan
  sticky   = false,
  bordered = true,
  className = '',
}) => {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className={[
      'navbar',
      sticky   ? 'navbar-sticky'   : '',
      bordered ? 'navbar-bordered' : '',
      className,
    ].filter(Boolean).join(' ')}>
      <div className="navbar-inner">
        {/* Brand */}
        {brand && (
          <a href={brand.href ?? '#'} className="navbar-brand">
            {brand.logo && <span className="navbar-brand-logo">{brand.logo}</span>}
            {brand.name && <span className="navbar-brand-name">{brand.name}</span>}
          </a>
        )}

        {/* Desktop links */}
        {links.length > 0 && (
          <ul className="navbar-links">
            {links.map((link, i) => (
              <li key={i}>
                <a
                  href={link.href}
                  className={['navbar-link', link.active ? 'navbar-link-active' : ''].filter(Boolean).join(' ')}
                >
                  {link.icon && <span className="navbar-link-icon">{link.icon}</span>}
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        )}

        {/* Right slot */}
        <div className="navbar-right">
          {right}
          {/* Mobile toggle */}
          <button
            type="button"
            className="navbar-toggle"
            onClick={() => setMobileOpen(v => !v)}
          >
            <i className={`fa-solid ${mobileOpen ? 'fa-xmark' : 'fa-bars'}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && links.length > 0 && (
        <div className="navbar-mobile">
          {links.map((link, i) => (
            <a
              key={i}
              href={link.href}
              className={['navbar-mobile-link', link.active ? 'navbar-link-active' : ''].filter(Boolean).join(' ')}
              onClick={() => setMobileOpen(false)}
            >
              {link.icon && <span>{link.icon}</span>}
              {link.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  )
}

export default Navbar