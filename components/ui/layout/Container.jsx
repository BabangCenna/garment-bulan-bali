'use client'

const Container = ({
  children,
  size      = 'lg', // 'sm' | 'md' | 'lg' | 'xl' | 'full'
  centered  = true,
  padded    = true,
  className = '',
  ...props
}) => (
  <div
    className={[
      'container',
      `container-${size}`,
      centered ? 'container-centered' : '',
      padded   ? 'container-padded'   : '',
      className,
    ].filter(Boolean).join(' ')}
    {...props}
  >
    {children}
  </div>
)

export default Container