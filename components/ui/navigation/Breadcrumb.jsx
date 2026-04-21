'use client'

const Breadcrumb = ({
  items     = [], // [{ label, href, icon }]
  separator = <i className="fa-solid fa-chevron-right" />,
  className = '',
}) => {
  return (
    <nav aria-label="breadcrumb" className={['breadcrumb-nav', className].filter(Boolean).join(' ')}>
      <ol className="breadcrumb">
        {items.map((item, i) => {
          const isLast = i === items.length - 1
          return (
            <li key={i} className={['breadcrumb-item', isLast ? 'breadcrumb-item-active' : ''].filter(Boolean).join(' ')}>
              {!isLast ? (
                <a href={item.href} className="breadcrumb-link">
                  {item.icon && <span className="breadcrumb-icon">{item.icon}</span>}
                  {item.label}
                </a>
              ) : (
                <span className="breadcrumb-current">
                  {item.icon && <span className="breadcrumb-icon">{item.icon}</span>}
                  {item.label}
                </span>
              )}
              {!isLast && (
                <span className="breadcrumb-sep">{separator}</span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export default Breadcrumb