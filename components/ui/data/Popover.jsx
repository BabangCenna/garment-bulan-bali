'use client'
import { useState, useRef, useEffect } from 'react'

const Popover = ({
  children,
  content,
  title,
  placement = 'bottom', // 'top' | 'bottom' | 'left' | 'right'
  trigger   = 'click',  // 'click' | 'hover'
}) => {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (trigger !== 'click') return
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [trigger])

  const triggerProps = trigger === 'hover'
    ? { onMouseEnter: () => setOpen(true), onMouseLeave: () => setOpen(false) }
    : { onClick: () => setOpen(v => !v) }

  return (
    <span className="popover-wrap" ref={ref} {...triggerProps}>
      {children}
      {open && (
        <div className={`popover-box popover-${placement}`}>
          {title && <div className="popover-title">{title}</div>}
          <div className="popover-content">{content}</div>
        </div>
      )}
    </span>
  )
}

export default Popover