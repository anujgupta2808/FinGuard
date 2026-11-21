import React, { useState, useMemo } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  Receipt,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Trash2,
  Edit2,
  Repeat,
  Check,
} from 'lucide-react'
import { useFinance } from '../context/FinanceContext'
import { formatCurrency } from '../utils/finance'
import { Card } from '../components/common/Card'
import { Button } from '../components/common/Button'
import { Badge } from '../components/common/Badge'
import { PageHeader } from '../components/common/PageHeader'
import { EmptyState } from '../components/common/EmptyState'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { BillModal } from '../components/modals/BillModal'

export function BillsPage() {
  const { state, markBillPaid, deleteBill } = useFinance()
  const { notify } = useOutletContext()
  const { bills, currency } = state

  const [activeTab, setActiveTab] = useState('all') // 'all' | 'upcoming' | 'paid' | 'overdue'
  const [billToEdit, setBillToEdit] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [billToDelete, setBillToDelete] = useState(null)

  const todayStr = new Date().toISOString().slice(0, 10)
  const sevenDaysLater = new Date()
  sevenDaysLater.setDate(sevenDaysLater.getDate() + 7)
  const sevenDaysStr = sevenDaysLater.toISOString().slice(0, 10)

  // Classify bills dynamically based on due date
  const processedBills = useMemo(() => {
    return (bills || []).map(b => {
      let dynamicStatus = b.status
      if (b.status !== 'Paid') {
        if (b.due < todayStr) {
          dynamicStatus = 'Overdue'
        } else if (b.due <= sevenDaysStr) {
          dynamicStatus = 'Due soon'
        } else {
          dynamicStatus = 'Upcoming'
        }
      }
      return { ...b, computedStatus: dynamicStatus }
    })
  }, [bills, todayStr, sevenDaysStr])

  // Summary numbers (Section 16: "₹X due in next 7 days")
  const dueNext7DaysTotal = useMemo(() => {
    return processedBills
      .filter(b => b.computedStatus !== 'Paid' && b.due >= todayStr && b.due <= sevenDaysStr)
      .reduce((s, b) => s + Number(b.amount || 0), 0)
  }, [processedBills, todayStr, sevenDaysStr])

  const totalUnpaid = useMemo(() => {
    return processedBills
      .filter(b => b.computedStatus !== 'Paid')
      .reduce((s, b) => s + Number(b.amount || 0), 0)
  }, [processedBills])

  const paidCount = useMemo(() => {
    return processedBills.filter(b => b.computedStatus === 'Paid').length
  }, [processedBills])

  const filteredBills = useMemo(() => {
    return processedBills.filter(b => {
      if (activeTab === 'upcoming') return b.computedStatus === 'Upcoming' || b.computedStatus === 'Due soon'
      if (activeTab === 'overdue') return b.computedStatus === 'Overdue'
      if (activeTab === 'paid') return b.computedStatus === 'Paid'
      return true
    }).sort((a, b) => {
      // Unpaid first, then by due date
      if (a.computedStatus === 'Paid' && b.computedStatus !== 'Paid') return 1
      if (a.computedStatus !== 'Paid' && b.computedStatus === 'Paid') return -1
      return a.due.localeCompare(b.due)
    })
  }, [processedBills, activeTab])

  const handleDeleteConfirm = () => {
    if (billToDelete) {
      deleteBill(billToDelete.id)
      notify?.(`Deleted "${billToDelete.title}".`, 'info')
      setBillToDelete(null)
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
    <div className="bills-container">
      <PageHeader
        eyebrow="RECURRING & SCHEDULED PAYMENTS"
        title="Bills & Subscriptions"
        description="Stay on top of rent, utilities, subscriptions, and semester deadlines."
        actions={
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => {
              setBillToEdit(null)
              setIsModalOpen(true)
            }}
          >
            Add Bill
          </Button>
        }
      />

      {/* Summary Highlight (Section 16: "₹2,698 due in the next 7 days.") */}
      <div className="bills-metric-row">
        <Card className="bill-stat-card border-warning">
          <div className="bill-stat-icon warning">
            <Clock size={20} />
          </div>
          <div>
            <span className="stat-label">Due Next 7 Days</span>
            <div className="stat-value text-warning">{formatCurrency(dueNext7DaysTotal, currency)}</div>
            <span className="stat-subtext">Immediate upcoming commitments</span>
          </div>
        </Card>

        <Card className="bill-stat-card">
          <div className="bill-stat-icon primary">
            <Receipt size={20} />
          </div>
          <div>
            <span className="stat-label">Total Unpaid</span>
            <div className="stat-value text-main">{formatCurrency(totalUnpaid, currency)}</div>
            <span className="stat-subtext">All pending scheduled bills</span>
          </div>
        </Card>

        <Card className="bill-stat-card border-success">
          <div className="bill-stat-icon success">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <span className="stat-label">Bills Settled</span>
            <div className="stat-value text-success">{paidCount} Paid</div>
            <span className="stat-subtext">Up to date this cycle</span>
          </div>
        </Card>
      </div>

      <Card className="bills-main-card">
        {/* Navigation Tabs */}
        <div className="bills-tabs-bar">
          <div className="tab-group">
            <button
              type="button"
              className={`pill-tab ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All Bills ({bills.length})
            </button>
            <button
              type="button"
              className={`pill-tab ${activeTab === 'upcoming' ? 'active' : ''}`}
              onClick={() => setActiveTab('upcoming')}
            >
              Upcoming ({processedBills.filter(b => b.computedStatus === 'Upcoming' || b.computedStatus === 'Due soon').length})
            </button>
            <button
              type="button"
              className={`pill-tab ${activeTab === 'overdue' ? 'active' : ''}`}
              onClick={() => setActiveTab('overdue')}
            >
              Overdue ({processedBills.filter(b => b.computedStatus === 'Overdue').length})
            </button>
            <button
              type="button"
              className={`pill-tab ${activeTab === 'paid' ? 'active' : ''}`}
              onClick={() => setActiveTab('paid')}
            >
              Paid ({paidCount})
            </button>
          </div>
        </div>

        {/* Bills List / Table */}
        {filteredBills.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No bills found in this view"
            description="All commitments under this filter are settled or not yet scheduled."
            actionLabel="Schedule New Bill"
            actionIcon={Plus}
            onAction={() => {
              setBillToEdit(null)
              setIsModalOpen(true)
            }}
          />
        ) : (
          <div className="bills-list-wrap">
            {filteredBills.map((bill) => {
              const isPaid = bill.computedStatus === 'Paid'
              const isOverdue = bill.computedStatus === 'Overdue'
              const isDueSoon = bill.computedStatus === 'Due soon'

              const statusBadgeVariant = isPaid ? 'success' : isOverdue ? 'danger' : isDueSoon ? 'warning' : 'neutral'

              return (
                <div key={bill.id} className={`bill-card-item ${isPaid ? 'is-paid' : ''}`}>
                  <div className="bill-left-col">
                    <button
                      type="button"
                      className={`bill-check-circle ${isPaid ? 'checked' : ''}`}
                      onClick={() => {
                        markBillPaid(bill.id, !isPaid)
                        notify?.(isPaid ? `Marked ${bill.title} as unpaid.` : `Marked ${bill.title} as paid!`, 'success')
                      }}
                      title={isPaid ? 'Click to mark as unpaid' : 'Click to mark as paid'}
                      aria-label={`Toggle paid status for ${bill.title}`}
                    >
                      {isPaid && <Check size={14} />}
                    </button>

                    <div className="bill-primary-info">
                      <div className="bill-title-row">
                        <span className={`bill-name ${isPaid ? 'line-through text-muted' : ''}`}>
                          {bill.title}
                        </span>
                        {bill.recurring && (
                          <span className="recurring-chip">
                            <Repeat size={11} /> {bill.recurring}
                          </span>
                        )}
                      </div>
                      <div className="bill-sub-row">
                        <span className="bill-category">{bill.category}</span>
                        <span className="meta-sep">•</span>
                        <span className={`bill-due-txt ${isOverdue ? 'text-danger font-bold' : isDueSoon ? 'text-warning font-semibold' : ''}`}>
                          {isPaid ? `Paid • Due was ${fmtDate(bill.due)}` : `Due ${fmtDate(bill.due)}`}
                        </span>
                        {bill.note && (
                          <>
                            <span className="meta-sep">•</span>
                            <span className="bill-note-txt">{bill.note}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bill-right-col">
                    <div className="bill-pricing">
                      <span className="bill-price">{formatCurrency(bill.amount, currency)}</span>
                      <Badge variant={statusBadgeVariant}>
                        {bill.computedStatus}
                      </Badge>
                    </div>

                    <div className="bill-actions">
                      <button
                        type="button"
                        className="action-icon-btn"
                        title="Edit Bill"
                        onClick={() => {
                          setBillToEdit(bill)
                          setIsModalOpen(true)
                        }}
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        type="button"
                        className="action-icon-btn btn-danger-hover"
                        title="Delete Bill"
                        onClick={() => setBillToDelete(bill)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {/* Bill Add / Edit Modal */}
      <BillModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setBillToEdit(null)
        }}
        initialData={billToEdit}
        onSaved={(msg) => notify?.(msg, 'success')}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(billToDelete)}
        onClose={() => setBillToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Bill"
        message={`Are you sure you want to delete "${billToDelete?.title}" (${formatCurrency(billToDelete?.amount, currency)})?`}
        confirmText="Delete Bill"
      />
    </div>
  )
}
