'use client'

export const Skeleton = ({
  width,
  height  = '16px',
  rounded = false,
  circle  = false,
  className = '',
  style = {},
}) => (
  <span
    className={['skeleton', rounded || circle ? 'skeleton-rounded' : '', className].filter(Boolean).join(' ')}
    style={{
      width:  circle ? height : (width || '100%'),
      height,
      borderRadius: circle ? '50%' : undefined,
      ...style,
    }}
  />
)

export const SkeletonText = ({ lines = 3, lastWidth = '60%' }) => (
  <div className="skeleton-text">
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        height="14px"
        width={i === lines - 1 ? lastWidth : '100%'}
      />
    ))}
  </div>
)

export const SkeletonCard = () => (
  <div className="skeleton-card">
    <div className="skeleton-card-header">
      <Skeleton circle height="40px" />
      <div style={{ flex: 1 }}>
        <Skeleton height="14px" width="60%" />
        <Skeleton height="12px" width="40%" style={{ marginTop: 6 }} />
      </div>
    </div>
    <SkeletonText lines={3} />
    <Skeleton height="120px" rounded />
  </div>
)

export default Skeleton