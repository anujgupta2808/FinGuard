import React from 'react'

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className = '',
}) {
  return (
    <div className={`page-header ${className}`}>
      <div className="page-header-text">
        {eyebrow && <span className="page-eyebrow">{eyebrow}</span>}
        <h1 className="page-title">{title}</h1>
        {description && <p className="page-description">{description}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </div>
  )
}
