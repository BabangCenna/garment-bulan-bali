'use client'
import { useState } from 'react'

const Panel = ({
  title,
  subtitle,
  headerRight,
  children,
  footer,
  collapsible = false,
  defaultOpen = true,
  variant     = 'default', // 'default' | 'primary' | 'success' | 'danger' | 'warning'
  padding     = 'md',
  bordered    = true,
  className   = '',
}) => {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className={[
      'panel',
      `panel-${variant}`,
      bordered ? 'panel-bordered' : '',
      className,
    ].filter(Boolean).join(' ')}>
      {(title || subtitle || headerRight || collapsible) && (
        <div className={`panel-header panel-header-${variant}`}>
          <div className="panel-header-text">
            {title    && <div className="panel-title">{title}</div>}
            {subtitle && <div className="panel-subtitle">{subtitle}</div>}
          </div>
          <div className="panel-header-right">
            {headerRight}
            {collapsible && (
              <button type="button" className="panel-collapse-btn" onClick={() => setOpen(v => !v)}>
                <i className={`fa-solid fa-chevron-${open ? 'up' : 'down'}`} />
              </button>
            )}
          </div>
        </div>
      )}
      {open && (
        <>
          <div className={`panel-body panel-pad-${padding}`}>{children}</div>
          {footer && <div className="panel-footer">{footer}</div>}
        </>
      )}
    </div>
  )
}

export default Panel