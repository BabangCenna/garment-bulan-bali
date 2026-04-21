'use client'

const Pagination = ({
  page,
  total,
  pageSize  = 10,
  onChange,
  showFirst = true,
  showLast  = true,
  siblings  = 1,
  size      = 'md',
  className = '',
}) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const range = (from, to) =>
    Array.from({ length: to - from + 1 }, (_, i) => from + i)

  const pages = (() => {
    const left  = Math.max(2, page - siblings)
    const right = Math.min(totalPages - 1, page + siblings)
    const items = range(left, right)
    const withLeft  = left > 2            ? ['...', ...items] : [2, ...items].filter((v, i, a) => a.indexOf(v) === i)
    const withRight = right < totalPages - 1 ? [...withLeft, '...'] : [...withLeft, totalPages - 1].filter((v, i, a) => a.indexOf(v) === i)
    return totalPages > 1 ? [1, ...withRight, totalPages].filter((v, i, a) => a.indexOf(v) === i) : [1]
  })()

  const go = (p) => {
    if (p < 1 || p > totalPages || p === page) return
    onChange?.(p)
  }

  const btnClass = (active, disabled) => [
    'page-btn',
    `page-btn-${size}`,
    active   ? 'page-btn-active'   : '',
    disabled ? 'page-btn-disabled' : '',
  ].filter(Boolean).join(' ')

  return (
    <nav className={['pagination', className].filter(Boolean).join(' ')}>
      {showFirst && (
        <button type="button" className={btnClass(false, page === 1)} onClick={() => go(1)}>
          <i className="fa-solid fa-angles-left" />
        </button>
      )}
      <button type="button" className={btnClass(false, page === 1)} onClick={() => go(page - 1)}>
        <i className="fa-solid fa-angle-left" />
      </button>

      {pages.map((p, i) =>
        p === '...'
          ? <span key={`dots-${i}`} className="page-dots">…</span>
          : (
            <button
              key={p}
              type="button"
              className={btnClass(p === page, false)}
              onClick={() => go(p)}
            >
              {p}
            </button>
          )
      )}

      <button type="button" className={btnClass(false, page === totalPages)} onClick={() => go(page + 1)}>
        <i className="fa-solid fa-angle-right" />
      </button>
      {showLast && (
        <button type="button" className={btnClass(false, page === totalPages)} onClick={() => go(totalPages)}>
          <i className="fa-solid fa-angles-right" />
        </button>
      )}
    </nav>
  )
}

export default Pagination