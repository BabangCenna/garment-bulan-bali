'use client'
import Modal from './Modal'

const VARIANTS = {
  danger:  { icon: 'fa-triangle-exclamation', color: 'var(--color-danger)'  },
  warning: { icon: 'fa-circle-exclamation',   color: 'var(--color-warning)' },
  info:    { icon: 'fa-circle-info',          color: 'var(--color-primary)' },
  success: { icon: 'fa-circle-check',         color: 'var(--color-success)' },
}

const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title       = 'Konfirmasi',
  message,
  variant     = 'danger',
  confirmText = 'Ya, Lanjutkan',
  cancelText  = 'Batal',
  loading     = false,
}) => {
  const v = VARIANTS[variant] ?? VARIANTS.danger

  return (
    <Modal open={open} onClose={onClose} size="sm" centered closeable={!loading}>
      <div className="confirm-body">
        <div className="confirm-icon" style={{ color: v.color }}>
          <i className={`fa-solid ${v.icon}`} />
        </div>
        <div className="confirm-text">
          <div className="confirm-title">{title}</div>
          {message && <div className="confirm-message">{message}</div>}
        </div>
      </div>
      <div className="confirm-actions">
        <button
          type="button"
          className="btn btn-secondary btn-md"
          onClick={onClose}
          disabled={loading}
        >
          {cancelText}
        </button>
        <button
          type="button"
          className={`btn btn-${variant === 'info' ? 'primary' : variant} btn-md`}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading && <i className="fa-solid fa-circle-notch fa-spin" />}
          {confirmText}
        </button>
      </div>
    </Modal>
  )
}

export default ConfirmDialog