import React, { useState, useMemo } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  Search,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  Trash2,
  Edit2,
  Download,
  Calendar,
  CreditCard,
  X,
} from 'lucide-react'
import { useFinance } from '../context/FinanceContext'
import {
  formatCurrency,
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
} from '../utils/finance'
import { exportTransactionsToCSV } from '../utils/export'
import { Card } from '../components/common/Card'
import { Button } from '../components/common/Button'
import { Badge } from '../components/common/Badge'
import { PageHeader } from '../components/common/PageHeader'
import { EmptyState } from '../components/common/EmptyState'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { TransactionModal } from '../components/modals/TransactionModal'

export function TransactionsPage() {
  const { state, deleteTransaction } = useFinance()
  const { notify } = useOutletContext()
  const { transactions, currency } = state

  const [activeTab, setActiveTab] = useState('all') // 'all' | 'income' | 'expense'
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedMethod, setSelectedMethod] = useState('All')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [sortOrder, setSortOrder] = useState('newest') // 'newest' | 'oldest' | 'highest'

  // Modals state
  const [editTx, setEditTx] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [txToDelete, setTxToDelete] = useState(null)

  const allCategories = useMemo(() => {
    const set = new Set([...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES])
    return ['All', ...Array.from(set)]
  }, [])

  const filteredTransactions = useMemo(() => {
    return (transactions || []).filter((tx) => {
      if (activeTab === 'income' && tx.type !== 'income') return false
      if (activeTab === 'expense' && tx.type !== 'expense') return false

      if (selectedCategory !== 'All' && tx.category !== selectedCategory) return false
      if (selectedMethod !== 'All' && tx.method !== selectedMethod) return false

      if (fromDate && tx.date < fromDate) return false
      if (toDate && tx.date > toDate) return false

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchesTitle = tx.title?.toLowerCase().includes(query)
        const matchesCat = tx.category?.toLowerCase().includes(query)
        const matchesNote = tx.notes?.toLowerCase().includes(query)
        if (!matchesTitle && !matchesCat && !matchesNote) return false
      }

      return true
    }).sort((a, b) => {
      if (sortOrder === 'newest') return b.date.localeCompare(a.date)
      if (sortOrder === 'oldest') return a.date.localeCompare(b.date)
      if (sortOrder === 'highest') return Number(b.amount) - Number(a.amount)
      return 0
    })
  }, [transactions, activeTab, selectedCategory, selectedMethod, fromDate, toDate, searchQuery, sortOrder])

  const incomeTotal = useMemo(() => {
    return filteredTransactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount || 0), 0)
  }, [filteredTransactions])

  const expenseTotal = useMemo(() => {
    return filteredTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount || 0), 0)
  }, [filteredTransactions])

  const handleExport = () => {
    exportTransactionsToCSV(filteredTransactions, currency)
    notify?.(`Exported ${filteredTransactions.length} transactions to CSV.`)
  }

  const handleDeleteConfirm = () => {
    if (txToDelete) {
      deleteTransaction(txToDelete.id)
      notify?.(`Deleted "${txToDelete.title}".`, 'info')
      setTxToDelete(null)
    }
  }

  const fmtDate = (d) => {
    try {
      return new Date(`${d}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    } catch {
      return d
    }
  }

  return (
    <div className="transactions-container">
      <PageHeader
        eyebrow="FINANCIAL LEDGER"
        title="Transactions"
        description="Search, filter, and audit all recorded student income and expenses."
        actions={
          <div className="header-action-group">
            <Button
              variant="secondary"
              icon={Download}
              onClick={handleExport}
              disabled={filteredTransactions.length === 0}
            >
              Export CSV
            </Button>
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => {
                setEditTx(null)
                setIsModalOpen(true)
              }}
            >
              Add Transaction
            </Button>
          </div>
        }
      />

      {/* Summary Pills */}
      <div className="tx-summary-strip">
        <div className="tx-strip-item">
          <span className="strip-label">Filtered Results</span>
          <span className="strip-value">{filteredTransactions.length} records</span>
        </div>
        <div className="tx-strip-sep" />
        <div className="tx-strip-item">
          <span className="strip-label">Total Income</span>
          <span className="strip-value text-success">+{formatCurrency(incomeTotal, currency)}</span>
        </div>
        <div className="tx-strip-sep" />
        <div className="tx-strip-item">
          <span className="strip-label">Total Expenses</span>
          <span className="strip-value text-danger">-{formatCurrency(expenseTotal, currency)}</span>
        </div>
        <div className="tx-strip-sep" />
        <div className="tx-strip-item">
          <span className="strip-label">Net Filtered Flow</span>
          <span className={`strip-value ${incomeTotal - expenseTotal >= 0 ? 'text-success' : 'text-danger'}`}>
            {formatCurrency(incomeTotal - expenseTotal, currency)}
          </span>
        </div>
      </div>

      <Card className="tx-main-card">
        {/* Navigation Tabs (Section 45: All, Income, Expenses) */}
        <div className="tx-tabs-header">
          <div className="tx-tab-buttons">
            <button
              type="button"
              className={`tx-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All Records ({transactions.length})
            </button>
            <button
              type="button"
              className={`tx-tab-btn ${activeTab === 'income' ? 'active' : ''}`}
              onClick={() => setActiveTab('income')}
            >
              Income ({transactions.filter(t => t.type === 'income').length})
            </button>
            <button
              type="button"
              className={`tx-tab-btn ${activeTab === 'expense' ? 'active' : ''}`}
              onClick={() => setActiveTab('expense')}
            >
              Expenses ({transactions.filter(t => t.type === 'expense').length})
            </button>
          </div>
        </div>

        {/* Filter Toolbar (Section 13) */}
        <div className="tx-toolbar">
          <div className="search-box-wrap">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              className="tx-search-input"
              placeholder="Search by merchant, title, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => setSearchQuery('')}
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="tx-filter-controls">
            <div className="control-item">
              <label htmlFor="cat-filter" className="sr-only">Category</label>
              <select
                id="cat-filter"
                className="filter-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {allCategories.map(c => (
                  <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
                ))}
              </select>
            </div>

            <div className="control-item">
              <label htmlFor="method-filter" className="sr-only">Payment Method</label>
              <select
                id="method-filter"
                className="filter-select"
                value={selectedMethod}
                onChange={(e) => setSelectedMethod(e.target.value)}
              >
                <option value="All">All Methods</option>
                <option value="UPI">UPI</option>
                <option value="Card">Card</option>
                <option value="Bank transfer">Bank Transfer</option>
                <option value="Cash">Cash</option>
                <option value="Direct deposit">Direct Deposit</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="control-item date-range-group">
              <input
                type="date"
                className="filter-date-input"
                aria-label="From date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
              <span className="date-sep">to</span>
              <input
                type="date"
                className="filter-date-input"
                aria-label="To date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>

            <div className="control-item">
              <select
                className="filter-select"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Amount</option>
              </select>
            </div>
          </div>
        </div>

        {/* Transactions Table / List */}
        {filteredTransactions.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No transactions match your filters"
            description="Try modifying search keywords or clearing applied date and category filters."
            actionLabel="Add New Transaction"
            actionIcon={Plus}
            onAction={() => {
              setEditTx(null)
              setIsModalOpen(true)
            }}
          />
        ) : (
          <div className="table-responsive">
            <table className="fg-table">
              <thead>
                <tr>
                  <th>TRANSACTION</th>
                  <th>CATEGORY</th>
                  <th>DATE</th>
                  <th>METHOD</th>
                  <th className="text-right">AMOUNT</th>
                  <th className="text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((tx) => {
                  const isIncome = tx.type === 'income'
                  return (
                    <tr key={tx.id}>
                      <td>
                        <div className="tx-cell-title">
                          <div className={`tx-icon-sm ${isIncome ? 'income' : 'expense'}`}>
                            {isIncome ? <ArrowDownLeft size={15} /> : <ArrowUpRight size={15} />}
                          </div>
                          <div>
                            <span className="tx-name">{tx.title}</span>
                            {tx.notes && <span className="tx-note">{tx.notes}</span>}
                          </div>
                        </div>
                      </td>
                      <td>
                        <Badge variant="neutral">{tx.category}</Badge>
                      </td>
                      <td className="text-muted">{fmtDate(tx.date)}</td>
                      <td>
                        <span className="method-tag">{tx.method || 'Other'}</span>
                      </td>
                      <td className={`text-right font-semibold ${isIncome ? 'text-success' : 'text-main'}`}>
                        {isIncome ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                      </td>
                      <td className="text-right">
                        <div className="table-actions">
                          <button
                            type="button"
                            className="action-icon-btn"
                            title="Edit Transaction"
                            onClick={() => {
                              setEditTx(tx)
                              setIsModalOpen(true)
                            }}
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            type="button"
                            className="action-icon-btn btn-danger-hover"
                            title="Delete Transaction"
                            onClick={() => setTxToDelete(tx)}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add / Edit Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditTx(null)
        }}
        initialData={editTx}
        onSaved={(msg) => notify?.(msg, 'success')}
      />

      {/* Delete Confirmation Dialog (Section 34) */}
      <ConfirmDialog
        isOpen={Boolean(txToDelete)}
        onClose={() => setTxToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Transaction"
        message={`Are you sure you want to delete "${txToDelete?.title}" (${formatCurrency(txToDelete?.amount, currency)})? This will permanently remove it from your financial records.`}
        confirmText="Delete Transaction"
      />
    </div>
  )
}
