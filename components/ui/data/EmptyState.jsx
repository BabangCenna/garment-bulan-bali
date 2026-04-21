'use client'

const EmptyState = ({
  icon,
  title      = 'Tidak ada data',
  description,
  action,
  compact    = false,
  className  = '',
}) => {
  return (
    <div className={['empty-state', compact ? 'empty-state-compact' : '', className].filter(Boolean).join(' ')}>
      {icon && (
        <div className="empty-state-icon">{icon}</div>
      )}
      <div className="empty-state-title">{title}</div>
      {description && (
        <div className="empty-state-desc">{description}</div>
      )}
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  )
}

export default EmptyState