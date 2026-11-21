import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  Receipt,
  Users2,
  Menu,
} from 'lucide-react'

export function BottomNav({ onOpenMore }) {
  const primaryMobileTabs = [
    { to: '/', label: 'Home', icon: LayoutDashboard, exact: true },
    { to: '/transactions', label: 'History', icon: ArrowLeftRight },
    { to: '/split-bills', label: 'Split', icon: Users2 },
    { to: '/budget', label: 'Budget', icon: Wallet },
    { to: '/bills', label: 'Bills', icon: Receipt },
  ]

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Bottom Navigation">
      {primaryMobileTabs.map((tab) => {
        const Icon = tab.icon
        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.exact}
            className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon size={20} className="bottom-nav-icon" />
            <span className="bottom-nav-label">{tab.label}</span>
          </NavLink>
        )
      })}
      <button
        type="button"
        className="bottom-nav-item bottom-nav-more"
        onClick={onOpenMore}
        aria-label="More options"
      >
        <Menu size={20} className="bottom-nav-icon" />
        <span className="bottom-nav-label">More</span>
      </button>
    </nav>
  )
}
