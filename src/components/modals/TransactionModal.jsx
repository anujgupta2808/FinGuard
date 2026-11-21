import React, { useState, useEffect } from 'react'
import { Modal } from '../common/Modal'
import { Button } from '../common/Button'
import { ArrowUpRight, ArrowDownLeft, Sparkles, Check } from 'lucide-react'
import { useFinance } from '../../context/FinanceContext'
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES, categorize, CURRENCIES } from '../../utils/finance'

export function TransactionModal({ isOpen, onClose, initialData, onSaved }) {
  const { state, addTransaction, updateTransaction } = useFinance()
  const currencySymbol = CURRENCIES[state.currency]?.symbol || '₹'

  const [type, setType] = useState('expense')
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [method, setMethod] = useState('UPI')
  const [notes, setNotes] = useState('')
  const [manualCategory, setManualCategory] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (initialData) {
      setType(initialData.type || 'expense')
      setTitle(initialData.title || '')
      setAmount(initialData.amount ? String(initialData.amount) : '')
      setCategory(initialData.category || '')
      setDate(initialData.date || new Date().toISOString().slice(0, 10))
      setMethod(initialData.method || 'UPI')
      setNotes(initialData.notes || '')
      setManualCategory(true)
    } else {
      setType('expense')
      setTitle('')
      setAmount('')
      setCategory('Food')
      setDate(new Date().toISOString().slice(0, 10))
      setMethod('UPI')
      setNotes('')
      setManualCategory(false)
      setError('')
    }
  }, [initialData, isOpen])

  const categoryList = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
  const suggestedCategory = categorize(title)

  const handleTitleChange = (e) => {
    const val = e.target.value
    setTitle(val)
    if (!manualCategory && val.trim()) {
      const autoCat = categorize(val)
      if (categoryList.includes(autoCat)) {
        setCategory(autoCat)
      }
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('Please enter a description for this transaction.')
      return
    }
    const numAmount = Number(amount)
    if (!numAmount || numAmount <= 0) {
      setError('Please enter a valid amount greater than 0.')
      return
    }

    const txData = {
      id: initialData?.id,
      title: title.trim(),
      amount: numAmount,
      type,
      category: category || (type === 'income' ? 'Salary' : 'Food'),
      date,
      method,
      notes: notes.trim(),
    }

    if (initialData?.id) {
      updateTransaction(txData)
      onSaved?.('Transaction updated successfully.')
    } else {
      addTransaction(txData)
      onSaved?.('Transaction added to your ledger.')
    }

    onClose()
  }

  if (!isOpen) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Transaction' : 'Record Transaction'}
      subtitle={initialData ? 'Update details in your financial ledger.' : 'Keep your spending and income accurate.'}
      maxWidth="480px"
    >
      <form onSubmit={handleSubmit} className="fg-form">
        <div className="type-toggle-group">
          <button
            type="button"
            className={`type-toggle-btn ${type === 'expense' ? 'active-expense' : ''}`}
            onClick={() => {
              setType('expense')
              if (!EXPENSE_CATEGORIES.includes(category)) setCategory('Food')
            }}
          >
            <ArrowUpRight size={16} />
            <span>Expense</span>
          </button>
          <button
            type="button"
            className={`type-toggle-btn ${type === 'income' ? 'active-income' : ''}`}
            onClick={() => {
              setType('income')
              if (!INCOME_CATEGORIES.includes(category)) setCategory('Salary')
            }}
          >
            <ArrowDownLeft size={16} />
            <span>Income</span>
          </button>
        </div>

        {error && <div className="form-alert error">{error}</div>}

        <div className="form-group">
          <label htmlFor="tx-title" className="form-label">Title / Merchant</label>
          <input
            id="tx-title"
            type="text"
            className="form-input"
            placeholder={type === 'expense' ? 'e.g. Campus Canteen Lunch' : 'e.g. Internship Stipend'}
            value={title}
            onChange={handleTitleChange}
            autoFocus
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="tx-amount" className="form-label">Amount</label>
            <div className="input-prefix-wrap">
              <span className="input-prefix">{currencySymbol}</span>
              <input
                id="tx-amount"
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
            <label htmlFor="tx-date" className="form-label">Date</label>
            <input
              id="tx-date"
              type="date"
              className="form-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <div className="form-label-row">
              <label htmlFor="tx-category" className="form-label">Category</label>
              {!manualCategory && suggestedCategory !== 'Other' && (
                <span className="smart-tag">
                  <Sparkles size={11} /> Auto-suggested
                </span>
              )}
            </div>
            <select
              id="tx-category"
              className="form-select"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value)
                setManualCategory(true)
              }}
            >
              {categoryList.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="tx-method" className="form-label">Payment Method</label>
            <select
              id="tx-method"
              className="form-select"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
            >
              <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
              <option value="Card">Debit / Credit Card</option>
              <option value="Bank transfer">Net Banking / Transfer</option>
              <option value="Cash">Cash</option>
              <option value="Direct deposit">Direct Deposit</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="tx-notes" className="form-label">Note <span className="text-muted">(Optional)</span></label>
          <input
            id="tx-notes"
            type="text"
            className="form-input"
            placeholder="Add context or notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="modal-actions">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" icon={Check}>
            {initialData ? 'Save Changes' : 'Record Transaction'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
