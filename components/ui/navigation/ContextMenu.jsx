'use client'
import { useState, useEffect, useRef, useCallback } from 'react'

const ContextMenu = ({
  children,
  items = [], // [{ label, icon, onClick, divider, disabled, danger }]
}) => {
  const [pos, setPos]     = useState(null)
  const menuRef           = useRef(null)

  const close = useCallback(() => setPos(null), [])

  const onContext = (e) => {
    e.preventDefault()
    setPos({ x: e.clientX, y: e.clientY })
  }

  useEffect(() => {
    document.addEventListener('mousedown', close)
    document.addEventListener('scroll',    close)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('scroll',    close)
    }
  }, [close])

  return (
    <>
      <div onContextMenu={onContext} style={{ display: 'contents' }}>
        {children}
      </div>
      {pos && (
        <div
          ref={menuRef}
          className="context-menu"
          style={{ top: pos.y, left: pos.x }}
          onMouseDown={e => e.stopPropagation()}
        >
          {items.map((item, i) => {
            if (item.divider) return <div key={i} className="dropdown-divider" />
            return (
              <button
                key={i}
                type="button"
                disabled={item.disabled}
                className={['dropdown-item', item.danger ? 'dropdown-item-danger' : ''].filter(Boolean).join(' ')}
                onClick={() => { item.onClick?.(); close() }}
              >
                {item.icon && <span className="dropdown-item-icon">{item.icon}</span>}
                {item.label}
              </button>
            )
          })}
        </div>
      )}
    </>
  )
}

export default ContextMenu