import React, { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
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
  MapPin,
  LogOut,
} from 'lucide-react'
import { useFinance } from '../context/FinanceContext'
import { CURRENCIES } from '../utils/finance'
import { Card } from '../components/common/Card'
import { Button } from '../components/common/Button'
import { PageHeader } from '../components/common/PageHeader'
import { ConfirmDialog } from '../components/common/ConfirmDialog'

export function SettingsPage() {
  const { state, setCurrency, setTheme, resetToSeed, updateUser, logout } = useFinance()
  const { notify } = useOutletContext()
  const { currency, theme, user } = state

  // Profile form state
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [major, setMajor] = useState(user?.major || '')
  const [year, setYear] = useState(user?.year || 'Freshman')
  const [gpa, setGpa] = useState(user?.gpa ? String(user.gpa) : '')
  const [location, setLocation] = useState(user?.location || '')
  const [needBased, setNeedBased] = useState(Boolean(user?.needBased))

  const [confirmResetOpen, setConfirmResetOpen] = useState(false)

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
      gpa: Number(gpa) || 3.0,
      location: location.trim(),
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
    notify?.('Reset application to sample student demo dataset.', 'info')
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
                <span className="profile-sub-display">{major} • {year} • GPA {gpa}</span>
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

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="set-user-gpa" className="form-label">Cumulative GPA (0 - 4.0)</label>
                <input
                  id="set-user-gpa"
                  type="number"
                  step="0.01"
                  min="0"
                  max="4.0"
                  className="form-input"
                  value={gpa}
                  onChange={(e) => setGpa(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="set-user-loc" className="form-label">Campus Location / Region</label>
                <input
                  id="set-user-loc"
                  type="text"
                  className="form-input"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
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
              <LogOut size={20} />
            </div>
            <div>
              <h3 className="settings-section-title">Account & Session</h3>
              <p className="settings-section-desc">You are currently signed in as <strong>{user?.email || 'anuj@example.com'}</strong>.</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Button
              variant="secondary"
              icon={LogOut}
              onClick={() => {
                logout()
                notify?.('You have been signed out.', 'info')
              }}
            >
              Sign Out of FinGuard
            </Button>
          </div>
        </Card>

        {/* 6. Danger Zone */}
        <Card className="settings-card border-danger">
          <div className="settings-card-header">
            <div className="settings-icon-box text-danger">
              <RotateCcw size={20} />
            </div>
            <div>
              <h3 className="settings-section-title text-danger">Reset Demo Data</h3>
              <p className="settings-section-desc">Restore the default sample student transactions, bills, and split expenses.</p>
            </div>
          </div>

          <div className="danger-zone-actions">
            <Button
              variant="danger"
              icon={RotateCcw}
              onClick={() => setConfirmResetOpen(true)}
            >
              Reset to Demo Dataset
            </Button>
          </div>
        </Card>
      </div>

      <ConfirmDialog
        isOpen={confirmResetOpen}
        onClose={() => setConfirmResetOpen(false)}
        onConfirm={handleResetData}
        title="Reset All Data?"
        message="This will overwrite any customized transactions, bills, and split expenses with the clean default student demonstration dataset."
        confirmText="Confirm Reset"
        variant="danger"
      />
    </div>
  )
}
