// components/ui/data/ImageGallery.jsx
'use client'
import { useState, useEffect, useCallback } from 'react'

const ImageGallery = ({
  images    = [], // [{ src, thumb, alt, caption }]
  columns   = 3,
  gap       = 'md',
  rounded   = true,
  className = '',
}) => {
  const [lightbox, setLightbox] = useState(null) // index

  const close  = useCallback(() => setLightbox(null), [])
  const prev   = useCallback(() => setLightbox(i => (i - 1 + images.length) % images.length), [images.length])
  const next   = useCallback(() => setLightbox(i => (i + 1) % images.length), [images.length])

  useEffect(() => {
    if (lightbox === null) return
    const handler = (e) => {
      if (e.key === 'Escape')     close()
      if (e.key === 'ArrowLeft')  prev()
      if (e.key === 'ArrowRight') next()
    }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [lightbox, close, prev, next])

  const gapMap = { sm: 8, md: 12, lg: 20 }

  return (
    <>
      <div
        className={['img-gallery', className].filter(Boolean).join(' ')}
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: gapMap[gap] ?? 12,
        }}
      >
        {images.map((img, i) => (
          <div
            key={i}
            className="img-gallery-item"
            style={{ borderRadius: rounded ? 'var(--radius-md)' : 0 }}
            onClick={() => setLightbox(i)}
          >
            <img
              src={img.thumb ?? img.src}
              alt={img.alt ?? `Image ${i + 1}`}
              className="img-gallery-img"
            />
            <div className="img-gallery-overlay">
              <i className="fa-solid fa-magnifying-glass-plus" />
            </div>
            {img.caption && (
              <div className="img-gallery-caption">{img.caption}</div>
            )}
          </div>
        ))}
      </div>

      {/* lightbox */}
      {lightbox !== null && (
        <div className="lightbox" onClick={close}>
          {/* close */}
          <button type="button" className="lightbox-close" onClick={close}>
            <i className="fa-solid fa-xmark" />
          </button>

          {/* prev */}
          {images.length > 1 && (
            <button type="button" className="lightbox-nav lightbox-prev" onClick={(e) => { e.stopPropagation(); prev() }}>
              <i className="fa-solid fa-chevron-left" />
            </button>
          )}

          {/* image */}
          <div className="lightbox-content" onClick={e => e.stopPropagation()}>
            <img
              src={images[lightbox].src}
              alt={images[lightbox].alt ?? `Image ${lightbox + 1}`}
              className="lightbox-img"
            />
            {images[lightbox].caption && (
              <div className="lightbox-caption">{images[lightbox].caption}</div>
            )}
            <div className="lightbox-counter">{lightbox + 1} / {images.length}</div>
          </div>

          {/* next */}
          {images.length > 1 && (
            <button type="button" className="lightbox-nav lightbox-next" onClick={(e) => { e.stopPropagation(); next() }}>
              <i className="fa-solid fa-chevron-right" />
            </button>
          )}
        </div>
      )}
    </>
  )
}

export default ImageGallery