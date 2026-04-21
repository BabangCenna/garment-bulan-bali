'use client'
import Avatar from './Avatar'

const AvatarGroup = ({
  avatars  = [], // [{ src, name, color }]
  max      = 4,
  size     = 'md',
  shape    = 'circle',
  className = '',
}) => {
  const visible  = avatars.slice(0, max)
  const overflow = avatars.length - max

  return (
    <div className={['avatar-group', className].filter(Boolean).join(' ')}>
      {visible.map((av, i) => (
        <Avatar
          key={i}
          src={av.src}
          name={av.name}
          size={size}
          shape={shape}
          color={av.color}
          title={av.name}
          className="avatar-group-item"
        />
      ))}
      {overflow > 0 && (
        <div className={`avatar avatar-${size} avatar-${shape} avatar-group-overflow`}>
          +{overflow}
        </div>
      )}
    </div>
  )
}

export default AvatarGroup