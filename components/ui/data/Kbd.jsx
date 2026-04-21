'use client'

const KBD = ({ children, className = '', ...props }) => (
  <kbd className={['kbd', className].filter(Boolean).join(' ')} {...props}>
    {children}
  </kbd>
)

export default KBD