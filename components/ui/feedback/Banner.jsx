'use client'
import { useState } from 'react'

const VARIANTS = {
  info:    { icon: 'fa-circle-info',          bg: 'var(--color-primary)',  text: '#fff' },
  success: { icon: 'fa-circle-check',         bg: 'var(--color-success)',  text: '#fff' },
  warning: { icon: 'fa-triangle-exclamation', bg: 'var(--color-warning)',  text: '#fff' },
  danger:  { icon: 'fa-circle-exclamation',   bg: 'var(--color-danger)',   text: '#fff' },
  neutral: { icon: 'fa-bell',                 bg: 'var(--color-bg-muted)', text: 'var(--color-text-primary)' },
}

const Banner = ({
  variant     = 'info',
  message,
  action,      // { label, onClick }
  dismissible = true,
  icon,
  sticky      = false,
  className   = '',
}) => {
  const [visible, setVisible] = useState(true)
  const v = VARIANTS[variant] ?? VARIANTS.info

  if (!visible) return null

  return (
    <div
      className={['banner', sticky ? 'banner-sticky' : '', className].filter(Boolean).join(' ')}
      style={{ background: v.bg, color: v.text }}
    >
      <div className="banner-inner">
        <span className="banner-icon">
          {icon ?? <i className={`fa-solid ${v.icon}`} />}
        </span>
        <span className="banner-message">{message}</span>
        {action && (
          <button
            type="button"
            className="banner-action"
            style={{ color: v.text, borderColor: `${v.text}55` }}
            onClick={action.onClick}
          >
            {action.label}
          </button>
        )}
      </div>
      {dismissible && (
        <button
          type="button"
          className="banner-close"
          style={{ color: v.text }}
          onClick={() => setVisible(false)}
        >
          <i className="fa-solid fa-xmark" />
        </button>
      )}
    </div>
  )
}

export default Banner