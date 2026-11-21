import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { seedState } from '../data/seed'

const FinanceContext = createContext(null)

const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)

const isValidTransaction = (value) => isRecord(value)
  && typeof value.id === 'string'
  && typeof value.title === 'string'
  && value.amount !== null
  && Number.isFinite(Number(value.amount))
  && (value.type === 'income' || value.type === 'expense')
  && typeof value.category === 'string'
  && typeof value.date === 'string'
  && !Number.isNaN(Date.parse(`${value.date}T12:00:00`))

const isValidBill = (value) => isRecord(value)
  && typeof value.id === 'string'
  && typeof value.title === 'string'
  && value.amount !== null
  && Number.isFinite(Number(value.amount))
  && typeof value.due === 'string'
  && typeof value.status === 'string'

const isValidSplitBill = (value) => isRecord(value)
  && typeof value.id === 'string'
  && typeof value.title === 'string'
  && value.totalAmount !== null
  && Number.isFinite(Number(value.totalAmount))
  && Array.isArray(value.participants)

const isValidScholarship = (value) => isRecord(value)
  && typeof value.id === 'string'
  && typeof value.name === 'string'
  && typeof value.org === 'string'
  && typeof value.field === 'string'
  && typeof value.level === 'string'
  && typeof value.deadline === 'string'
  && typeof value.status === 'string'
  && value.amount !== null
  && Number.isFinite(Number(value.amount))

export function FinanceProvider({ children }) {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem('finguard-v2') || localStorage.getItem('finguard-v1')
      if (!saved) return seedState

      const parsed = JSON.parse(saved)
      const user = { ...seedState.user, ...(parsed?.user ?? {}) }
      const goal = { ...seedState.goal, ...(parsed?.goal ?? {}) }
      const habit = { ...seedState.habit, ...(parsed?.habit ?? {}) }
      const budgets = { ...seedState.budgets, ...(parsed?.budgets ?? {}) }
      const currency = parsed?.currency || seedState.currency || 'INR'

      if (typeof user.name !== 'string' || !user.name.trim()) user.name = seedState.user.name
      if (typeof user.major !== 'string') user.major = seedState.user.major
      if (typeof user.year !== 'string') user.year = seedState.user.year
      if (!Number.isFinite(Number(user.gpa))) user.gpa = seedState.user.gpa
      if (!Number.isFinite(Number(goal.target)) || Number(goal.target) <= 0) goal.target = seedState.goal.target
      if (!Number.isFinite(Number(goal.current)) || Number(goal.current) < 0) goal.current = seedState.goal.current
      if (!Number.isFinite(Number(habit.streak)) || Number(habit.streak) < 0) habit.streak = seedState.habit.streak
      if (!Number.isFinite(Number(habit.xp)) || Number(habit.xp) < 0) habit.xp = seedState.habit.xp

      return {
        ...seedState,
        ...parsed,
        user,
        currency,
        budgets: {
          ...budgets,
          categories: { ...seedState.budgets.categories, ...(budgets.categories ?? {}) },
        },
        goal,
        habit,
        transactions: Array.isArray(parsed.transactions)
          ? parsed.transactions.filter(isValidTransaction)
          : seedState.transactions,
        bills: Array.isArray(parsed.bills) && parsed.bills.length > 0
          ? parsed.bills.filter(isValidBill)
          : seedState.bills,
        splitBills: Array.isArray(parsed.splitBills) && parsed.splitBills.length > 0
          ? parsed.splitBills.filter(isValidSplitBill)
          : seedState.splitBills,
        scholarships: Array.isArray(parsed.scholarships)
          ? parsed.scholarships.filter(isValidScholarship)
          : seedState.scholarships,
      }
    } catch {
      return seedState
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('finguard-v2', JSON.stringify(state))
    } catch (e) {
      console.error('Failed to save state to localStorage:', e)
    }
  }, [state])

  const actions = useMemo(() => ({
    // Transactions
    addTransaction: (tx) => setState(s => ({
      ...s,
      transactions: [{ ...tx, id: tx.id || `tx-${Date.now()}` }, ...s.transactions],
      habit: { ...s.habit, xp: s.habit.xp + 10 },
    })),
    updateTransaction: (tx) => setState(s => ({
      ...s,
      transactions: s.transactions.map(t => t.id === tx.id ? tx : t),
    })),
    deleteTransaction: (id) => setState(s => ({
      ...s,
      transactions: s.transactions.filter(t => t.id !== id),
    })),

    // Budgets
    updateBudget: (budgets) => setState(s => ({
      ...s,
      budgets,
    })),

    // Bills
    addBill: (bill) => setState(s => ({
      ...s,
      bills: [{ ...bill, id: bill.id || `bill-${Date.now()}` }, ...s.bills],
      habit: { ...s.habit, xp: s.habit.xp + 5 },
    })),
    updateBill: (bill) => setState(s => ({
      ...s,
      bills: s.bills.map(b => b.id === bill.id ? bill : b),
    })),
    deleteBill: (id) => setState(s => ({
      ...s,
      bills: s.bills.filter(b => b.id !== id),
    })),
    markBillPaid: (id, paid = true) => setState(s => ({
      ...s,
      bills: s.bills.map(b => b.id === id ? { ...b, status: paid ? 'Paid' : 'Upcoming' } : b),
      habit: { ...s.habit, xp: paid ? s.habit.xp + 15 : s.habit.xp },
    })),

    // Split Bills
    addSplitBill: (bill) => setState(s => {
      const id = bill.id || `sb-${Date.now()}`
      const newBill = { ...bill, id, createdAt: bill.createdAt || new Date().toISOString().slice(0, 10) }
      
      // Integrate with personal expense if user paid:
      // If user paid the bill, add a transaction for USER'S SHARE ONLY (Section 25 of prompt)
      let updatedTransactions = s.transactions
      if (bill.addToExpenses) {
        const userPart = newBill.participants.find(p => p.name === s.user.name || p.name?.toLowerCase() === 'you' || p.name?.toLowerCase() === s.user.name.toLowerCase())
        const userShare = userPart ? Number(userPart.share) : (newBill.paidBy === s.user.name ? Number(newBill.totalAmount) : 0)
        
        if (userShare > 0) {
          const expenseTx = {
            id: `tx-split-${id}`,
            title: `${newBill.title} (Your share)`,
            amount: userShare,
            type: 'expense',
            category: newBill.category || 'Food',
            date: newBill.date || new Date().toISOString().slice(0, 10),
            method: 'Split bill',
            notes: `Split bill for ${newBill.title}. Total: ${newBill.totalAmount}`,
          }
          updatedTransactions = [expenseTx, ...updatedTransactions]
        }
      }

      return {
        ...s,
        splitBills: [newBill, ...s.splitBills],
        transactions: updatedTransactions,
        habit: { ...s.habit, xp: s.habit.xp + 15 },
      }
    }),
    updateSplitBill: (bill) => setState(s => ({
      ...s,
      splitBills: s.splitBills.map(sb => sb.id === bill.id ? bill : sb),
    })),
    deleteSplitBill: (id) => setState(s => ({
      ...s,
      splitBills: s.splitBills.filter(sb => sb.id !== id),
      // Also remove auto-linked transaction if exists
      transactions: s.transactions.filter(t => t.id !== `tx-split-${id}`),
    })),
    markParticipantPaid: ({ splitBillId, participantId, paid = true }) => setState(s => {
      const updatedSplitBills = s.splitBills.map(sb => {
        if (sb.id !== splitBillId) return sb
        const updatedParts = sb.participants.map(p => {
          if (p.id !== participantId) return p
          return { ...p, paid, status: paid ? 'Paid' : 'Pending' }
        })
        const allSettled = updatedParts.every(p => p.paid)
        return {
          ...sb,
          participants: updatedParts,
          status: allSettled ? 'Settled' : 'Active',
        }
      })
      return {
        ...s,
        splitBills: updatedSplitBills,
        habit: { ...s.habit, xp: paid ? s.habit.xp + 10 : s.habit.xp },
      }
    }),
    settleSplitBill: (splitBillId) => setState(s => ({
      ...s,
      splitBills: s.splitBills.map(sb => {
        if (sb.id !== splitBillId) return sb
        return {
          ...sb,
          status: 'Settled',
          participants: sb.participants.map(p => ({ ...p, paid: true, status: 'Paid' })),
        }
      }),
      habit: { ...s.habit, xp: s.habit.xp + 20 },
    })),

    // Savings & Goal
    updateGoal: (goal) => setState(s => ({ ...s, goal })),
    contribute: (amount) => setState(s => ({
      ...s,
      goal: { ...s.goal, current: Number(s.goal.current) + Number(amount) },
      habit: { ...s.habit, xp: s.habit.xp + 20 },
    })),

    // Scholarships
    updateScholarship: (id, status) => setState(s => ({
      ...s,
      scholarships: s.scholarships.map(x => x.id === id ? { ...x, status } : x),
      habit: { ...s.habit, xp: s.habit.xp + (status === 'Submitted' ? 25 : 5) },
    })),

    // Habits
    checkin: () => setState(s => {
      const todayStr = new Date().toISOString().slice(0, 10)
      if (s.habit.lastCheckin === todayStr) return s
      return {
        ...s,
        habit: {
          ...s.habit,
          streak: s.habit.streak + 1,
          xp: s.habit.xp + 15,
          lastCheckin: todayStr,
        },
      }
    }),

    // Preferences & Reset
    setTheme: (theme) => setState(s => ({ ...s, theme })),
    setCurrency: (currency) => setState(s => ({ ...s, currency })),
    updateUser: (user) => setState(s => ({ ...s, user })),
    resetToSeed: () => setState(seedState),
  }), [])

  return (
    <FinanceContext.Provider value={{ state, ...actions }}>
      {children}
    </FinanceContext.Provider>
  )
}

export const useFinance = () => useContext(FinanceContext)
