'use client'

const DescriptionList = ({
  items     = [], // [{ label, value, span }]
  columns   = 2,
  bordered  = false,
  striped   = false,
  className = '',
}) => {
  return (
    <dl className={[
      'desc-list',
      `desc-list-col-${columns}`,
      bordered ? 'desc-list-bordered' : '',
      striped  ? 'desc-list-striped'  : '',
      className,
    ].filter(Boolean).join(' ')}>
      {items.map((item, i) => (
        <div
          key={i}
          className="desc-list-item"
          style={item.span ? { gridColumn: `span ${item.span}` } : {}}
        >
          <dt className="desc-list-label">{item.label}</dt>
          <dd className="desc-list-value">{item.value ?? '—'}</dd>
        </div>
      ))}
    </dl>
  )
}

export default DescriptionList