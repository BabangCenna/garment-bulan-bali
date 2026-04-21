'use client'

const Timeline = ({
  items     = [], // [{ title, description, date, icon, color, right }]
  alternate = false,
  className = '',
}) => {
  return (
    <ul className={['timeline', alternate ? 'timeline-alternate' : '', className].filter(Boolean).join(' ')}>
      {items.map((item, i) => (
        <li key={i} className={['timeline-item', item.right ? 'timeline-item-right' : ''].filter(Boolean).join(' ')}>
          <div className={`timeline-dot timeline-dot-${item.color || 'primary'}`}>
            {item.icon
              ? item.icon
              : <i className="fa-solid fa-circle" style={{ fontSize: 6 }} />
            }
          </div>
          <div className="timeline-content">
            <div className="timeline-header">
              <span className="timeline-title">{item.title}</span>
              {item.date && <span className="timeline-date">{item.date}</span>}
            </div>
            {item.description && (
              <div className="timeline-desc">{item.description}</div>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}

export default Timeline