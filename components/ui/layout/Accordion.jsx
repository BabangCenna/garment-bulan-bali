'use client'
import { useState } from 'react'

const AccordionItem = ({
  title,
  children,
  open,
  onToggle,
  disabled = false,
  icon,
}) => (
  <div className={['accordion-item', open ? 'accordion-item-open' : '', disabled ? 'accordion-item-disabled' : ''].filter(Boolean).join(' ')}>
    <button
      type="button"
      className="accordion-trigger"
      onClick={() => !disabled && onToggle()}
      aria-expanded={open}
    >
      {icon && <span className="accordion-icon">{icon}</span>}
      <span className="accordion-title">{title}</span>
      <i className={`fa-solid fa-chevron-down accordion-chevron ${open ? 'accordion-chevron-open' : ''}`} />
    </button>
    {open && (
      <div className="accordion-panel">
        <div className="accordion-content">{children}</div>
      </div>
    )}
  </div>
)

const Accordion = ({
  items     = [], // [{ title, content, icon, disabled, defaultOpen }]
  multiple  = false,
  bordered  = true,
  className = '',
}) => {
  const initOpen = items.reduce((acc, item, i) => {
    if (item.defaultOpen) acc[i] = true
    return acc
  }, {})

  const [openMap, setOpenMap] = useState(initOpen)

  const toggle = (i) => {
    setOpenMap(prev => {
      if (multiple) return { ...prev, [i]: !prev[i] }
      return prev[i] ? {} : { [i]: true }
    })
  }

  return (
    <div className={['accordion', bordered ? 'accordion-bordered' : '', className].filter(Boolean).join(' ')}>
      {items.map((item, i) => (
        <AccordionItem
          key={i}
          title={item.title}
          icon={item.icon}
          disabled={item.disabled}
          open={!!openMap[i]}
          onToggle={() => toggle(i)}
        >
          {item.content}
        </AccordionItem>
      ))}
    </div>
  )
}

export default Accordion