import React from 'react'

export function Badge({ children, variant = 'neutral', size = 'md', className = '' }) {
  return (
    <span className={`fg-badge fg-badge-${variant} fg-badge-${size} ${className}`}>
      {children}
    </span>
  )
}
