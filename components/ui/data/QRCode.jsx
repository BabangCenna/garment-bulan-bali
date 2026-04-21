// components/ui/data/QRCode.jsx
'use client'
import { useEffect, useRef, useState } from 'react'
import Button from '@/components/ui/button/Button'

const QRCode = ({
  value     = '',
  size      = 200,
  label,
  showValue = false,
  downloadable = false,
  className = '',
}) => {
  const canvasRef = useRef(null)
  const [loaded,  setLoaded]  = useState(false)
  const [error,   setError]   = useState(false)

  useEffect(() => {
    if (!value) return
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js'
    script.onload = () => {
      try {
        const container = canvasRef.current
        if (!container) return
        container.innerHTML = ''
        new window.QRCode(container, {
          text:          value,
          width:         size,
          height:        size,
          colorDark:     '#000000',
          colorLight:    '#ffffff',
          correctLevel:  window.QRCode.CorrectLevel.H,
        })
        setLoaded(true)
      } catch {
        setError(true)
      }
    }
    script.onerror = () => setError(true)
    if (window.QRCode) {
      script.onload()
    } else {
      document.head.appendChild(script)
    }
    return () => { if (canvasRef.current) canvasRef.current.innerHTML = '' }
  }, [value, size])

  const download = () => {
    const canvas = canvasRef.current?.querySelector('canvas')
    if (!canvas) return
    const link  = document.createElement('a')
    link.download = 'qrcode.png'
    link.href    = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <div className={['qrcode-wrap', className].filter(Boolean).join(' ')}>
      {label && <div className="qrcode-label">{label}</div>}
      <div
        className="qrcode-box"
        style={{ width: size, height: size }}
      >
        {error ? (
          <div className="qrcode-error">
            <i className="fa-solid fa-triangle-exclamation" />
            <span>Gagal generate QR</span>
          </div>
        ) : (
          <div ref={canvasRef} className="qrcode-canvas" />
        )}
      </div>
      {showValue && value && (
        <div className="qrcode-value">{value}</div>
      )}
      {downloadable && loaded && (
        <Button
          size="sm"
          variant="secondary"
          leftIcon={<i className="fa-solid fa-download" />}
          onClick={download}
        >
          Download QR
        </Button>
      )}
    </div>
  )
}

export default QRCode