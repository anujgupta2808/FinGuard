import React, { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  Wallet,
  Settings,
  Check,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Info,
} from 'lucide-react'
import { useFinance } from '../context/FinanceContext'
import {
  formatCurrency,
  EXPENSE_CATEGORIES,
  CURRENCIES,
} from '../utils/finance'
import { Card } from '../components/common/Card'
import { Button } from '../components/common/Button'
import { Badge } from '../components/common/Badge'
import { PageHeader } from '../components/common/PageHeader'
import { Modal } from '../components/common/Modal'

export function BudgetPage() {
  const { state, updateBudget } = useFinance()
  const { notify } = useOutletContext()
  const { budgets, transactions, currency } = state

  const currencySymbol = CURRENCIES[currency]?.symbol || '₹'

  // Calculate current month's expenses per category
  const now = new Date()
  const curMonth = now.getMonth()
  const curYear = now.getFullYear()

  const currentMonthExpenses = (transactions || []).filter(t => {
    if (t.type !== 'expense') return false
    const d = new Date(`${t.date}T12:00:00`)
    return d.getMonth() === curMonth && d.getFullYear() === curYear
  })

  const totalSpent = currentMonthExpenses.reduce((s, t) => s + Number(t.amount || 0), 0)
  const totalBudget = Number(budgets?.total) || 1
  const remaining = Math.max(0, totalBudget - totalSpent)
  const percentUsed = Math.round((totalSpent / totalBudget) * 100)

  // Category breakdown
  const categoryBudgets = budgets?.categories || {}
  const categoryStats = EXPENSE_CATEGORIES.map(cat => {
    const limit = Number(categoryBudgets[cat]) || 0
    const spent = currentMonthExpenses.filter(t => t.category === cat).reduce((s, t) => s + Number(t.amount || 0), 0)
    const ratio = limit > 0 ? (spent / limit) * 100 : 0
    const isExceeded = limit > 0 && spent > limit
    const exceededAmount = spent - limit
    return {
      name: cat,
      limit,
      spent,
      ratio: Math.min(100, Math.round(ratio)),
      isExceeded,
      exceededAmount,
      remaining: Math.max(0, limit - spent),
    }
  })

  const exceededCategories = categoryStats.filter(c => c.isExceeded)

  // Edit budget modal state
  const [isEditing, setIsEditing] = useState(false)
  const [draftTotal, setDraftTotal] = useState(String(totalBudget))
  const [draftCategories, setDraftCategories] = useState({ ...categoryBudgets })

  const handleOpenEdit = () => {
    setDraftTotal(String(budgets?.total || 15000))
    setDraftCategories({ ...categoryBudgets })
    setIsEditing(true)
  }

  const handleSaveBudget = (e) => {
    e.preventDefault()
    const numTotal = Number(draftTotal) || 0
    if (numTotal <= 0) {
      notify?.('Please enter a valid monthly budget limit.', 'error')
      return
    }

    const updatedCategories = {}
    EXPENSE_CATEGORIES.forEach(cat => {
      updatedCategories[cat] = Number(draftCategories[cat]) || 0
    })

    updateBudget({
      total: numTotal,
      categories: updatedCategories,
    })

    setIsEditing(false)
    notify?.('Monthly budget plan updated successfully.', 'success')
  }

  return (
    <div className="budget-container">
      <PageHeader
        eyebrow="SPENDING LIMITS & PLANNING"
        title="Budget Planner"
        description="Set realistic spending caps by category and track real-time progress."
        actions={
          <Button variant="primary" icon={Settings} onClick={handleOpenEdit}>
            Adjust Budget Plan
          </Button>
        }
      />

      {/* Top Level Monthly Budget Card (Section 15) */}
      <Card className="budget-hero-card">
        <div className="budget-hero-top">
          <div>
            <span className="budget-hero-eyebrow">MONTHLY SPENDING OVERVIEW</span>
            <h2 className="budget-hero-title">
              {formatCurrency(totalBudget, currency)} Monthly Plan
            </h2>
            <p className="budget-hero-subtitle">
              You have used <strong>{percentUsed}%</strong> of your planned monthly budget limit.
            </p>
          </div>
          <div className="budget-hero-metric">
            <span className="metric-pct">{percentUsed}%</span>
            <span className="metric-label">Used so far</span>
          </div>
        </div>

        {/* 4 Numbers Row */}
        <div className="budget-stat-pills">
          <div className="stat-pill">
            <span className="pill-label">Monthly Budget</span>
            <span className="pill-value">{formatCurrency(totalBudget, currency)}</span>
          </div>
          <div className="stat-pill">
            <span className="pill-label">Amount Spent</span>
            <span className="pill-value text-main">{formatCurrency(totalSpent, currency)}</span>
          </div>
          <div className="stat-pill">
            <span className="pill-label">Remaining</span>
            <span className={`pill-value ${remaining < 2000 ? 'text-warning' : 'text-success'}`}>
              {formatCurrency(remaining, currency)}
            </span>
          </div>
          <div className="stat-pill">
            <span className="pill-label">Usage State</span>
            <span className="pill-value">
              <Badge variant={percentUsed > 100 ? 'danger' : percentUsed > 80 ? 'warning' : 'success'}>
                {percentUsed > 100 ? 'Exceeded' : percentUsed > 80 ? 'Near Limit' : 'On Track'}
              </Badge>
            </span>
          </div>
        </div>

        {/* Big Progress Bar */}
        <div className="budget-big-progress-wrap">
          <div
            className={`budget-big-progress-fill ${
              percentUsed > 100 ? 'bg-danger' : percentUsed > 80 ? 'bg-warning' : 'bg-success'
            }`}
            style={{ width: `${Math.min(100, percentUsed)}%` }}
          />
        </div>
      </Card>

      {/* Exceeded Category Warnings (Section 15: "Shopping budget exceeded by ₹600") */}
      {exceededCategories.length > 0 && (
        <div className="budget-alerts-section">
          {exceededCategories.map(cat => (
            <div key={cat.name} className="budget-exceeded-alert">
              <AlertTriangle size={18} className="alert-icon" />
              <span>
                <strong>{cat.name}</strong> budget exceeded by <strong>{formatCurrency(cat.exceededAmount, currency)}</strong>. (Spent {formatCurrency(cat.spent, currency)} of {formatCurrency(cat.limit, currency)} cap).
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Category Budgets Grid */}
      <div className="category-budgets-section">
        <div className="section-header-row">
          <div>
            <h3 className="section-title">Category Spending Limits</h3>
            <p className="section-subtitle">Individual monthly envelopes for your typical student expenses</p>
          </div>
          <div className="legend-pills">
            <span className="legend-tag"><i className="tag-dot bg-success" /> On Track</span>
            <span className="legend-tag"><i className="tag-dot bg-warning" /> Near Cap (80%+)</span>
            <span className="legend-tag"><i className="tag-dot bg-danger" /> Exceeded</span>
          </div>
        </div>

        <div className="category-cards-grid">
          {categoryStats.map((cat) => {
            const statusColor = cat.isExceeded ? 'danger' : cat.ratio > 80 ? 'warning' : 'success'
            return (
              <Card key={cat.name} className={`category-budget-card border-${statusColor}`}>
                <div className="cat-card-top">
                  <span className="cat-name">{cat.name}</span>
                  <Badge variant={statusColor === 'danger' ? 'danger' : statusColor === 'warning' ? 'warning' : 'neutral'}>
                    {cat.isExceeded ? 'Exceeded' : cat.ratio > 80 ? `${cat.ratio}% Used` : 'On track'}
                  </Badge>
                </div>

                <div className="cat-amounts-row">
                  <span className="cat-spent">{formatCurrency(cat.spent, currency)}</span>
                  <span className="cat-limit">of {formatCurrency(cat.limit, currency)}</span>
                </div>

                <div className="cat-progress-track">
                  <div
                    className={`cat-progress-fill bg-${statusColor}`}
                    style={{ width: `${Math.min(100, cat.ratio)}%` }}
                  />
                </div>

                <div className="cat-card-footer">
                  <span>
                    {cat.isExceeded
                      ? `Over by ${formatCurrency(cat.exceededAmount, currency)}`
                      : `${formatCurrency(cat.remaining, currency)} remaining`}
                  </span>
                  <span className="cat-ratio-text">{cat.ratio}%</span>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Adjust Budget Modal */}
      <Modal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        title="Adjust Budget Envelopes"
        subtitle="Set total monthly ceiling and allocate per-category targets."
        maxWidth="540px"
      >
        <form onSubmit={handleSaveBudget} className="fg-form">
          <div className="form-group">
            <label htmlFor="b-total" className="form-label">Total Monthly Cap</label>
            <div className="input-prefix-wrap">
              <span className="input-prefix">{currencySymbol}</span>
              <input
                id="b-total"
                type="number"
                step="any"
                min="100"
                className="form-input has-prefix"
                value={draftTotal}
                onChange={(e) => setDraftTotal(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-section-title" style={{ marginTop: '16px' }}>Category Envelopes</div>
          <div className="category-inputs-grid">
            {EXPENSE_CATEGORIES.map((cat) => (
              <div key={cat} className="form-group">
                <label className="form-label">{cat}</label>
                <div className="input-prefix-wrap">
                  <span className="input-prefix">{currencySymbol}</span>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    className="form-input has-prefix"
                    value={draftCategories[cat] ?? ''}
                    onChange={(e) => setDraftCategories({ ...draftCategories, [cat]: e.target.value })}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" icon={Check}>
              Save Budget Plan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
