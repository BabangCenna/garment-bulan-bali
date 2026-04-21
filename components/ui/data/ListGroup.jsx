'use client'

const ListGroup = ({
  items    = [], // [{ label, description, left, right, active, disabled, onClick, href }]
  flush    = false,
  bordered = true,
  className = '',
}) => {
  return (
    <ul className={[
      'list-group',
      flush    ? 'list-group-flush'    : '',
      bordered ? 'list-group-bordered' : '',
      className,
    ].filter(Boolean).join(' ')}>
      {items.map((item, i) => {
        const Tag = item.href ? 'a' : 'li'
        return (
          <Tag
            key={i}
            href={item.href}
            className={[
              'list-group-item',
              item.active   ? 'list-group-item-active'   : '',
              item.disabled ? 'list-group-item-disabled' : '',
              (item.onClick || item.href) ? 'list-group-item-action' : '',
            ].filter(Boolean).join(' ')}
            onClick={!item.disabled ? item.onClick : undefined}
          >
            {item.left && <span className="list-group-item-left">{item.left}</span>}
            <span className="list-group-item-body">
              <span className="list-group-item-label">{item.label}</span>
              {item.description && <span className="list-group-item-desc">{item.description}</span>}
            </span>
            {item.right && <span className="list-group-item-right">{item.right}</span>}
            {(item.onClick || item.href) && (
              <i className="fa-solid fa-chevron-right list-group-item-chevron" />
            )}
          </Tag>
        )
      })}
    </ul>
  )
}

export default ListGroup