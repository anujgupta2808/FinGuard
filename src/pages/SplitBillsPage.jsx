import React, { useState, useMemo } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  Users2,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Trash2,
  Check,
  CreditCard,
  UserCheck,
  ChevronDown,
  Info,
  Calendar,
} from 'lucide-react'
import { useFinance } from '../context/FinanceContext'
import { formatCurrency, getSplitBillSummary } from '../utils/finance'
import { Card } from '../components/common/Card'
import { Button } from '../components/common/Button'
import { Badge } from '../components/common/Badge'
import { PageHeader } from '../components/common/PageHeader'
import { EmptyState } from '../components/common/EmptyState'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { SplitBillModal } from '../components/modals/SplitBillModal'

export function SplitBillsPage() {
  const { state, markParticipantPaid, settleSplitBill, deleteSplitBill } = useFinance()
  const { notify } = useOutletContext()
  const { splitBills, user, currency } = state
  const userName = user?.name || 'You'

  const [activeFilter, setActiveFilter] = useState('all') // 'all' | 'active' | 'settled'
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [billToDelete, setBillToDelete] = useState(null)
  const [billToSettle, setBillToSettle] = useState(null)

  // Top level summary calculation
  const summary = useMemo(() => {
    return getSplitBillSummary(splitBills, userName)
  }, [splitBills, userName])

  // Filtered bills
  const filteredBills = useMemo(() => {
    return (splitBills || []).filter((sb) => {
      const isSettled = sb.status === 'Settled' || sb.participants.every(p => p.paid)
      if (activeFilter === 'active' && isSettled) return false
      if (activeFilter === 'settled' && !isSettled) return false

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchTitle = sb.title?.toLowerCase().includes(q)
        const matchNote = sb.note?.toLowerCase().includes(q)
        const matchParticipant = sb.participants?.some(p => p.name?.toLowerCase().includes(q))
        if (!matchTitle && !matchNote && !matchParticipant) return false
      }

      return true
    }).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }, [splitBills, activeFilter, searchQuery])

  const handleDeleteConfirm = () => {
    if (billToDelete) {
      deleteSplitBill(billToDelete.id)
      notify?.(`Deleted split bill "${billToDelete.title}".`, 'info')
      setBillToDelete(null)
    }
  }

  const handleSettleConfirm = () => {
    if (billToSettle) {
      settleSplitBill(billToSettle.id)
      notify?.(`All shares for "${billToSettle.title}" marked as settled!`, 'success')
      setBillToSettle(null)
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
    <div className="split-bills-container">
      <PageHeader
        eyebrow="GROUP EXPENSES & SETTLEMENTS"
        title="Split Bills"
        description="Split food, hostel, or trip costs fairly and track real-time settlements with friends."
        actions={
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setIsModalOpen(true)}
          >
            Create Split Bill
          </Button>
        }
      />

      {/* Top Level Split Summary Cards (Section 23 of prompt) */}
      <div className="split-summary-grid">
        <Card className="split-metric-card border-success">
          <div className="split-metric-top">
            <span className="metric-title">You Will Receive</span>
            <div className="metric-icon-wrap success">
              <ArrowDownLeft size={18} />
            </div>
          </div>
          <div className="metric-value text-success">
            {formatCurrency(summary.youWillReceive, currency)}
          </div>
          <span className="metric-desc">
            From {summary.peopleWhoOweYou.length} friend{summary.peopleWhoOweYou.length === 1 ? '' : 's'} across active split bills
          </span>
        </Card>

        <Card className="split-metric-card border-danger">
          <div className="split-metric-top">
            <span className="metric-title">You Owe</span>
            <div className="metric-icon-wrap danger">
              <ArrowUpRight size={18} />
            </div>
          </div>
          <div className="metric-value text-danger">
            {formatCurrency(summary.youOwe, currency)}
          </div>
          <span className="metric-desc">
            To {summary.peopleYouOwe.length} friend{summary.peopleYouOwe.length === 1 ? '' : 's'} who covered payments
          </span>
        </Card>

        <Card className="split-metric-card">
          <div className="split-metric-top">
            <span className="metric-title">Net Settlement Balance</span>
            <div className="metric-icon-wrap primary">
              <Users2 size={18} />
            </div>
          </div>
          <div className={`metric-value ${summary.netBalance >= 0 ? 'text-success' : 'text-danger'}`}>
            {summary.netBalance >= 0 ? '+' : ''}{formatCurrency(summary.netBalance, currency)}
          </div>
          <span className="metric-desc">
            {summary.netBalance >= 0 ? 'You are owed more than you owe' : 'You currently owe more to friends'}
          </span>
        </Card>
      </div>

      {/* People Who Owe You / People You Owe Breakdown (Section 23) */}
      {(summary.peopleWhoOweYou.length > 0 || summary.peopleYouOwe.length > 0) && (
        <div className="debt-breakdown-grid">
          {/* People who owe you */}
          <Card className="debt-card">
            <div className="debt-card-header">
              <div className="header-icon success">
                <ArrowDownLeft size={16} />
              </div>
              <h4 className="debt-header-title">People who owe you ({summary.peopleWhoOweYou.length})</h4>
            </div>
            <div className="debt-list">
              {summary.peopleWhoOweYou.length === 0 ? (
                <p className="no-debt-note">No one owes you money right now.</p>
              ) : (
                summary.peopleWhoOweYou.map((person) => (
                  <div key={person.name} className="debt-item-row">
                    <div className="person-info">
                      <span className="person-name">{person.name}</span>
                      <span className="person-bills-note">
                        Owes for: {person.bills.map(b => b.title).join(', ')}
                      </span>
                    </div>
                    <div className="person-amount-action">
                      <span className="person-owing-amount text-success font-bold">
                        {formatCurrency(person.amount, currency)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* People you owe */}
          <Card className="debt-card">
            <div className="debt-card-header">
              <div className="header-icon danger">
                <ArrowUpRight size={16} />
              </div>
              <h4 className="debt-header-title">People you owe ({summary.peopleYouOwe.length})</h4>
            </div>
            <div className="debt-list">
              {summary.peopleYouOwe.length === 0 ? (
                <p className="no-debt-note">You are all squared up! No pending debts.</p>
              ) : (
                summary.peopleYouOwe.map((person) => (
                  <div key={person.name} className="debt-item-row">
                    <div className="person-info">
                      <span className="person-name">{person.name}</span>
                      <span className="person-bills-note">
                        Paid for: {person.bills.map(b => b.title).join(', ')}
                      </span>
                    </div>
                    <div className="person-amount-action">
                      <span className="person-owing-amount text-danger font-bold">
                        {formatCurrency(person.amount, currency)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Split Bills History Section (Section 24) */}
      <Card className="split-history-card">
        <div className="history-header-bar">
          <div className="history-tabs">
            <button
              type="button"
              className={`pill-tab ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              All Bills ({splitBills.length})
            </button>
            <button
              type="button"
              className={`pill-tab ${activeFilter === 'active' ? 'active' : ''}`}
              onClick={() => setActiveFilter('active')}
            >
              Active ({splitBills.filter(b => b.status !== 'Settled' && !b.participants.every(p => p.paid)).length})
            </button>
            <button
              type="button"
              className={`pill-tab ${activeFilter === 'settled' ? 'active' : ''}`}
              onClick={() => setActiveFilter('settled')}
            >
              Settled ({splitBills.filter(b => b.status === 'Settled' || b.participants.every(p => p.paid)).length})
            </button>
          </div>

          <div className="history-search">
            <Search size={15} className="search-icon" />
            <input
              type="text"
              placeholder="Search by title, friend name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="history-search-input"
            />
          </div>
        </div>

        {filteredBills.length === 0 ? (
          <EmptyState
            icon={Users2}
            title="No split bills found"
            description="Create your first group expense to split payments and track settlements."
            actionLabel="Create Split Bill"
            actionIcon={Plus}
            onAction={() => setIsModalOpen(true)}
          />
        ) : (
          <div className="split-bills-grid">
            {filteredBills.map((sb) => {
              const isSettled = sb.status === 'Settled' || sb.participants.every(p => p.paid)
              const userPaid = sb.paidBy === userName || sb.paidBy?.toLowerCase() === 'you' || sb.paidBy?.toLowerCase() === userName.toLowerCase()
              
              const userParticipant = sb.participants.find(p => p.name === userName || p.name?.toLowerCase() === 'you' || p.name?.toLowerCase() === userName.toLowerCase())
              const userShare = userParticipant ? userParticipant.share : 0

              const pendingParticipants = sb.participants.filter(p => !p.paid)

              return (
                <div key={sb.id} className={`split-card ${isSettled ? 'settled-card' : ''}`}>
                  {/* Card Header */}
                  <div className="split-card-header">
                    <div>
                      <div className="split-card-title-row">
                        <h4 className="split-bill-name">{sb.title}</h4>
                        <Badge variant={isSettled ? 'success' : 'warning'}>
                          {isSettled ? 'Settled ✓' : 'Active'}
                        </Badge>
                      </div>
                      <span className="split-card-meta">
                        {fmtDate(sb.date)} • Paid by <strong>{userPaid ? 'You' : sb.paidBy}</strong> • {sb.splitMethod} split
                      </span>
                    </div>
                    <div className="split-card-total-box">
                      <span className="total-label">Total Bill</span>
                      <span className="total-amount">{formatCurrency(sb.totalAmount, currency)}</span>
                    </div>
                  </div>

                  {sb.note && <p className="split-bill-note">"{sb.note}"</p>}

                  {/* Individual Shares & Expense Sync Highlight (Section 25 of prompt) */}
                  <div className="split-shares-highlight">
                    <div className="highlight-item">
                      <span className="hl-label">Your Share</span>
                      <strong className="hl-val">{formatCurrency(userShare, currency)}</strong>
                    </div>
                    <div className="highlight-sep" />
                    <div className="highlight-item">
                      <span className="hl-label">
                        {userPaid ? 'Others Owe You' : 'You Owe'}
                      </span>
                      <strong className={`hl-val ${userPaid ? 'text-success' : 'text-danger'}`}>
                        {userPaid
                          ? formatCurrency(sb.totalAmount - userShare, currency)
                          : formatCurrency(userShare, currency)}
                      </strong>
                    </div>
                    <div className="highlight-sep" />
                    <div className="highlight-item">
                      <span className="hl-label">Personal Expense</span>
                      <span className="hl-badge text-primary font-semibold">
                        {formatCurrency(userShare, currency)} logged
                      </span>
                    </div>
                  </div>

                  {/* Participants Settlement List (Section 21 & 22) */}
                  <div className="participants-settle-section">
                    <span className="settle-section-label">PARTICIPANTS & STATUS</span>
                    <div className="settle-participants-list">
                      {sb.participants.map((p) => {
                        const isSelf = p.name === userName || p.name?.toLowerCase() === 'you' || p.name?.toLowerCase() === userName.toLowerCase()
                        return (
                          <div key={p.id} className="participant-settle-row">
                            <div className="participant-profile">
                              <span className="p-avatar">{p.name[0]?.toUpperCase() || 'P'}</span>
                              <div className="p-details">
                                <span className="p-name">{p.name} {isSelf ? '(You)' : ''}</span>
                                <span className="p-share">{formatCurrency(p.share, currency)}</span>
                              </div>
                            </div>

                            <div className="participant-action-cell">
                              <span className={`p-status-badge ${p.paid ? 'paid' : 'pending'}`}>
                                {p.paid ? 'Paid ✓' : 'Pending'}
                              </span>

                              {/* Mark as paid / pending toggle */}
                              <button
                                type="button"
                                className={`p-settle-toggle-btn ${p.paid ? 'btn-paid' : 'btn-pending'}`}
                                onClick={() => {
                                  markParticipantPaid({
                                    splitBillId: sb.id,
                                    participantId: p.id,
                                    paid: !p.paid,
                                  })
                                  notify?.(
                                    !p.paid
                                      ? `Marked ${p.name}'s share (${formatCurrency(p.share, currency)}) as settled.`
                                      : `Reverted ${p.name}'s share to pending.`,
                                    'success'
                                  )
                                }}
                                title={p.paid ? 'Click to revert to Pending' : 'Click to mark as Paid'}
                              >
                                {p.paid ? 'Undo' : 'Mark Paid'}
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="split-card-footer">
                    {!isSettled ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={Check}
                        onClick={() => setBillToSettle(sb)}
                      >
                        Settle Entire Bill
                      </Button>
                    ) : (
                      <span className="settled-status-text">
                        <CheckCircle2 size={16} className="text-success" /> All {sb.participants.length} shares settled
                      </span>
                    )}

                    <button
                      type="button"
                      className="delete-split-btn"
                      onClick={() => setBillToDelete(sb)}
                      title="Delete Split Bill"
                      aria-label="Delete split bill"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {/* Create Split Bill Modal */}
      <SplitBillModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={(msg) => notify?.(msg, 'success')}
      />

      {/* Settle Entire Bill Dialog */}
      <ConfirmDialog
        isOpen={Boolean(billToSettle)}
        onClose={() => setBillToSettle(null)}
        onConfirm={handleSettleConfirm}
        title="Settle All Shares"
        message={`Mark all participant shares for "${billToSettle?.title}" (${formatCurrency(billToSettle?.totalAmount, currency)}) as paid?`}
        confirmText="Mark Fully Settled"
        variant="success"
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(billToDelete)}
        onClose={() => setBillToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Split Bill"
        message={`Are you sure you want to delete "${billToDelete?.title}"? This will remove the bill and all associated settlement tracking.`}
        confirmText="Delete Bill"
      />
    </div>
  )
}
