'use client'

const Tag = ({
  children,
  variant   = 'secondary',
  size      = 'md',
  removable = false,
  onRemove,
  icon,
  className = '',
  ...props
}) => {
  return (
    <span
      className={[
        'tag',
        `badge-${variant}`,
        `tag-${size}`,
        className,
      ].filter(Boolean).join(' ')}
      {...props}
    >
      {icon && <span className="badge-icon">{icon}</span>}
      {children}
      {removable && (
        <button
          type="button"
          className="tag-remove"
          onClick={(e) => { e.stopPropagation(); onRemove?.() }}
        >
          <i className="fa-solid fa-xmark" />
        </button>
      )}
    </span>
  )
}

export default Tag