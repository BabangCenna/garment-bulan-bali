'use client'
import { useEffect, useRef } from 'react'

const Modal = ({
  open,
  onClose,
  title,
  children,
  footer,
  size      = 'md',   // 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closeable = true,
  centered  = false,
  className = '',
}) => {
  const backdropRef = useRef(null)

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
      ref={backdropRef}
      className={['modal-backdrop', centered ? 'modal-centered' : ''].filter(Boolean).join(' ')}
      onClick={(e) => { if (e.target === backdropRef.current && closeable) onClose?.() }}
    >
      <div className={['modal', `modal-${size}`, className].filter(Boolean).join(' ')} role="dialog">
        {/* Header */}
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

        {/* Body */}
        <div className="modal-body">{children}</div>

        {/* Footer */}
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  )
}

export default Modal