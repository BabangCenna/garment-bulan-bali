'use client'

const Avatar = ({
  src,
  name,       // fallback initials from name
  size  = 'md',  // 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  shape = 'circle', // 'circle' | 'rounded' | 'square'
  color = 'primary',
  status,     // 'online' | 'offline' | 'busy' | 'away'
  className = '',
  ...props
}) => {
  const initials = name
    ? name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
    : '?'

  return (
    <div
      className={[
        'avatar',
        `avatar-${size}`,
        `avatar-${shape}`,
        !src ? `avatar-color-${color}` : '',
        className,
      ].filter(Boolean).join(' ')}
      {...props}
    >
      {src
        ? <img src={src} alt={name} className="avatar-img" />
        : <span className="avatar-initials">{initials}</span>
      }
      {status && <span className={`avatar-status avatar-status-${status}`} />}
    </div>
  )
}

export default Avatar