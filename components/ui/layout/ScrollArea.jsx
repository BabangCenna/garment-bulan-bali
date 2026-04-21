'use client'
import { useRef, useEffect, useState } from 'react'

const ScrollArea = ({
  children,
  height,       // e.g. '300px' or 400
  maxHeight,
  direction = 'vertical', // 'vertical' | 'horizontal' | 'both'
  className = '',
  ...props
}) => {
  const ref   = useRef(null)
  const [top, setTop]       = useState(false)
  const [bottom, setBottom] = useState(false)

  const checkShadow = () => {
    const el = ref.current
    if (!el) return
    setTop(el.scrollTop > 8)
    setBottom(el.scrollTop + el.clientHeight < el.scrollHeight - 8)
  }

  useEffect(() => { checkShadow(); ref.current?.addEventListener('scroll', checkShadow) }, [])

  const overflowMap = {
    vertical:   { overflowY: 'auto', overflowX: 'hidden' },
    horizontal: { overflowX: 'auto', overflowY: 'hidden' },
    both:       { overflow: 'auto' },
  }

  return (
    <div
      className={[
        'scroll-area',
        top    ? 'scroll-shadow-top'    : '',
        bottom ? 'scroll-shadow-bottom' : '',
        className,
      ].filter(Boolean).join(' ')}
      style={{ height, maxHeight }}
    >
      <div
        ref={ref}
        className="scroll-area-inner"
        style={overflowMap[direction] ?? overflowMap.vertical}
        {...props}
      >
        {children}
      </div>
    </div>
  )
}

export default ScrollArea