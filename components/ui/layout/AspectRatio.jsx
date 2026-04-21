'use client'

const RATIOS = {
  '1/1':   100,
  '16/9':  56.25,
  '4/3':   75,
  '3/2':   66.67,
  '21/9':  42.86,
  '9/16':  177.78,
}

const AspectRatio = ({
  children,
  ratio     = '16/9',
  className = '',
  ...props
}) => {
  const pct = RATIOS[ratio] ?? 56.25

  return (
    <div
      className={['aspect-ratio', className].filter(Boolean).join(' ')}
      style={{ paddingBottom: `${pct}%` }}
      {...props}
    >
      <div className="aspect-ratio-inner">{children}</div>
    </div>
  )
}

export default AspectRatio