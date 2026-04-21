'use client'

const Stack = ({
  children,
  direction = 'column', // 'column' | 'row'
  gap       = 'md',     // 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  align,    // flex align-items
  justify,  // flex justify-content
  wrap      = false,
  divider,  // JSX divider between items
  className = '',
  ...props
}) => {
  const items = Array.isArray(children) ? children.filter(Boolean) : [children]

  return (
    <div
      className={[
        'stack',
        `stack-${direction}`,
        `stack-gap-${gap}`,
        wrap ? 'stack-wrap' : '',
        className,
      ].filter(Boolean).join(' ')}
      style={{
        alignItems:     align,
        justifyContent: justify,
      }}
      {...props}
    >
      {divider
        ? items.map((child, i) => (
            <div key={i} style={{ display: 'contents' }}>
              {child}
              {i < items.length - 1 && divider}
            </div>
          ))
        : children
      }
    </div>
  )
}

export default Stack