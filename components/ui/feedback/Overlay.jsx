'use client'
import { useEffect } from 'react'

const Overlay = ({
  open,
  onClick,
  blur      = false,
  opacity   = 50,     // 0-100
  zIndex    = 700,
  lockScroll = true,
  className  = '',
}) => {
  useEffect(() => {
    if (!open || !lockScroll) return
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [open, lockScroll])

  if (!open) return null

  return (
    <div
      className={['overlay', blur ? 'overlay-blur' : '', className].filter(Boolean).join(' ')}
      style={{
        zIndex,
        background: `rgba(0,0,0,${opacity / 100})`,
      }}
      onClick={onClick}
    />
  )
}

export default Overlay