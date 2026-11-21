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
  Info,
} from 'lucide-react'
import { useFinance } from '../context/FinanceContext'
import { CURRENCIES } from '../utils/finance'
import { Card } from '../components/common/Card'
import { Button } from '../components/common/Button'
import { PageHeader } from '../components/common/PageHeader'
import { ConfirmDialog } from '../components/common/ConfirmDialog'

export function SettingsPage() {
  const { state, setCurrency, setTheme, resetToSeed } = useFinance()
  const { notify } = useOutletContext()
  const { currency, theme } = state

  const [confirmResetOpen, setConfirmResetOpen] = useState(false)

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

  return (
    <div className="settings-container">
      <PageHeader
        eyebrow="PREFERENCES & DATA MANAGEMENT"
        title="Settings"
        description="Customize currency formats, display preferences, and local data settings."
      />

      <div className="settings-sections">
        {/* Currency Settings */}
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

        {/* Theme Settings */}
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

        {/* Product Positioning & Policy (Section 2 & 3 of prompt) */}
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

        {/* Danger Zone */}
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
