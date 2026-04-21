'use client'
import { useState, useRef, useEffect } from 'react'

const Dropdown = ({
  trigger,         // JSX — elemen yang diklik
  items    = [],   // [{ label, icon, onClick, href, divider, disabled, danger }]
  align    = 'left',   // 'left' | 'right'
  placement = 'bottom', // 'bottom' | 'top'
  width    = 180,
  className = '',
}) => {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className={['dropdown-wrap', className].filter(Boolean).join(' ')} ref={ref}>
      <div onClick={() => setOpen(v => !v)} style={{ display: 'inline-flex' }}>
        {trigger}
      </div>

      {open && (
        <div
          className={[
            'dropdown-menu',
            `dropdown-menu-${align}`,
            placement === 'top' ? 'dropdown-menu-top' : '',
          ].filter(Boolean).join(' ')}
          style={{ minWidth: width }}
        >
          {items.map((item, i) => {
            if (item.divider) return <div key={i} className="dropdown-divider" />
            const Tag = item.href ? 'a' : 'button'
            return (
              <Tag
                key={i}
                href={item.href}
                type={item.href ? undefined : 'button'}
                disabled={item.disabled}
                className={['dropdown-item', item.danger ? 'dropdown-item-danger' : ''].filter(Boolean).join(' ')}
                onClick={() => { item.onClick?.(); setOpen(false) }}
              >
                {item.icon && <span className="dropdown-item-icon">{item.icon}</span>}
                {item.label}
              </Tag>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Dropdown