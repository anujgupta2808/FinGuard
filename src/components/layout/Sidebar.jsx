import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  Receipt,
  Users2,
  GraduationCap,
  BarChart3,
  PiggyBank,
  Settings,
  X,
  Shield,
} from 'lucide-react'
import { useFinance } from '../../context/FinanceContext'

export const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/budget', label: 'Budget', icon: Wallet },
  { to: '/bills', label: 'Bills', icon: Receipt },
  { to: '/split-bills', label: 'Split Bills', icon: Users2, badge: 'New' },
  { to: '/scholarships', label: 'Scholarships', icon: GraduationCap },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/savings', label: 'Savings & Habits', icon: PiggyBank },
]

export const bottomNavItems = [
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar({ mobileOpen, onClose, onQuickAdd }) {
  const { state } = useFinance()
  const { habit } = state

  return (
    <>
      {mobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside className={`app-sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="sidebar-brand-row">
          <div className="brand-logo">
            <div className="brand-icon">
              <Shield size={20} />
            </div>
            <div className="brand-text">
              <span className="brand-title">FinGuard</span>
              <span className="brand-subtitle">Student Finance</span>
            </div>
          </div>
          <button
            type="button"
            className="sidebar-close-btn"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">MAIN MENU</div>
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                onClick={onClose}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              >
                <Icon size={19} className="nav-icon" />
                <span className="nav-label">{item.label}</span>
                {item.badge && <span className="nav-item-badge">{item.badge}</span>}
              </NavLink>
            )
          })}

          <div className="nav-section-label" style={{ marginTop: '20px' }}>ACCOUNT</div>
          {bottomNavItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              >
                <Icon size={19} className="nav-icon" />
                <span className="nav-label">{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="streak-widget">
            <div className="streak-header">
              <span className="streak-flame">🔥</span>
              <span className="streak-count">{habit?.streak || 0} Day Streak</span>
            </div>
            <p className="streak-text">Active financial tracking habits.</p>
            <div className="streak-progress-bar">
              <div
                className="streak-progress-fill"
                style={{ width: `${Math.min(100, ((habit?.xp || 0) % 250) / 2.5)}%` }}
              />
            </div>
            <span className="streak-xp">{habit?.xp || 0} Total XP</span>
          </div>
        </div>
      </aside>
    </>
  )
}
