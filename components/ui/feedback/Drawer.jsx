'use client'
import { useEffect, useRef } from 'react'

const Drawer = ({
  open,
  onClose,
  title,
  children,
  footer,
  placement = 'right',  // 'left' | 'right' | 'top' | 'bottom'
  size      = 'md',     // 'sm' | 'md' | 'lg' | 'full'
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
      className="drawer-backdrop"
      onClick={(e) => { if (e.target === e.currentTarget && closeable) onClose?.() }}
    >
      <div className={[
        'drawer',
        `drawer-${placement}`,
        `drawer-size-${size}`,
        className,
      ].filter(Boolean).join(' ')}>
        {(title || closeable) && (
          <div className="modal-header">
            {title && <div className="modal-title">{title}</div>}
            {closeable && (
              <button type="button" className="modal-close" onClick={onClose}>
                <i className="fa-solid fa-xmark" />
              </button>
            )}
          </div>
        )}
        <div className="drawer-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  )
}

export default Drawer