import React, { useState, useEffect } from 'react'
import { Modal } from '../common/Modal'
import { Button } from '../common/Button'
import { Check } from 'lucide-react'
import { useFinance } from '../../context/FinanceContext'
import { EXPENSE_CATEGORIES, CURRENCIES } from '../../utils/finance'

export function BillModal({ isOpen, onClose, initialData, onSaved }) {
  const { state, addBill, updateBill } = useFinance()
  const currencySymbol = CURRENCIES[state.currency]?.symbol || '₹'

  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [due, setDue] = useState(new Date().toISOString().slice(0, 10))
  const [category, setCategory] = useState('Bills')
  const [recurring, setRecurring] = useState('Monthly')
  const [status, setStatus] = useState('Upcoming')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '')
      setAmount(initialData.amount ? String(initialData.amount) : '')
      setDue(initialData.due || new Date().toISOString().slice(0, 10))
      setCategory(initialData.category || 'Bills')
      setRecurring(initialData.recurring || 'Monthly')
      setStatus(initialData.status || 'Upcoming')
      setNote(initialData.note || '')
      setError('')
    } else {
      setTitle('')
      setAmount('')
      setDue(new Date().toISOString().slice(0, 10))
      setCategory('Bills')
      setRecurring('Monthly')
      setStatus('Upcoming')
      setNote('')
      setError('')
    }
  }, [initialData, isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('Please provide a name for this bill.')
      return
    }
    const numAmount = Number(amount)
    if (!numAmount || numAmount <= 0) {
      setError('Please provide a valid bill amount greater than 0.')
      return
    }

    const billData = {
      id: initialData?.id,
      title: title.trim(),
      amount: numAmount,
      due,
      category,
      recurring,
      status,
      note: note.trim(),
    }

    if (initialData?.id) {
      updateBill(billData)
      onSaved?.('Bill details updated.')
    } else {
      addBill(billData)
      onSaved?.('New bill scheduled.')
    }

    onClose()
  }

  if (!isOpen) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Bill' : 'Add Bill / Obligation'}
      subtitle={initialData ? 'Update due dates and recurring frequency.' : 'Stay ahead of upcoming financial commitments.'}
      maxWidth="480px"
    >
      <form onSubmit={handleSubmit} className="fg-form">
        {error && <div className="form-alert error">{error}</div>}

        <div className="form-group">
          <label htmlFor="bill-title" className="form-label">Bill Name</label>
          <input
            id="bill-title"
            type="text"
            className="form-input"
            placeholder="e.g. Wi-Fi Fiber, Hostel Rent, Spotify"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="bill-amount" className="form-label">Amount</label>
            <div className="input-prefix-wrap">
              <span className="input-prefix">{currencySymbol}</span>
              <input
                id="bill-amount"
                type="number"
                step="any"
                min="0.01"
                className="form-input has-prefix"
                placeholder="0.00"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value)
                  setError('')
                }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="bill-due" className="form-label">Due Date</label>
            <input
              id="bill-due"
              type="date"
              className="form-input"
              value={due}
              onChange={(e) => setDue(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="bill-category" className="form-label">Category</label>
            <select
              id="bill-category"
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {EXPENSE_CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="bill-recurring" className="form-label">Frequency</label>
            <select
              id="bill-recurring"
              className="form-select"
              value={recurring}
              onChange={(e) => setRecurring(e.target.value)}
            >
              <option value="Monthly">Monthly</option>
              <option value="Quarterly">Quarterly</option>
              <option value="Semester">Per Semester</option>
              <option value="Annual">Annual</option>
              <option value="One-time">One-time</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="bill-status" className="form-label">Status</label>
          <select
            id="bill-status"
            className="form-select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="Upcoming">Upcoming</option>
            <option value="Due soon">Due soon</option>
            <option value="Paid">Paid</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="bill-note" className="form-label">Note <span className="text-muted">(Optional)</span></label>
          <input
            id="bill-note"
            type="text"
            className="form-input"
            placeholder="Account / connection details"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <div className="modal-actions">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" icon={Check}>
            {initialData ? 'Save Changes' : 'Schedule Bill'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
