'use client'
import { useState, useRef, useEffect } from 'react'

const MegaMenu = ({
  trigger,          // JSX label / button
  columns  = [],    // [{ title, items: [{ label, href, icon, description }] }]
  width    = 600,
  align    = 'left',
  footer,
}) => {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="megamenu-wrap" ref={ref}>
      <div onClick={() => setOpen(v => !v)} style={{ display: 'inline-flex', cursor: 'pointer' }}>
        {trigger}
      </div>

      {open && (
        <div
          className={`megamenu-panel megamenu-${align}`}
          style={{ width }}
        >
          <div className="megamenu-grid" style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr)` }}>
            {columns.map((col, ci) => (
              <div key={ci} className="megamenu-col">
                {col.title && <div className="megamenu-col-title">{col.title}</div>}
                {col.items.map((item, ii) => (
                  
                    key={ii}
                    href={item.href}
                    className="megamenu-item"
                    onClick={() => setOpen(false)}
                  >
                    {item.icon && (
                      <span className="megamenu-item-icon">{item.icon}</span>
                    )}
                    <span className="megamenu-item-body">
                      <span className="megamenu-item-label">{item.label}</span>
                      {item.description && (
                        <span className="megamenu-item-desc">{item.description}</span>
                      )}
                    </span>
                  </a>
                ))}
              </div>
            ))}
          </div>
          {footer && (
            <div className="megamenu-footer">{footer}</div>
          )}
        </div>
      )}
    </div>
  )
}

export default MegaMenu