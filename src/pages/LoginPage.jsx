import React, { useState } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  HelpCircle,
} from 'lucide-react'
import logoImg from '../assets/logo.png'
import { useFinance } from '../context/FinanceContext'
import { Button } from '../components/common/Button'

export function LoginPage() {
  const navigate = useNavigate()
  const { isAuthenticated, login, state } = useFinance()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [forgotInfo, setForgotInfo] = useState(false)

  // If already authenticated, redirect to home
  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await login(email, password)
      setLoading(false)
      if (res.success) {
        navigate('/')
      } else {
        setError(res.error || 'Failed to sign in. Please verify your credentials.')
      }
    } catch {
      setLoading(false)
      setError('An error occurred during sign in. Please try again.')
    }
  }

  return (
    <div className={`auth-page-root ${state.theme === 'dark' ? 'dark-mode' : 'light-mode'}`}>
      <div className="auth-card-wrapper">
        {/* Left Side: Student Benefits Hero */}
        <div className="auth-hero-pane">
          <div className="auth-hero-branding">
            <img src={logoImg} alt="FinGuard Logo" className="auth-hero-logo" />
            <div className="brand-info">
              <span className="brand-name">FinGuard</span>
              <span className="brand-tag">Student Finance</span>
            </div>
          </div>

          <div className="auth-hero-content">
            <div className="hero-eyebrow-pill">
              <Sparkles size={14} />
              <span>Built Exclusively for Students</span>
            </div>
            <h1 className="auth-hero-title">
              Master your campus finances with zero stress.
            </h1>
            <p className="auth-hero-subtitle">
              Budget monthly stipends, split roommate rent & groceries fairly, and track rule-based financial health.
            </p>

            <div className="auth-perks-list">
              <div className="auth-perk-item">
                <CheckCircle2 size={18} className="perk-icon" />
                <div>
                  <strong>3-Way Bill Splitting</strong>
                  <span>Equal, custom, or % splits with live who-owes-who settlement.</span>
                </div>
              </div>

              <div className="auth-perk-item">
                <CheckCircle2 size={18} className="perk-icon" />
                <div>
                  <strong>Rule-Based Financial Health</strong>
                  <span>Transparent metrics without fake AI claims or black-box algorithms.</span>
                </div>
              </div>

              <div className="auth-perk-item">
                <CheckCircle2 size={18} className="perk-icon" />
                <div>
                  <strong>Scholarship & Habit Radar</strong>
                  <span>Personalized opportunities matched with your major and GPA.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="auth-hero-footer">
            <span className="badge-free">100% Free Forever</span>
            <span className="auth-footer-note">No subscriptions. Local data privacy.</span>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="auth-form-pane">
          <div className="auth-form-header">
            <div className="auth-mobile-brand">
              <img src={logoImg} alt="FinGuard" className="auth-mobile-logo" />
              <span className="font-bold text-main">FinGuard</span>
            </div>
            <h2 className="auth-title">Welcome Back</h2>
            <p className="auth-desc">Sign in with your student credentials to continue.</p>
          </div>

          {error && (
            <div className="auth-error-banner" role="alert">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {forgotInfo && (
            <div className="auth-info-banner">
              <HelpCircle size={18} />
              <div>
                <strong>Password Recovery:</strong>
                <p>FinGuard accounts are linked to your student email. If you need a new login, you can create an account on the registration page.</p>
              </div>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="fg-form auth-form">
            <div className="form-group">
              <label htmlFor="login-email" className="form-label">
                Student Email
              </label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon-left" />
                <input
                  id="login-email"
                  type="email"
                  className="form-input has-left-icon"
                  placeholder="e.g. anuj@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="form-group">
              <div className="label-row-between">
                <label htmlFor="login-password" className="form-label">
                  Password
                </label>
                <button
                  type="button"
                  className="auth-link-btn"
                  onClick={() => setForgotInfo(!forgotInfo)}
                >
                  Forgot password?
                </button>
              </div>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon-left" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input has-left-icon has-right-icon"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="input-icon-right-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-checkbox-row">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember this browser</span>
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full auth-submit-btn"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In to Dashboard'}
              <ArrowRight size={18} />
            </Button>
          </form>

          <div className="auth-card-footer">
            <span>Don't have a student account?</span>
            <Link to="/register" className="auth-footer-link">
              Create an account
            </Link>
          </div>

          <div style={{ textAlign: 'center', marginTop: '14px', paddingTop: '10px', borderTop: '1px solid var(--border-light)' }}>
            <Link to="/privacy" className="auth-footer-link" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              FinGuard Student Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
