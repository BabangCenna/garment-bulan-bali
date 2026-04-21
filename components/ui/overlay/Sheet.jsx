'use client'
import { useEffect } from 'react'

// Lightweight bottom/side sheet — lebih ringan dari Drawer,
// khusus untuk mobile-first action sheets
const Sheet = ({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  placement = 'bottom', // 'bottom' | 'left' | 'right'
  size      = 'auto',   // 'auto' | 'half' | 'full'
  closeable = true,
  className = '',
}) => {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape' && closeable) onClose?.() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, closeable])

  if (!open) return null

  return (
    <div
      className="sheet-backdrop"
      onClick={(e) => { if (e.target === e.currentTarget && closeable) onClose?.() }}
    >
      <div className={[
        'sheet',
        `sheet-${placement}`,
        `sheet-size-${size}`,
        className,
      ].filter(Boolean).join(' ')}>
        {/* Handle bar for bottom sheet */}
        {placement === 'bottom' && closeable && (
          <div className="sheet-handle" onClick={onClose}>
            <span className="sheet-handle-bar" />
          </div>
        )}

        {/* Header */}
        {(title || closeable) && (
          <div className="sheet-header">
            <div className="sheet-header-text">
              {title       && <div className="sheet-title">{title}</div>}
              {description && <div className="sheet-desc">{description}</div>}
            </div>
            {closeable && placement !== 'bottom' && (
              <button type="button" className="modal-close" onClick={onClose}>
                <i className="fa-solid fa-xmark" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="sheet-body">{children}</div>

        {/* Footer */}
        {footer && <div className="sheet-footer">{footer}</div>}
      </div>
    </div>
  )
}

export default Sheet