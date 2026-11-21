import React from 'react'
import { Link } from 'react-router-dom'
import { Plus, Bell, Moon, Sun } from 'lucide-react'
import logoImg from '../../assets/logo.png'
import { useFinance } from '../../context/FinanceContext'
import { Button } from '../common/Button'
import { CURRENCIES } from '../../utils/finance'

export function Topbar({ onOpenMobileMenu, onQuickAdd, onQuickSplit, notify }) {
  const { state, setTheme } = useFinance()
  const { user, theme, currency } = state

  const cur = CURRENCIES[currency] || CURRENCIES.INR

  const initials = (user?.name || 'A G')
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <header className="app-topbar">
      <div className="topbar-left">
        <div className="topbar-branding-mobile">
          <img src={logoImg} alt="FinGuard" className="topbar-logo-img" />
          <span className="brand-text-sm">FinGuard</span>
        </div>
      </div>

      <div className="topbar-right">
        <div className="currency-pill" title={`Active Currency: ${cur.label}`}>
          <span className="currency-symbol">{cur.symbol}</span>
          <span className="currency-code hidden-xs">{cur.code}</span>
        </div>

        <button
          type="button"
          className="topbar-icon-btn"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button
          type="button"
          className="topbar-icon-btn notification-btn"
          onClick={() => notify?.('All notifications caught up! No overdue payments.')}
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell size={18} />
          <span className="notification-dot" />
        </button>

        <div className="topbar-actions">
          <Button
            size="sm"
            variant="secondary"
            onClick={onQuickSplit}
            className="hidden-mobile"
          >
            Split Bill
          </Button>
          <Button
            size="sm"
            variant="primary"
            icon={Plus}
            onClick={onQuickAdd}
          >
            Add
          </Button>
        </div>

        <Link
          to="/settings"
          className="user-avatar-pill hidden-xs"
          title={`Student Profile & Settings: ${user?.name}`}
          style={{ textDecoration: 'none' }}
        >
          <span className="user-avatar-text">{initials}</span>
        </Link>
      </div>
    </header>
  )
}
