import React, { useState } from 'react'
import { useOutletContext, Link } from 'react-router-dom'
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  PiggyBank,
  Plus,
  Users2,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Receipt,
  ArrowRight,
  Clock,
  Sparkles,
  ChevronRight,
} from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import { useFinance } from '../context/FinanceContext'
import {
  formatCurrency,
  formatShortCurrency,
  getMonthMetrics,
  getFinancialRisk,
  getSplitBillSummary,
} from '../utils/finance'
import { Card } from '../components/common/Card'
import { Button } from '../components/common/Button'
import { StatCard } from '../components/common/StatCard'
import { Badge } from '../components/common/Badge'

export function DashboardPage() {
  const { state, markBillPaid } = useFinance()
  const { notify, openAddTransaction, openAddSplitBill } = useOutletContext()
  const { user, currency, transactions, budgets, bills, splitBills, goal } = state

  const metrics = getMonthMetrics(transactions)
  const risk = getFinancialRisk(state)
  const splitSummary = getSplitBillSummary(splitBills, user.name)

  const budgetTotal = Number(budgets?.total) || 1
  const budgetSpent = metrics.expenses
  const budgetRemaining = Math.max(0, budgetTotal - budgetSpent)
  const budgetPercent = Math.min(100, Math.round((budgetSpent / budgetTotal) * 100))

  const todayStr = new Date().toISOString().slice(0, 10)
  const upcomingBills = (bills || [])
    .filter(b => b.status !== 'Paid')
    .sort((a, b) => a.due.localeCompare(b.due))
    .slice(0, 3)

  const recentTransactions = (transactions || []).slice(0, 5)

  // Chart data: 4 weeks of current month
  const chartData = [1, 2, 3, 4].map(w => {
    const weekTxs = (transactions || []).filter(t => {
      const d = new Date(`${t.date}T12:00:00`)
      const now = new Date()
      if (d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear()) return false
      const weekIndex = Math.min(3, Math.floor((d.getDate() - 1) / 7))
      return weekIndex === (w - 1)
    })
    const income = weekTxs.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount || 0), 0)
    const expenses = weekTxs.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount || 0), 0)
    return { name: `Week ${w}`, income, expenses }
  })

  // Format date helper
  const fmtDate = (d) => {
    try {
      return new Date(`${d}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    } catch {
      return d
    }
  }

  return (
    <div className="dashboard-container">
      {/* 1. Header Greeting & Quick Actions */}
      <div className="dashboard-hero">
        <div className="hero-text">
          <span className="hero-eyebrow">STUDENT FINANCIAL OVERVIEW</span>
          <h1 className="hero-greeting">Good day, {user?.name?.split(' ')[0] || 'Student'} 👋</h1>
          <p className="hero-subtext">
            Here is your financial snapshot. Your spending is {risk.label.toLowerCase()} with {formatCurrency(metrics.balance, currency)} net balance.
          </p>
        </div>
        <div className="hero-actions">
          <Button variant="secondary" icon={Users2} onClick={openAddSplitBill}>
            Split Bill
          </Button>
          <Button variant="primary" icon={Plus} onClick={openAddTransaction}>
            Add Transaction
          </Button>
        </div>
      </div>

      {/* 2. Four Core Financial Summary Cards (Section 11) */}
      <div className="summary-grid">
        <StatCard
          icon={Wallet}
          title="Current Balance"
          value={formatCurrency(metrics.balance, currency)}
          subtext="Net monthly cash flow"
          trend={metrics.balance >= 0 ? '+Positive' : '-Deficit'}
          trendDirection={metrics.balance >= 0 ? 'up' : 'down'}
          tone="primary"
        />
        <StatCard
          icon={ArrowDownLeft}
          title="Total Income"
          value={formatCurrency(metrics.income, currency)}
          subtext="Stipends, freelance & aid"
          tone="success"
        />
        <StatCard
          icon={ArrowUpRight}
          title="Total Expenses"
          value={formatCurrency(metrics.expenses, currency)}
          subtext={`${budgetPercent}% of monthly budget`}
          trend={`${budgetPercent}% used`}
          trendDirection={budgetPercent > 90 ? 'down' : 'up'}
          tone={budgetPercent > 90 ? 'danger' : 'warning'}
        />
        <StatCard
          icon={PiggyBank}
          title="Savings Cushion"
          value={formatCurrency(goal?.current || 0, currency)}
          subtext={`Goal: ${formatCurrency(goal?.target || 0, currency)}`}
          trend={`${Math.round(((goal?.current || 0) / Math.max(1, goal?.target || 1)) * 100)}%`}
          trendDirection="up"
          tone="purple"
        />
      </div>

      {/* 3. Rule-based Financial Health Banner (Section 3 & 28) */}
      <Card className={`health-banner health-tone-${risk.color}`}>
        <div className="health-banner-left">
          <div className="health-badge-icon">
            {risk.level === 'LOW' ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
          </div>
          <div className="health-banner-info">
            <div className="health-title-row">
              <span className="health-eyebrow">FINANCIAL HEALTH (RULE-BASED)</span>
              <Badge variant={risk.color === 'green' ? 'success' : risk.color === 'amber' ? 'warning' : 'danger'}>
                {risk.label}
              </Badge>
            </div>
            <p className="health-description">
              {risk.reasons.join(' ')}
            </p>
          </div>
        </div>
        <div className="health-banner-right">
          <div className="health-score-ring">
            <span className="score-number">{risk.score}</span>
            <span className="score-max">/100</span>
          </div>
        </div>
      </Card>

      {/* 4. Split Bills Quick Summary Bar (Section 23) */}
      {(splitSummary.youOwe > 0 || splitSummary.youWillReceive > 0) && (
        <Card className="split-quick-banner">
          <div className="split-quick-left">
            <div className="split-icon-badge">
              <Users2 size={20} />
            </div>
            <div>
              <span className="split-eyebrow">SPLIT BILLS STATUS</span>
              <div className="split-numbers-row">
                <span className="split-stat-item">
                  You Will Receive: <strong className="text-success">{formatCurrency(splitSummary.youWillReceive, currency)}</strong>
                </span>
                <span className="split-dot">•</span>
                <span className="split-stat-item">
                  You Owe: <strong className="text-danger">{formatCurrency(splitSummary.youOwe, currency)}</strong>
                </span>
              </div>
            </div>
          </div>
          <Link to="/split-bills" className="btn btn-secondary btn-sm">
            View Settlements <ChevronRight size={14} />
          </Link>
        </Card>
      )}

      {/* 5. Main Content Grid: Cashflow Chart + Two Column Sections */}
      <div className="dashboard-grid">
        {/* Left Column: Spending Chart & Recent Ledger */}
        <div className="grid-left-col">
          {/* Cashflow Chart */}
          <Card className="chart-card">
            <div className="card-header-row">
              <div>
                <h3 className="card-title">Monthly Cash Flow</h3>
                <p className="card-subtitle">Income vs expenses across current month weeks</p>
              </div>
              <div className="chart-legend">
                <span className="legend-item"><i className="legend-dot income-dot" /> Income</span>
                <span className="legend-item"><i className="legend-dot expense-dot" /> Expenses</span>
              </div>
            </div>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16A34A" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickFormatter={(v) => formatShortCurrency(v, currency)} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(val, name) => [formatCurrency(val, currency), name]}
                    contentStyle={{
                      background: 'var(--card-bg)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      color: 'var(--text-main)',
                      fontSize: '12px',
                    }}
                  />
                  <Area type="monotone" dataKey="income" name="Income" stroke="#16A34A" strokeWidth={2.5} fill="url(#incomeFill)" />
                  <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#2563EB" strokeWidth={2.5} fill="url(#expenseFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Recent Transactions Section */}
          <Card className="recent-tx-card">
            <div className="card-header-row">
              <div>
                <h3 className="card-title">Recent Transactions</h3>
                <p className="card-subtitle">Latest additions to your student ledger</p>
              </div>
              <Link to="/transactions" className="card-action-link">
                View All <ArrowRight size={14} />
              </Link>
            </div>
            <div className="tx-list">
              {recentTransactions.length === 0 ? (
                <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Receipt size={28} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
                  <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-main)', fontSize: '14px' }}>No transactions recorded yet</p>
                  <p style={{ margin: '4px 0 0', fontSize: '12px' }}>Click "Add Transaction" above to log your first income or expense.</p>
                </div>
              ) : (
                recentTransactions.map((tx) => (
                  <div key={tx.id} className="tx-list-item">
                    <div className={`tx-icon ${tx.type === 'income' ? 'income' : 'expense'}`}>
                      {tx.type === 'income' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                    </div>
                    <div className="tx-details">
                      <span className="tx-title">{tx.title}</span>
                      <span className="tx-meta">{tx.category} • {fmtDate(tx.date)}</span>
                    </div>
                    <div className={`tx-amount ${tx.type === 'income' ? 'text-success' : 'text-main'}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Upcoming Bills & Budget Progress */}
        <div className="grid-right-col">
          {/* Budget Progress Card */}
          <Card className="budget-progress-card">
            <div className="card-header-row">
              <div>
                <h3 className="card-title">Monthly Budget</h3>
                <p className="card-subtitle">Spending progress vs planned cap</p>
              </div>
              <Link to="/budget" className="card-action-link">
                Adjust <ChevronRight size={14} />
              </Link>
            </div>
            <div className="budget-numbers">
              <div>
                <span className="budget-label">Spent</span>
                <span className="budget-val">{formatCurrency(budgetSpent, currency)}</span>
              </div>
              <div className="budget-sep" />
              <div>
                <span className="budget-label">Limit</span>
                <span className="budget-val">{formatCurrency(budgetTotal, currency)}</span>
              </div>
              <div className="budget-sep" />
              <div>
                <span className="budget-label">Remaining</span>
                <span className={`budget-val ${budgetRemaining < 1000 ? 'text-danger' : 'text-success'}`}>
                  {formatCurrency(budgetRemaining, currency)}
                </span>
              </div>
            </div>
            <div className="progress-bar-wrap">
              <div
                className={`progress-fill ${budgetPercent > 95 ? 'bg-danger' : budgetPercent > 75 ? 'bg-warning' : 'bg-primary'}`}
                style={{ width: `${budgetPercent}%` }}
              />
            </div>
            <div className="budget-progress-footer">
              <span>{budgetPercent}% used</span>
              <span>{100 - budgetPercent}% left</span>
            </div>
          </Card>

          {/* Upcoming Bills Card */}
          <Card className="upcoming-bills-card">
            <div className="card-header-row">
              <div>
                <h3 className="card-title">Upcoming Obligations</h3>
                <p className="card-subtitle">Bills due in the next days</p>
              </div>
              <Link to="/bills" className="card-action-link">
                All Bills <ArrowRight size={14} />
              </Link>
            </div>
            <div className="bills-compact-list">
              {upcomingBills.length === 0 ? (
                <div className="empty-bills-note">
                  <CheckCircle2 size={18} className="text-success" />
                  <span>{(bills || []).length === 0 ? 'No bills scheduled yet.' : 'All scheduled bills are currently paid!'}</span>
                </div>
              ) : (
                upcomingBills.map((bill) => {
                  const isDueSoon = bill.due <= todayStr
                  return (
                    <div key={bill.id} className="bill-compact-row">
                      <div className="bill-icon-badge">
                        <Receipt size={16} />
                      </div>
                      <div className="bill-compact-info">
                        <span className="bill-title">{bill.title}</span>
                        <span className="bill-due-date">Due {fmtDate(bill.due)}</span>
                      </div>
                      <div className="bill-compact-action">
                        <span className="bill-amount">{formatCurrency(bill.amount, currency)}</span>
                        <button
                          type="button"
                          className="mark-paid-link"
                          onClick={() => {
                            markBillPaid(bill.id, true)
                            notify?.(`Marked ${bill.title} as paid.`)
                          }}
                        >
                          Mark Paid
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
