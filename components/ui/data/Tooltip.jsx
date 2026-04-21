'use client'
import { useState, useRef } from 'react'

const Tooltip = ({
  children,
  content,
  placement = 'top', // 'top' | 'bottom' | 'left' | 'right'
  delay     = 200,
}) => {
  const [visible, setVisible] = useState(false)
  const timer = useRef(null)

  const show = () => { timer.current = setTimeout(() => setVisible(true), delay) }
  const hide = () => { clearTimeout(timer.current); setVisible(false) }

  return (
    <span className="tooltip-wrap" onMouseEnter={show} onMouseLeave={hide}>
      {children}
      {visible && content && (
        <span className={`tooltip-box tooltip-${placement}`}>{content}</span>
      )}
    </span>
  )
}

export default Tooltip