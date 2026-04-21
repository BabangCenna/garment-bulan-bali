'use client'

const Spinner = ({
  size    = 'md',    // 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  variant = 'primary', // 'primary' | 'success' | 'danger' | 'warning' | 'white' | 'muted'
  type    = 'border',  // 'border' | 'grow' | 'dots'
  label,
  center  = false,
  className = '',
}) => {
  if (type === 'dots') {
    return (
      <div className={['spinner-dots-wrap', center ? 'spinner-center' : '', className].filter(Boolean).join(' ')}>
        <div className={`spinner-dots spinner-dots-${variant}`}>
          <span /><span /><span />
        </div>
        {label && <span className="spinner-label">{label}</span>}
      </div>
    )
  }

  return (
    <div className={['spinner-wrap', center ? 'spinner-center' : '', className].filter(Boolean).join(' ')}>
      <div className={[
        type === 'grow' ? 'spinner-grow' : 'spinner-border',
        `spinner-${size}`,
        `spinner-color-${variant}`,
      ].join(' ')} role="status" />
      {label && <span className="spinner-label">{label}</span>}
    </div>
  )
}

export default Spinner