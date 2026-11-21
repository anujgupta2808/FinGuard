import React from 'react'
import { Card } from './Card'

export function StatCard({
  icon: Icon,
  title,
  value,
  subtext,
  trend,
  trendDirection = 'neutral', // 'up' | 'down' | 'neutral'
  tone = 'primary', // 'primary' | 'success' | 'warning' | 'danger' | 'purple'
  badge,
  className = '',
}) {
  return (
    <Card className={`stat-card stat-tone-${tone} ${className}`}>
      <div className="stat-card-header">
        <div className="stat-icon-wrapper">
          {Icon && <Icon size={20} />}
        </div>
        {badge && <span className="stat-header-badge">{badge}</span>}
      </div>
      <div className="stat-card-body">
        <span className="stat-title">{title}</span>
        <div className="stat-value">{value}</div>
        {(subtext || trend) && (
          <div className="stat-footer">
            {trend && (
              <span className={`stat-trend trend-${trendDirection}`}>
                {trend}
              </span>
            )}
            {subtext && <span className="stat-subtext">{subtext}</span>}
          </div>
        )}
      </div>
    </Card>
  )
}
