import React, { useState } from 'react'
import { useOutletContext, Link } from 'react-router-dom'
import {
  Settings,
  Moon,
  Sun,
  Coins,
  ShieldCheck,
  RotateCcw,
  Check,
  User,
  GraduationCap,
  Mail,
  LogOut,
  Copy,
  DownloadCloud,
  Cloud,
  RefreshCw,
  FileText,
} from 'lucide-react'
import { useFinance } from '../context/FinanceContext'
import { CURRENCIES } from '../utils/finance'
import { createSessionSyncCode, decodeSessionSyncCode } from '../utils/auth'
import { Card } from '../components/common/Card'
import { Button } from '../components/common/Button'
import { PageHeader } from '../components/common/PageHeader'
import { ConfirmDialog } from '../components/common/ConfirmDialog'

export function SettingsPage() {
  const {
    state,
    session,
    accounts,
    setCurrency,
    setTheme,
    resetToSeed,
    updateUser,
    logout,
    syncWithCloud,
    importSyncData,
  } = useFinance()
  const { notify } = useOutletContext()
  const { currency, theme, user } = state

  // Sync state
  const [syncInput, setSyncInput] = useState('')
  const [copiedSync, setCopiedSync] = useState(false)
  const [isCloudSyncing, setIsCloudSyncing] = useState(false)

  // Profile form state
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [major, setMajor] = useState(user?.major || '')
  const [year, setYear] = useState(user?.year || 'Freshman')
  const [needBased, setNeedBased] = useState(Boolean(user?.needBased))

  const [confirmResetOpen, setConfirmResetOpen] = useState(false)

  const handleCopySyncCode = () => {
    const code = createSessionSyncCode(state, accounts)
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code)
      setCopiedSync(true)
      notify?.('Session sync code copied to clipboard! Paste it on your other browser.', 'success')
      setTimeout(() => setCopiedSync(false), 3000)
    } else {
      notify?.('Could not access clipboard automatically.', 'error')
    }
  }

  const handleApplySyncCode = (e) => {
    e.preventDefault()
    if (!syncInput.trim()) return
    const bundle = decodeSessionSyncCode(syncInput.trim())
    if (bundle) {
      importSyncData(bundle)
      notify?.('Session and data synchronized successfully from other browser!', 'success')
      setSyncInput('')
    } else {
      notify?.('Invalid or corrupt sync code. Please check and re-copy.', 'error')
    }
  }

  const handleCloudSyncNow = async () => {
    setIsCloudSyncing(true)
    try {
      const res = await syncWithCloud()
      setIsCloudSyncing(false)
      if (res.success) {
        notify?.('Account data and transactions successfully synchronized with cloud! Consistent across all browsers.', 'success')
      } else {
        notify?.('Cloud sync: ' + (res.error || 'Failed to sync with cloud. Local data preserved.'), 'warning')
      }
    } catch {
      setIsCloudSyncing(false)
      notify?.('Cloud sync temporarily unavailable. Operating on local storage.', 'warning')
    }
  }

  const handleProfileSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) {
      notify?.('Please enter your name.', 'error')
      return
    }

    updateUser({
      ...user,
      name: name.trim(),
      email: email.trim(),
      major: major.trim(),
      year,
      needBased,
    })

    notify?.('Student profile updated successfully!', 'success')
  }

  const handleCurrencyChange = (newCode) => {
    setCurrency(newCode)
    notify?.(`Currency set to ${CURRENCIES[newCode].label}.`, 'success')
  }

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme)
    notify?.(`Switched to ${newTheme} mode.`, 'success')
  }

  const handleResetData = () => {
    resetToSeed()
    notify?.('All data cleared successfully.', 'info')
    setConfirmResetOpen(false)
  }

  const initials = (name || user?.name || 'A G')
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="settings-container">
      <PageHeader
        eyebrow="PREFERENCES & DATA MANAGEMENT"
        title="Settings & Profile"
        description="Manage your student profile, currency formatting, display theme, and local data."
      />

      <div className="settings-sections">
        {/* 1. Student Profile Section */}
        <Card className="settings-card">
          <div className="settings-card-header">
            <div className="settings-icon-box text-primary">
              <User size={20} />
            </div>
            <div>
              <h3 className="settings-section-title">Student Profile</h3>
              <p className="settings-section-desc">
                Your academic background powers personalized scholarship matching and student budgeting tips.
              </p>
            </div>
          </div>

          <form onSubmit={handleProfileSubmit} className="fg-form">
            <div className="profile-avatar-row" style={{ marginTop: '4px' }}>
              <div className="avatar-circle">
                {initials}
              </div>
              <div>
                <h4 className="profile-name-display">{name || 'Student Name'}</h4>
                <span className="profile-sub-display">{major ? `${major} • ${year}` : year}</span>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="set-user-name" className="form-label">Full Name</label>
                <input
                  id="set-user-name"
                  type="text"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="set-user-email" className="form-label">Student Email</label>
                <input
                  id="set-user-email"
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="set-user-major" className="form-label">Major / Field of Study</label>
                <input
                  id="set-user-major"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Computer Science, Economics"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="set-user-year" className="form-label">Academic Year</label>
                <select
                  id="set-user-year"
                  className="form-select"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                >
                  <option value="Freshman">Freshman (1st Year)</option>
                  <option value="Sophomore">Sophomore (2nd Year)</option>
                  <option value="Junior">Junior (3rd Year)</option>
                  <option value="Senior">Senior (4th Year)</option>
                  <option value="Graduate">Graduate / Master's</option>
                </select>
              </div>
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={needBased}
                  onChange={(e) => setNeedBased(e.target.checked)}
                />
                <span>I qualify for or am interested in need-based student financial grants</span>
              </label>
            </div>

            <div className="profile-form-footer">
              <Button type="submit" variant="primary" icon={Check}>
                Save Profile Changes
              </Button>
            </div>
          </form>
        </Card>

        {/* 2. Currency Settings */}
        <Card className="settings-card">
          <div className="settings-card-header">
            <div className="settings-icon-box">
              <Coins size={20} />
            </div>
            <div>
              <h3 className="settings-section-title">Display Currency</h3>
              <p className="settings-section-desc">Select the primary currency symbol for your transactions, splits, and reports.</p>
            </div>
          </div>

          <div className="currency-selector-grid">
            {Object.values(CURRENCIES).map((cur) => {
              const isSelected = currency === cur.code
              return (
                <button
                  key={cur.code}
                  type="button"
                  className={`currency-option-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleCurrencyChange(cur.code)}
                >
                  <span className="cur-symbol">{cur.symbol}</span>
                  <div className="cur-text">
                    <span className="cur-code">{cur.code}</span>
                    <span className="cur-label">{cur.label.split(' - ')[1] || cur.label}</span>
                  </div>
                  {isSelected && <Check size={16} className="text-primary cur-check" />}
                </button>
              )
            })}
          </div>
        </Card>

        {/* 3. Theme Settings */}
        <Card className="settings-card">
          <div className="settings-card-header">
            <div className="settings-icon-box">
              {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
            </div>
            <div>
              <h3 className="settings-section-title">Appearance & Theme</h3>
              <p className="settings-section-desc">Choose between clear light mode and comfortable dark mode.</p>
            </div>
          </div>

          <div className="theme-toggle-row">
            <button
              type="button"
              className={`theme-pick-btn ${theme === 'light' ? 'active' : ''}`}
              onClick={() => handleThemeChange('light')}
            >
              <Sun size={18} />
              <span>Light Mode</span>
            </button>
            <button
              type="button"
              className={`theme-pick-btn ${theme === 'dark' ? 'active' : ''}`}
              onClick={() => handleThemeChange('dark')}
            >
              <Moon size={18} />
              <span>Dark Mode</span>
            </button>
          </div>
        </Card>

        {/* 4. Product Positioning & Privacy */}
        <Card className="settings-card">
          <div className="settings-card-header">
            <div className="settings-icon-box">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="settings-section-title">About FinGuard & Privacy</h3>
              <p className="settings-section-desc">Transparent financial technology built specifically for students.</p>
            </div>
          </div>

          <div className="about-info-box">
            <p>
              <strong>FinGuard</strong> is an offline-first, client-side personal financial manager designed to keep student spending simple, responsible, and transparent.
            </p>
            <ul className="about-points">
              <li>
                <strong>Rule-based Financial Health:</strong> All health scores, risk alerts, and category thresholds use deterministic arithmetic calculations rather than black-box AI claims.
              </li>
              <li>
                <strong>Local Storage Security:</strong> Your ledger entries, bills, and split settlements are securely saved in your browser's private local storage. No account credentials or cloud storage needed.
              </li>
              <li>
                <strong>Integrated Group Splits:</strong> Split bill expenses accurately distinguish between total group bills and your personal share, keeping your financial analytics clean.
              </li>
            </ul>
          </div>
        </Card>

        {/* 5. Account & Session */}
        <Card className="settings-card">
          <div className="settings-card-header">
            <div className="settings-icon-box text-primary">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="settings-section-title">Account & Active Session</h3>
              <p className="settings-section-desc">Manage your authenticated student session across multiple browsers and devices.</p>
            </div>
          </div>

          <div style={{ background: 'var(--surface)', padding: '14px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a' }} />
                  <strong style={{ fontSize: '14px' }}>Authenticated Session Active</strong>
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                  Signed in as <strong>{user?.email || session?.email || 'anuj@example.com'}</strong>
                </p>
                {session?.token && (
                  <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', fontFamily: 'monospace' }}>
                    Session Token: {session.token.slice(0, 18)}...
                  </span>
                )}
              </div>
              <Button
                variant="secondary"
                size="sm"
                icon={LogOut}
                onClick={() => {
                  logout()
                  notify?.('You have been signed out.', 'info')
                }}
              >
                Sign Out
              </Button>
            </div>
          </div>

          {/* Automatic Cloud Synchronization across all browsers */}
          <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '14px 16px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.25)', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ flex: 1, minWidth: '220px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Cloud size={16} className="text-success" />
                  <strong style={{ fontSize: '13px' }}>Cross-Browser Real-Time Cloud Sync</strong>
                  <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 6px', background: '#10b981', color: '#fff', borderRadius: '4px' }}>ACTIVE</span>
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                  Your student data (transactions, budgets, bills, split bills, scholarships) automatically synchronizes with the cloud. When you log in with this email on any other browser or mobile phone, all your data will remain constant, identical, and fully intact.
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                icon={RefreshCw}
                onClick={handleCloudSyncNow}
                disabled={isCloudSyncing}
              >
                {isCloudSyncing ? 'Syncing...' : 'Sync Cloud Now'}
              </Button>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '12px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Manual Offline Backup & Transfer Code</h4>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
              For offline or air-gapped devices without an active internet connection, you can generate and import a 1-click encrypted sync bundle below.
            </p>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '14px' }}>
              <Button
                variant="secondary"
                size="sm"
                icon={Copy}
                onClick={handleCopySyncCode}
              >
                {copiedSync ? 'Copied to Clipboard! ✓' : 'Copy Session Sync Code'}
              </Button>
            </div>

            <form onSubmit={handleApplySyncCode} style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                type="text"
                className="form-input"
                style={{ flex: 1, minWidth: '220px', fontSize: '13px', height: '36px' }}
                placeholder="Paste sync code from another browser here..."
                value={syncInput}
                onChange={(e) => setSyncInput(e.target.value)}
              />
              <Button type="submit" variant="primary" size="sm" icon={DownloadCloud}>
                Apply Sync
              </Button>
            </form>
          </div>
        </Card>

        {/* 6. Student Data Privacy & Policy */}
        <Card className="settings-card">
          <div className="settings-card-header">
            <div className="settings-icon-box text-success">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="settings-section-title">Student Privacy & Data Protection</h3>
              <p className="settings-section-desc">Zero tracking, no data selling, and local data sovereignty.</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', background: 'var(--surface)', padding: '14px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <div>
              <strong style={{ fontSize: '13px' }}>FinGuard Student Privacy Pledge</strong>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                Review our comprehensive student privacy policy, encryption standards, and zero-ad principles.
              </p>
            </div>
            <Link to="/privacy" className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}>
              <FileText size={15} /> View Privacy Policy
            </Link>
          </div>
        </Card>

        {/* 7. Danger Zone */}
        <Card className="settings-card border-danger">
          <div className="settings-card-header">
            <div className="settings-icon-box text-danger">
              <RotateCcw size={20} />
            </div>
            <div>
              <h3 className="settings-section-title text-danger">Clear All Stored Data</h3>
              <p className="settings-section-desc">Erase all recorded transactions, bills, and split expenses to return to a clean empty state.</p>
            </div>
          </div>

          <div className="danger-zone-actions">
            <Button
              variant="danger"
              icon={RotateCcw}
              onClick={() => setConfirmResetOpen(true)}
            >
              Clear All Stored Data
            </Button>
          </div>
        </Card>
      </div>

      <ConfirmDialog
        isOpen={confirmResetOpen}
        onClose={() => setConfirmResetOpen(false)}
        onConfirm={handleResetData}
        title="Clear All Stored Data?"
        message="This will remove all transactions, bills, split bills, and budget entries from your local browser storage."
        confirmText="Clear All Data"
        variant="danger"
      />
    </div>
  )
}
