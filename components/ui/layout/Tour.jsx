// components/ui/layout/Tour.jsx
'use client'
import { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'

const Tour = ({
  steps    = [], // [{ target, title, content, placement, onNext, onPrev }]
  active   = false,
  onFinish,
  onSkip,
  startIndex = 0,
  labels   = {
    next:   'Lanjut',
    prev:   'Kembali',
    skip:   'Lewati',
    finish: 'Selesai',
  },
}) => {
  const [current,  setCurrent]  = useState(startIndex)
  const [rect,     setRect]     = useState(null)
  const [mounted,  setMounted]  = useState(false)
  const boxRef = useRef(null)

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => { if (active) setCurrent(startIndex) }, [active, startIndex])

  const getTargetRect = useCallback(() => {
    const step = steps[current]
    if (!step?.target) return null
    const el = typeof step.target === 'string'
      ? document.querySelector(step.target)
      : step.target
    if (!el) return null
    const r = el.getBoundingClientRect()
    return { top: r.top, left: r.left, width: r.width, height: r.height }
  }, [current, steps])

  useLayoutEffect(() => {
    if (!active) return
    const update = () => setRect(getTargetRect())
    update()
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [active, getTargetRect])

  if (!active || !mounted || steps.length === 0) return null

  const step    = steps[current]
  const isFirst = current === 0
  const isLast  = current === steps.length - 1

  const next = () => {
    step.onNext?.()
    if (isLast) onFinish?.()
    else setCurrent(v => v + 1)
  }

  const prev = () => {
    step.onPrev?.()
    setCurrent(v => v - 1)
  }

  // compute tooltip position
  const PAD    = 12
  const MARGIN = 16
  const placement = step.placement ?? 'bottom'
  let tooltipStyle = {}

  if (rect) {
    const vw = window.innerWidth
    const vh = window.innerHeight
    if (placement === 'bottom') {
      tooltipStyle = { top: rect.top + rect.height + MARGIN, left: Math.min(Math.max(rect.left, PAD), vw - 320 - PAD) }
    } else if (placement === 'top') {
      tooltipStyle = { bottom: vh - rect.top + MARGIN, left: Math.min(Math.max(rect.left, PAD), vw - 320 - PAD) }
    } else if (placement === 'right') {
      tooltipStyle = { top: rect.top, left: rect.left + rect.width + MARGIN }
    } else if (placement === 'left') {
      tooltipStyle = { top: rect.top, right: vw - rect.left + MARGIN }
    } else {
      tooltipStyle = { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
    }
  } else {
    tooltipStyle = { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
  }

  return createPortal(
    <>
      {/* overlay with spotlight cutout */}
      <svg
        className="tour-overlay"
        viewBox={`0 0 ${window.innerWidth} ${window.innerHeight}`}
        preserveAspectRatio="none"
      >
        <defs>
          <mask id="tour-mask">
            <rect width="100%" height="100%" fill="white" />
            {rect && (
              <rect
                x={rect.left - PAD}
                y={rect.top - PAD}
                width={rect.width + PAD * 2}
                height={rect.height + PAD * 2}
                rx={8}
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(0,0,0,0.55)"
          mask="url(#tour-mask)"
        />
        {/* highlight border */}
        {rect && (
          <rect
            x={rect.left - PAD}
            y={rect.top - PAD}
            width={rect.width + PAD * 2}
            height={rect.height + PAD * 2}
            rx={8}
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth={2}
          />
        )}
      </svg>

      {/* tooltip */}
      <div ref={boxRef} className="tour-box" style={{ ...tooltipStyle, position: 'fixed', zIndex: 10001, maxWidth: 320 }}>
        {/* header */}
        <div className="tour-box-header">
          <div className="tour-step-badge">
            {current + 1} / {steps.length}
          </div>
          <button type="button" className="tour-skip-btn" onClick={onSkip}>
            {labels.skip}
          </button>
        </div>

        {/* content */}
        {step.title && <div className="tour-title">{step.title}</div>}
        {step.content && <div className="tour-content">{step.content}</div>}

        {/* progress dots */}
        <div className="tour-dots">
          {steps.map((_, i) => (
            <span
              key={i}
              className={['tour-dot', i === current ? 'tour-dot-active' : i < current ? 'tour-dot-done' : ''].filter(Boolean).join(' ')}
            />
          ))}
        </div>

        {/* footer */}
        <div className="tour-footer">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={isFirst ? onSkip : prev}
          >
            {isFirst ? labels.skip : labels.prev}
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={next}
          >
            {isLast ? labels.finish : labels.next}
            {!isLast && <i className="fa-solid fa-arrow-right" style={{ fontSize: 11 }} />}
          </button>
        </div>
      </div>
    </>,
    document.body
  )
}

export default Tour