// components/ui/feedback/ToastProvider.jsx
'use client'
import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const ToastContext = createContext(null)

let _id = 0

export const ToastProvider = ({ children, position = 'top-right', max = 5 }) => {
  const [toasts, setToasts] = useState([])

  const add = useCallback(({ message, variant = 'info', duration = 4000, title, dismissible = true }) => {
    const id = ++_id
    setToasts(v => [{ id, message, variant, duration, title, dismissible }, ...v].slice(0, max))
    if (duration > 0) {
      setTimeout(() => remove(id), duration)
    }
    return id
  }, [])

  const remove = useCallback((id) => {
    setToasts(v => v.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ add, remove }}>
      {children}
      <div className={`toast-container toast-${position}`}>
        {toasts.map(t => (
          <ToastItem key={t.id} {...t} onClose={() => remove(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

const ICONS = {
  info:    'fa-circle-info',
  success: 'fa-circle-check',
  warning: 'fa-triangle-exclamation',
  danger:  'fa-circle-exclamation',
}

const ToastItem = ({ id, title, message, variant = 'info', dismissible, onClose }) => {
  const [visible, setVisible] = useState(false)

  useEffect(() => { requestAnimationFrame(() => setVisible(true)) }, [])

  const close = () => { setVisible(false); setTimeout(onClose, 250) }

  return (
    <div className={['toast', `toast-${variant}`, visible ? 'toast-visible' : ''].filter(Boolean).join(' ')}>
      <span className="toast-icon">
        <i className={`fa-solid ${ICONS[variant] ?? ICONS.info}`} />
      </span>
      <div className="toast-body">
        {title && <div className="toast-title">{title}</div>}
        {message && <div className="toast-message">{message}</div>}
      </div>
      {dismissible && (
        <button type="button" className="toast-close" onClick={close}>
          <i className="fa-solid fa-xmark" />
        </button>
      )}
    </div>
  )
}

export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}

export default ToastProvider