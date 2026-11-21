import React from 'react'

export function Card({ children, className = '', ...props }) {
  return (
    <div className={`fg-card ${className}`} {...props}>
      {children}
    </div>
  )
}
