import React, { useState } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import {
  User,
  Mail,
  Lock,
  GraduationCap,
  Eye,
  EyeOff,
  ArrowRight,
  Zap,
  CheckCircle2,
  Sparkles,
  AlertCircle,
} from 'lucide-react'
import logoImg from '../assets/logo.png'
import { useFinance } from '../context/FinanceContext'
import { Button } from '../components/common/Button'

export function RegisterPage() {
  const navigate = useNavigate()
  const { isAuthenticated, register, state } = useFinance()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [major, setMajor] = useState('')
  const [year, setYear] = useState('Freshman')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // If already authenticated, redirect to home
  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Please provide your full student name.')
      return
    }

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid student email.')
      return
    }

    if (password.length < 6) {
      setError('Password must contain at least 6 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please recheck.')
      return
    }

    if (!agreeTerms) {
      setError('Please accept student privacy terms to proceed.')
      return
    }

    setLoading(true)

    try {
      const res = await register({
        name: name.trim(),
        email: email.trim(),
        password,
        major: major.trim(),
        year,
      })

      setLoading(false)

      if (res.success) {
        navigate('/')
      } else {
        setError(res.error || 'Failed to create account.')
      }
    } catch {
      setLoading(false)
      setError('An error occurred during registration. Please try again.')
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
              <span>Create Your Student Profile</span>
            </div>
            <h1 className="auth-hero-title">
              Start building healthy financial habits today.
            </h1>
            <p className="auth-hero-subtitle">
              Your free student companion for budget tracking, transparent bill splits with friends, and campus savings.
            </p>

            <div className="auth-perks-list">
              <div className="auth-perk-item">
                <CheckCircle2 size={18} className="perk-icon" />
                <div>
                  <strong>Designed for College Life</strong>
                  <span>Track dining, rent shares, academic supplies, and scholarships.</span>
                </div>
              </div>

              <div className="auth-perk-item">
                <CheckCircle2 size={18} className="perk-icon" />
                <div>
                  <strong>No Credit Card Required</strong>
                  <span>Always free for students with local-first privacy.</span>
                </div>
              </div>

              <div className="auth-perk-item">
                <CheckCircle2 size={18} className="perk-icon" />
                <div>
                  <strong>Multi-Currency Support</strong>
                  <span>INR (₹), USD ($), EUR (€), and GBP (£) with instant conversions.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="auth-hero-footer">
            <span className="badge-free">Privacy First</span>
            <span className="auth-footer-note">All data stored locally in your browser.</span>
          </div>
        </div>

        {/* Right Side: Registration Form */}
        <div className="auth-form-pane">
          <div className="auth-form-header">
            <div className="auth-mobile-brand">
              <img src={logoImg} alt="FinGuard" className="auth-mobile-logo" />
              <span className="font-bold text-main">FinGuard</span>
            </div>
            <h2 className="auth-title">Create Account</h2>
            <p className="auth-desc">Join your campus peers managing finances with ease.</p>
          </div>

          {error && (
            <div className="auth-error-banner" role="alert">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegisterSubmit} className="fg-form auth-form">
            <div className="form-group">
              <label htmlFor="reg-name" className="form-label">
                Full Name
              </label>
              <div className="input-with-icon">
                <User size={18} className="input-icon-left" />
                <input
                  id="reg-name"
                  type="text"
                  className="form-input has-left-icon"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="reg-email" className="form-label">
                Student Email
              </label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon-left" />
                <input
                  id="reg-email"
                  type="email"
                  className="form-input has-left-icon"
                  placeholder="Enter your student email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="reg-major" className="form-label">
                  Major / Field
                </label>
                <div className="input-with-icon">
                  <GraduationCap size={18} className="input-icon-left" />
                  <input
                    id="reg-major"
                    type="text"
                    className="form-input has-left-icon"
                    placeholder="e.g. Computer Science, Economics"
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                    autoComplete="off"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="reg-year" className="form-label">
                  Academic Year
                </label>
                <select
                  id="reg-year"
                  className="form-select"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                >
                  <option value="Freshman">Freshman (1st Yr)</option>
                  <option value="Sophomore">Sophomore (2nd Yr)</option>
                  <option value="Junior">Junior (3rd Yr)</option>
                  <option value="Senior">Senior (4th Yr)</option>
                  <option value="Graduate">Graduate / Masters</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="reg-password" className="form-label">
                  Password (min 6 chars)
                </label>
                <div className="input-with-icon">
                  <Lock size={18} className="input-icon-left" />
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    className="form-input has-left-icon has-right-icon"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
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

              <div className="form-group">
                <label htmlFor="reg-confirm-password" className="form-label">
                  Confirm Password
                </label>
                <div className="input-with-icon">
                  <Lock size={18} className="input-icon-left" />
                  <input
                    id="reg-confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    className="form-input has-left-icon"
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-checkbox-row">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                />
                <span>
                  I agree to the{' '}
                  <Link to="/privacy" target="_blank" className="auth-footer-link" style={{ textDecoration: 'underline' }}>
                    Student Privacy Policy
                  </Link>{' '}
                  and campus fair budgeting principles
                </span>
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full auth-submit-btn"
              disabled={loading}
            >
              {loading ? 'Creating your account...' : 'Create Student Account'}
              <ArrowRight size={18} />
            </Button>
          </form>

          <div className="auth-card-footer">
            <span>Already have an account?</span>
            <Link to="/login" className="auth-footer-link">
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
