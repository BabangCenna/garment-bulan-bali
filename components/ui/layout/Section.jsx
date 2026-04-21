'use client'

const Section = ({
  children,
  title,
  subtitle,
  headerRight,
  padding   = 'md',    // 'none' | 'sm' | 'md' | 'lg'
  bordered  = false,
  bg        = 'none',  // 'none' | 'subtle' | 'muted'
  rounded   = false,
  className = '',
  ...props
}) => (
  <section
    className={[
      'section',
      `section-pad-${padding}`,
      bordered ? 'section-bordered' : '',
      bg !== 'none' ? `section-bg-${bg}` : '',
      rounded  ? 'section-rounded'  : '',
      className,
    ].filter(Boolean).join(' ')}
    {...props}
  >
    {(title || subtitle || headerRight) && (
      <div className="section-header">
        <div className="section-header-text">
          {title    && <div className="section-title">{title}</div>}
          {subtitle && <div className="section-subtitle">{subtitle}</div>}
        </div>
        {headerRight && <div className="section-header-right">{headerRight}</div>}
      </div>
    )}
    {children}
  </section>
)

export default Section