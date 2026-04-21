// components/ui/button/LoadingButton.jsx
'use client'
import { forwardRef, useState } from 'react'
import Button from './Button'

const LoadingButton = forwardRef(({
  onClick,
  children,
  ...props
}, ref) => {
  const [loading, setLoading] = useState(false)

  const handle = async (e) => {
    if (!onClick) return
    try {
      setLoading(true)
      await onClick(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button ref={ref} loading={loading} onClick={handle} {...props}>
      {children}
    </Button>
  )
})

LoadingButton.displayName = 'LoadingButton'
export default LoadingButton