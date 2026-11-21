import React, { useState, useEffect } from 'react'
import { Modal } from '../common/Modal'
import { Button } from '../common/Button'
import { Plus, Trash2, Users2, Check, AlertCircle } from 'lucide-react'
import { useFinance } from '../../context/FinanceContext'
import { EXPENSE_CATEGORIES, CURRENCIES, formatCurrency } from '../../utils/finance'

export function SplitBillModal({ isOpen, onClose, onSaved }) {
  const { state, addSplitBill } = useFinance()
  const userName = state.user?.name || 'You'
  const currency = state.currency || 'INR'
  const currencySymbol = CURRENCIES[currency]?.symbol || '₹'

  const [title, setTitle] = useState('')
  const [totalAmount, setTotalAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [category, setCategory] = useState('Food')
  const [note, setNote] = useState('')
  const [paidBy, setPaidBy] = useState(userName)
  const [splitMethod, setSplitMethod] = useState('equal') // 'equal' | 'custom' | 'percentage'
  const [addToExpenses, setAddToExpenses] = useState(true)

  const [participants, setParticipants] = useState([
    { id: 'p-user', name: userName, isUser: true, share: 0, percent: 50 },
    { id: 'p-friend-1', name: 'Rahul Sharma', isUser: false, share: 0, percent: 50 },
  ])

  const [customShares, setCustomShares] = useState({})
  const [percentageShares, setPercentageShares] = useState({})
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setTitle('')
      setTotalAmount('')
      setDate(new Date().toISOString().slice(0, 10))
      setCategory('Food')
      setNote('')
      setPaidBy(userName)
      setSplitMethod('equal')
      setAddToExpenses(true)
      setError('')
      const initialParts = [
        { id: `p-${Date.now()}-1`, name: userName, isUser: true, share: 0, percent: 50 },
        { id: `p-${Date.now()}-2`, name: 'Rahul', isUser: false, share: 0, percent: 50 },
      ]
      setParticipants(initialParts)
      setCustomShares({})
      setPercentageShares({ [initialParts[0].id]: 50, [initialParts[1].id]: 50 })
    }
  }, [isOpen, userName])

  const numTotal = Number(totalAmount) || 0

  // Calculate shares based on method
  const computedParticipants = participants.map((p) => {
    let share = 0
    if (splitMethod === 'equal') {
      share = participants.length > 0 && numTotal > 0 ? Math.round((numTotal / participants.length) * 100) / 100 : 0
    } else if (splitMethod === 'custom') {
      share = Number(customShares[p.id]) || 0
    } else if (splitMethod === 'percentage') {
      const pct = Number(percentageShares[p.id]) || 0
      share = Math.round((numTotal * (pct / 100)) * 100) / 100
    }

    return {
      id: p.id,
      name: p.name.trim() || 'Friend',
      share,
      paid: p.name === paidBy,
      status: p.name === paidBy ? 'Paid' : 'Pending',
    }
  })

  // Real-time validation stats
  let customSum = 0
  let pctSum = 0
  if (splitMethod === 'custom') {
    customSum = Object.values(customShares).reduce((s, v) => s + (Number(v) || 0), 0)
  } else if (splitMethod === 'percentage') {
    pctSum = Object.values(percentageShares).reduce((s, v) => s + (Number(v) || 0), 0)
  }

  const addPerson = () => {
    const newId = `p-${Date.now()}-${participants.length + 1}`
    setParticipants([...participants, { id: newId, name: '', isUser: false, share: 0, percent: 0 }])
  }

  const removePerson = (id) => {
    if (participants.length <= 2) {
      setError('A split bill requires at least 2 participants.')
      return
    }
    setParticipants(participants.filter(p => p.id !== id))
    const { [id]: _, ...restCustom } = customShares
    setCustomShares(restCustom)
    const { [id]: __, ...restPct } = percentageShares
    setPercentageShares(restPct)
  }

  const handleNameChange = (id, val) => {
    setParticipants(participants.map(p => p.id === id ? { ...p, name: val } : p))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!title.trim()) {
      setError('Please enter a title for the split bill.')
      return
    }

    if (numTotal <= 0) {
      setError('Please enter a valid total amount.')
      return
    }

    if (participants.some(p => !p.name.trim())) {
      setError('All participant names must be filled in.')
      return
    }

    if (splitMethod === 'custom') {
      const diff = Math.abs(customSum - numTotal)
      if (diff > 0.05) {
        setError(`Individual shares total ${formatCurrency(customSum, currency)}, which does not match total bill of ${formatCurrency(numTotal, currency)}. Difference: ${formatCurrency(Math.abs(numTotal - customSum), currency)}.`)
        return
      }
    }

    if (splitMethod === 'percentage') {
      const diff = Math.abs(pctSum - 100)
      if (diff > 0.05) {
        setError(`Percentages must sum to exactly 100%. Current sum: ${pctSum.toFixed(1)}%.`)
        return
      }
    }

    const newBill = {
      title: title.trim(),
      totalAmount: numTotal,
      date,
      category,
      note: note.trim(),
      paidBy,
      splitMethod,
      status: 'Active',
      addToExpenses,
      participants: computedParticipants,
    }

    addSplitBill(newBill)
    onSaved?.('Split bill created and settlement tracking initiated.')
    onClose()
  }

  if (!isOpen) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Split Bill"
      subtitle="Split group expenses and track who owes whom with settlement history."
      maxWidth="560px"
    >
      <form onSubmit={handleSubmit} className="fg-form split-bill-form">
        {error && (
          <div className="form-alert error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <div className="form-section-title">1. Bill Details</div>

        <div className="form-group">
          <label htmlFor="sb-title" className="form-label">Expense Title</label>
          <input
            id="sb-title"
            type="text"
            className="form-input"
            placeholder="e.g. Dinner at Chili’s, Uber Cab, Movie Tickets"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="sb-total" className="form-label">Total Amount</label>
            <div className="input-prefix-wrap">
              <span className="input-prefix">{currencySymbol}</span>
              <input
                id="sb-total"
                type="number"
                step="any"
                min="0.01"
                className="form-input has-prefix"
                placeholder="0.00"
                value={totalAmount}
                onChange={(e) => {
                  setTotalAmount(e.target.value)
                  setError('')
                }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="sb-date" className="form-label">Date</label>
            <input
              id="sb-date"
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
            <label htmlFor="sb-category" className="form-label">Category</label>
            <select
              id="sb-category"
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
            <label htmlFor="sb-payer" className="form-label">Paid By</label>
            <select
              id="sb-payer"
              className="form-select"
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
            >
              {participants.map(p => (
                <option key={p.id} value={p.name || 'Friend'}>
                  {p.name || 'Friend'} {p.name === userName ? '(You)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-section-title" style={{ marginTop: '16px' }}>
          <span>2. Participants & Split Method</span>
          <div className="split-method-tabs">
            <button
              type="button"
              className={`method-tab ${splitMethod === 'equal' ? 'active' : ''}`}
              onClick={() => {
                setSplitMethod('equal')
                setError('')
              }}
            >
              Equal
            </button>
            <button
              type="button"
              className={`method-tab ${splitMethod === 'custom' ? 'active' : ''}`}
              onClick={() => {
                setSplitMethod('custom')
                setError('')
              }}
            >
              Custom
            </button>
            <button
              type="button"
              className={`method-tab ${splitMethod === 'percentage' ? 'active' : ''}`}
              onClick={() => {
                setSplitMethod('percentage')
                setError('')
              }}
            >
              % Percent
            </button>
          </div>
        </div>

        <div className="participants-list">
          {participants.map((p, idx) => (
            <div key={p.id} className="participant-row">
              <div className="participant-index">{idx + 1}</div>
              <input
                type="text"
                className="form-input participant-name-input"
                placeholder={idx === 0 ? userName : `Friend ${idx}`}
                value={p.name}
                onChange={(e) => handleNameChange(p.id, e.target.value)}
                required
              />

              {splitMethod === 'equal' && (
                <div className="share-display">
                  <span className="share-val">
                    {formatCurrency(numTotal > 0 ? numTotal / participants.length : 0, currency)}
                  </span>
                  <span className="share-sub">equal</span>
                </div>
              )}

              {splitMethod === 'custom' && (
                <div className="custom-input-wrap">
                  <span className="input-prefix-sm">{currencySymbol}</span>
                  <input
                    type="number"
                    step="any"
                    className="form-input custom-share-input"
                    placeholder="0.00"
                    value={customShares[p.id] ?? ''}
                    onChange={(e) => {
                      setCustomShares({ ...customShares, [p.id]: e.target.value })
                      setError('')
                    }}
                    required
                  />
                </div>
              )}

              {splitMethod === 'percentage' && (
                <div className="percent-input-wrap">
                  <input
                    type="number"
                    step="any"
                    min="0"
                    max="100"
                    className="form-input percent-share-input"
                    placeholder="0"
                    value={percentageShares[p.id] ?? ''}
                    onChange={(e) => {
                      setPercentageShares({ ...percentageShares, [p.id]: e.target.value })
                      setError('')
                    }}
                    required
                  />
                  <span className="input-suffix-sm">%</span>
                </div>
              )}

              {participants.length > 2 && (
                <button
                  type="button"
                  className="remove-person-btn"
                  onClick={() => removePerson(p.id)}
                  title="Remove participant"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}

          <Button
            type="button"
            variant="secondary"
            size="sm"
            icon={Plus}
            onClick={addPerson}
            className="add-person-btn"
          >
            Add Person
          </Button>
        </div>

        {/* Validation indicators for custom & percentage splits */}
        {splitMethod === 'custom' && numTotal > 0 && (
          <div className={`split-balance-bar ${Math.abs(customSum - numTotal) < 0.05 ? 'balanced' : 'unbalanced'}`}>
            <span>Total allocated: <strong>{formatCurrency(customSum, currency)}</strong> of {formatCurrency(numTotal, currency)}</span>
            <span>
              {Math.abs(customSum - numTotal) < 0.05
                ? '✓ Perfectly matched'
                : customSum > numTotal
                ? `Over by ${formatCurrency(customSum - numTotal, currency)}`
                : `Remaining: ${formatCurrency(numTotal - customSum, currency)}`}
            </span>
          </div>
        )}

        {splitMethod === 'percentage' && (
          <div className={`split-balance-bar ${Math.abs(pctSum - 100) < 0.05 ? 'balanced' : 'unbalanced'}`}>
            <span>Total percentage: <strong>{pctSum.toFixed(1)}%</strong> of 100%</span>
            <span>
              {Math.abs(pctSum - 100) < 0.05
                ? '✓ Balanced 100%'
                : pctSum > 100
                ? `Over by ${(pctSum - 100).toFixed(1)}%`
                : `Remaining: ${(100 - pctSum).toFixed(1)}%`}
            </span>
          </div>
        )}

        <div className="expense-link-checkbox">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={addToExpenses}
              onChange={(e) => setAddToExpenses(e.target.checked)}
            />
            <div>
              <strong>Sync personal share with monthly expense ledger</strong>
              <p>Adds only your personal share ({formatCurrency(computedParticipants.find(p => p.name === userName)?.share || 0, currency)}) to personal expenses, keeping analytics accurate.</p>
            </div>
          </label>
        </div>

        <div className="form-group" style={{ marginTop: '12px' }}>
          <label htmlFor="sb-notes" className="form-label">Note / Location <span className="text-muted">(Optional)</span></label>
          <input
            id="sb-notes"
            type="text"
            className="form-input"
            placeholder="e.g. Chili’s Ambience Mall, Order receipt #8421"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <div className="modal-actions">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" icon={Check}>
            Create & Split
          </Button>
        </div>
      </form>
    </Modal>
  )
}
