import React, { useMemo } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  BarChart3,
  Download,
  Printer,
  TrendingUp,
  Wallet,
  Receipt,
  Users2,
  Calendar,
  CheckCircle2,
  PieChart as PieIcon,
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts'
import { useFinance } from '../context/FinanceContext'
import {
  formatCurrency,
  formatShortCurrency,
  getMonthMetrics,
  getSplitBillSummary,
  EXPENSE_CATEGORIES,
} from '../utils/finance'
import { exportMonthlyReportToCSV } from '../utils/export'
import { Card } from '../components/common/Card'
import { Button } from '../components/common/Button'
import { Badge } from '../components/common/Badge'
import { PageHeader } from '../components/common/PageHeader'

export function ReportsPage() {
  const { state } = useFinance()
  const { notify } = useOutletContext()
  const { transactions, budgets, bills, splitBills, user, currency } = state

  const monthName = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const metrics = getMonthMetrics(transactions)
  const splitSummary = getSplitBillSummary(splitBills, user.name)

  const budgetTotal = Number(budgets?.total) || 1
  const budgetUsedPct = Math.round((metrics.expenses / budgetTotal) * 100)

  // Current month's category spending
  const now = new Date()
  const curMonth = now.getMonth()
  const curYear = now.getFullYear()

  const currentMonthExpenses = (transactions || []).filter(t => {
    if (t.type !== 'expense') return false
    const d = new Date(`${t.date}T12:00:00`)
    return d.getMonth() === curMonth && d.getFullYear() === curYear
  })

  const categoryBreakdown = useMemo(() => {
    return EXPENSE_CATEGORIES.map(cat => {
      const spent = currentMonthExpenses.filter(t => t.category === cat).reduce((s, t) => s + Number(t.amount || 0), 0)
      const limit = Number(budgets?.categories?.[cat]) || 0
      return {
        name: cat,
        spent,
        limit,
        status: limit > 0 && spent > limit ? 'Exceeded' : 'Normal',
      }
    }).filter(c => c.spent > 0).sort((a, b) => b.spent - a.spent)
  }, [currentMonthExpenses, budgets])

  const topCategory = categoryBreakdown.length > 0 ? categoryBreakdown[0] : { name: 'None', spent: 0 }

  // Bills summary
  const paidBillsCount = (bills || []).filter(b => b.status === 'Paid').length
  const totalBillsCount = (bills || []).length

  const handleExportCSV = () => {
    exportMonthlyReportToCSV({
      monthName,
      metrics,
      topCategory: { name: topCategory.name, amount: topCategory.spent },
      categoryBreakdown,
      billsSummary: {
        paidCount: paidBillsCount,
        paidTotal: (bills || []).filter(b => b.status === 'Paid').reduce((s, b) => s + Number(b.amount || 0), 0),
        upcomingCount: (bills || []).filter(b => b.status !== 'Paid').length,
        upcomingTotal: (bills || []).filter(b => b.status !== 'Paid').reduce((s, b) => s + Number(b.amount || 0), 0),
        overdueCount: 0,
        overdueTotal: 0,
      },
      splitSummary,
    }, currency)

    notify?.(`Exported ${monthName} financial report to CSV.`, 'success')
  }

  const handlePrint = () => {
    window.print()
  }

  // Chart data for category bars
  const colors = ['#2563EB', '#16A34A', '#F59E0B', '#8B5CF6', '#06B6D4', '#EC4899', '#64748B']

  return (
    <div className="reports-container">
      <PageHeader
        eyebrow="AUDIT & PERFORMANCE"
        title="Financial Reports"
        description={`Comprehensive statement and category analysis for ${monthName}.`}
        actions={
          <div className="header-action-group">
            <Button variant="secondary" icon={Printer} onClick={handlePrint}>
              Print Report
            </Button>
            <Button variant="primary" icon={Download} onClick={handleExportCSV}>
              Export CSV
            </Button>
          </div>
        }
      />

      {/* Top Monthly Metrics Card (Section 29) */}
      <Card className="report-hero-card">
        <div className="report-hero-header">
          <div>
            <span className="report-eyebrow">MONTHLY STATEMENT</span>
            <h2 className="report-month-title">{monthName} Overview</h2>
            <p className="report-sub">Student account statement for {user?.name}</p>
          </div>
          <Badge variant="success" size="lg">Statement Verified</Badge>
        </div>

        <div className="report-metrics-grid">
          <div className="report-metric-box">
            <span className="rep-label">Total Earned</span>
            <span className="rep-value text-success">+{formatCurrency(metrics.income, currency)}</span>
            <span className="rep-hint">All stipends & earnings</span>
          </div>

          <div className="report-metric-box">
            <span className="rep-label">Total Spent</span>
            <span className="rep-value text-danger">-{formatCurrency(metrics.expenses, currency)}</span>
            <span className="rep-hint">{budgetUsedPct}% of monthly budget</span>
          </div>

          <div className="report-metric-box">
            <span className="rep-label">Net Savings</span>
            <span className={`rep-value ${metrics.balance >= 0 ? 'text-success' : 'text-danger'}`}>
              {formatCurrency(metrics.balance, currency)}
            </span>
            <span className="rep-hint">{metrics.savingsRate}% savings rate</span>
          </div>

          <div className="report-metric-box">
            <span className="rep-label">Top Spending</span>
            <span className="rep-value text-main">{topCategory.name}</span>
            <span className="rep-hint">{formatCurrency(topCategory.spent, currency)} total</span>
          </div>
        </div>
      </Card>

      {/* Two Column Grid: Category Breakdown Chart + Summary Tables */}
      <div className="report-grid">
        {/* Left Column: Spending by Category Bar Chart */}
        <Card className="report-chart-card">
          <div className="card-header-row">
            <div>
              <h3 className="card-title">Spending by Category</h3>
              <p className="card-subtitle">Where your money went this month</p>
            </div>
            <PieIcon size={18} className="text-muted" />
          </div>

          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={categoryBreakdown} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                <XAxis type="number" tickFormatter={(v) => formatShortCurrency(v, currency)} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fill: 'var(--text-main)', fontSize: 12 }} width={80} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(val) => [formatCurrency(val, currency), 'Spent']}
                  contentStyle={{
                    background: 'var(--card-bg)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--text-main)',
                  }}
                />
                <Bar dataKey="spent" radius={[0, 4, 4, 0]}>
                  {categoryBreakdown.map((_, index) => (
                    <Cell key={index} fill={colors[index % colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Right Column: Execution Summary Table */}
        <Card className="report-summary-card">
          <div className="card-header-row">
            <div>
              <h3 className="card-title">Account Performance Metrics</h3>
              <p className="card-subtitle">Budget, obligations, and settlements audit</p>
            </div>
            <BarChart3 size={18} className="text-muted" />
          </div>

          <div className="report-audit-list">
            <div className="audit-item">
              <span className="audit-label">Budget Adherence</span>
              <strong className={`audit-val ${budgetUsedPct > 100 ? 'text-danger' : 'text-success'}`}>
                {budgetUsedPct}% Cap Used
              </strong>
            </div>

            <div className="audit-item">
              <span className="audit-label">Bills Settled</span>
              <strong className="audit-val">
                {paidBillsCount} of {totalBillsCount} Paid ({Math.round((paidBillsCount / Math.max(1, totalBillsCount)) * 100)}%)
              </strong>
            </div>

            <div className="audit-item">
              <span className="audit-label">Active Split Bills</span>
              <strong className="audit-val">
                {splitSummary.totalActive} active ({splitSummary.totalSettled} settled)
              </strong>
            </div>

            <div className="audit-item">
              <span className="audit-label">Net Split Receivables</span>
              <strong className={`audit-val ${splitSummary.netBalance >= 0 ? 'text-success' : 'text-danger'}`}>
                {splitSummary.netBalance >= 0 ? '+' : ''}{formatCurrency(splitSummary.netBalance, currency)}
              </strong>
            </div>

            <div className="audit-item">
              <span className="audit-label">Ledger Transactions Count</span>
              <strong className="audit-val">
                {transactions.length} entries recorded
              </strong>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
