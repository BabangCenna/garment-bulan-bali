// components/ui/feedback/NotificationPanel.jsx
'use client'
import { useState, useRef, useEffect } from 'react'
import Badge from '@/components/ui/data/Badge'
import Avatar from '@/components/ui/data/Avatar'

const NOTIF_ICONS = {
  order:   { icon: 'fa-receipt',               color: 'var(--color-primary)' },
  stock:   { icon: 'fa-triangle-exclamation',  color: 'var(--color-warning)' },
  payment: { icon: 'fa-circle-check',          color: 'var(--color-success)' },
  system:  { icon: 'fa-gear',                  color: 'var(--color-text-muted)' },
  promo:   { icon: 'fa-percent',               color: 'var(--color-danger)' },
  user:    { icon: 'fa-user',                  color: 'var(--color-primary)' },
}

const NotificationPanel = ({
  notifications = [], // [{ id, type, title, message, time, read, avatar }]
  onRead,             // (id) => void
  onReadAll,          // () => void
  onDelete,           // (id) => void
  onClearAll,         // () => void
  trigger,            // JSX — custom trigger element
  maxHeight = 420,
}) => {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const unread = notifications.filter(n => !n.read).length

  useEffect(() => {
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // group by date
  const groups = notifications.reduce((acc, n) => {
    const g = n.date ?? 'Hari ini'
    if (!acc[g]) acc[g] = []
    acc[g].push(n)
    return acc
  }, {})

  return (
    <div className="notif-wrap" ref={ref}>
      {/* trigger */}
      <div onClick={() => setOpen(v => !v)} className="notif-trigger">
        {trigger ?? (
          <button type="button" className="notif-default-trigger">
            <i className="fa-solid fa-bell" />
            {unread > 0 && (
              <span className="notif-badge">{unread > 99 ? '99+' : unread}</span>
            )}
          </button>
        )}
      </div>

      {/* panel */}
      {open && (
        <div className="notif-panel">
          {/* header */}
          <div className="notif-header">
            <div className="notif-header-left">
              <span className="notif-header-title">Notifikasi</span>
              {unread > 0 && <Badge variant="danger" size="sm" pill>{unread}</Badge>}
            </div>
            <div className="notif-header-right">
              {unread > 0 && (
                <button type="button" className="notif-action-btn" onClick={onReadAll}>
                  <i className="fa-solid fa-check-double" /> Tandai semua
                </button>
              )}
              {notifications.length > 0 && (
                <button type="button" className="notif-action-btn notif-action-danger" onClick={onClearAll}>
                  <i className="fa-solid fa-trash" /> Hapus semua
                </button>
              )}
            </div>
          </div>

          {/* list */}
          <div className="notif-list" style={{ maxHeight }}>
            {notifications.length === 0 ? (
              <div className="notif-empty">
                <i className="fa-regular fa-bell-slash" style={{ fontSize: 32, color: 'var(--color-text-muted)' }} />
                <span>Tidak ada notifikasi</span>
              </div>
            ) : (
              Object.entries(groups).map(([date, items]) => (
                <div key={date}>
                  <div className="notif-group-label">{date}</div>
                  {items.map(n => {
                    const meta = NOTIF_ICONS[n.type] ?? NOTIF_ICONS.system
                    return (
                      <div
                        key={n.id}
                        className={['notif-item', !n.read ? 'notif-item-unread' : ''].filter(Boolean).join(' ')}
                        onClick={() => { onRead?.(n.id); }}
                      >
                        {/* icon / avatar */}
                        <div className="notif-item-icon-wrap">
                          {n.avatar ? (
                            <Avatar name={n.avatar} size="sm" color="primary" />
                          ) : (
                            <div className="notif-item-icon" style={{ color: meta.color }}>
                              <i className={`fa-solid ${meta.icon}`} />
                            </div>
                          )}
                          {!n.read && <span className="notif-unread-dot" />}
                        </div>

                        {/* content */}
                        <div className="notif-item-body">
                          <div className="notif-item-title">{n.title}</div>
                          {n.message && <div className="notif-item-message">{n.message}</div>}
                          <div className="notif-item-time">
                            <i className="fa-regular fa-clock" style={{ fontSize: 10 }} />
                            {n.time}
                          </div>
                        </div>

                        {/* delete */}
                        <button
                          type="button"
                          className="notif-item-delete"
                          onClick={(e) => { e.stopPropagation(); onDelete?.(n.id) }}
                        >
                          <i className="fa-solid fa-xmark" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              ))
            )}
          </div>

          {/* footer */}
          {notifications.length > 0 && (
            <div className="notif-footer">
              <a href="/notifications" className="notif-footer-link">
                Lihat semua notifikasi
                <i className="fa-solid fa-arrow-right" style={{ fontSize: 11 }} />
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationPanel