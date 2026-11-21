import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { seedState } from '../data/seed'
import {
  getStoredAccounts,
  saveAccounts,
  getStoredAuth,
  setStoredAuth,
  getStoredSession,
  setStoredSession,
  formatNameFromEmail,
} from '../utils/auth'

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
  const [session, setSession] = useState(() => getStoredSession())
  const [isAuthenticated, setIsAuthenticated] = useState(() => getStoredAuth())
  const [accounts, setAccounts] = useState(() => getStoredAccounts())

  const [state, setState] = useState(() => {
    try {
      // Clear old seed-polluted stores
      localStorage.removeItem('finguard-v2')
      localStorage.removeItem('finguard-v1')

      const saved = localStorage.getItem('finguard-app-state')
      if (!saved) return seedState

      const parsed = JSON.parse(saved)
      // If parsed contains old demo transactions (e.g. 't1' or 'Campus Bookstore'), discard them
      if (Array.isArray(parsed.transactions) && parsed.transactions.some(t => t.id === 't1' || t.title === 'Campus Bookstore')) {
        return seedState
      }

      const user = { ...seedState.user, ...(parsed?.user ?? {}) }
      const goal = { ...seedState.goal, ...(parsed?.goal ?? {}) }
      const habit = { ...seedState.habit, ...(parsed?.habit ?? {}) }
      const budgets = { ...seedState.budgets, ...(parsed?.budgets ?? {}) }
      const currency = parsed?.currency || seedState.currency || 'INR'

      if (typeof user.name !== 'string' || !user.name.trim()) user.name = seedState.user.name
      if (typeof user.major !== 'string') user.major = seedState.user.major
      if (typeof user.year !== 'string') user.year = seedState.user.year

      return {
        ...seedState,
        ...parsed,
        user,
        currency,
        budgets: {
          total: Number(budgets?.total) || 0,
          categories: { ...seedState.budgets.categories, ...(budgets.categories ?? {}) },
        },
        goal,
        habit,
        transactions: Array.isArray(parsed.transactions)
          ? parsed.transactions.filter(isValidTransaction)
          : [],
        bills: Array.isArray(parsed.bills)
          ? parsed.bills.filter(isValidBill)
          : [],
        splitBills: Array.isArray(parsed.splitBills)
          ? parsed.splitBills.filter(isValidSplitBill)
          : [],
        scholarships: Array.isArray(parsed.scholarships)
          ? parsed.scholarships.filter(isValidScholarship)
          : [],
      }
    } catch {
      return seedState
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('finguard-app-state', JSON.stringify(state))
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

  const login = useCallback((email, password) => {
    const normalizedEmail = (email || '').trim().toLowerCase()
    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      return { success: false, error: 'Please enter a valid student email address.' }
    }
    if (!password || password.trim().length === 0) {
      return { success: false, error: 'Please enter your password.' }
    }

    // 1. Check if user already exists in current browser
    let userFound = accounts.find(
      a => a.email.toLowerCase() === normalizedEmail
    )

    if (userFound) {
      // Validate password if user was created with a password
      if (userFound.password && userFound.password !== password) {
        return { success: false, error: 'Incorrect password for this student account.' }
      }
    } else {
      // 2. User logged in from another browser or device!
      // Recognize the credentials and automatically create/restore cross-browser session
      const derivedName = formatNameFromEmail(normalizedEmail)
      userFound = {
        name: derivedName,
        email: normalizedEmail,
        password: password,
        major: 'Computer Science',
        year: 'Junior',
        gpa: 3.7,
        location: 'Campus Residence',
        needBased: true,
      }

      const updatedAccounts = [userFound, ...accounts]
      setAccounts(updatedAccounts)
      saveAccounts(updatedAccounts)
    }

    // Establish active session token
    const newSession = {
      token: `fg_sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      email: userFound.email,
      name: userFound.name,
      loginTime: new Date().toISOString(),
    }

    setStoredSession(newSession)
    setSession(newSession)
    setIsAuthenticated(true)
    setStoredAuth(true)

    setState(s => ({
      ...s,
      user: {
        ...s.user,
        name: userFound.name || s.user.name,
        email: userFound.email,
        major: userFound.major || s.user.major,
        year: userFound.year || s.user.year,
        gpa: userFound.gpa || s.user.gpa,
        location: userFound.location || s.user.location,
        needBased: userFound.needBased ?? s.user.needBased,
      },
    }))

    return { success: true, user: userFound, session: newSession }
  }, [accounts])

  const register = useCallback(({ name, email, password, major, year }) => {
    const normalizedEmail = (email || '').trim().toLowerCase()
    if (!name || !name.trim()) {
      return { success: false, error: 'Please enter your full name.' }
    }
    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      return { success: false, error: 'Please enter a valid student email address.' }
    }
    if (!password || password.length < 4) {
      return { success: false, error: 'Password must be at least 4 characters.' }
    }

    const newAccount = {
      name: name.trim(),
      email: normalizedEmail,
      password,
      major: (major || 'General Studies').trim(),
      year: year || 'Freshman',
      gpa: 3.8,
      location: 'Campus Residence',
      needBased: true,
    }

    const updatedAccounts = [newAccount, ...accounts.filter(a => a.email.toLowerCase() !== normalizedEmail)]
    setAccounts(updatedAccounts)
    saveAccounts(updatedAccounts)

    const newSession = {
      token: `fg_sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      email: newAccount.email,
      name: newAccount.name,
      loginTime: new Date().toISOString(),
    }

    setStoredSession(newSession)
    setSession(newSession)
    setIsAuthenticated(true)
    setStoredAuth(true)

    setState(s => ({
      ...s,
      user: {
        ...s.user,
        name: newAccount.name,
        email: newAccount.email,
        major: newAccount.major,
        year: newAccount.year,
        gpa: newAccount.gpa,
        location: newAccount.location,
        needBased: newAccount.needBased,
      },
    }))

    return { success: true, user: newAccount, session: newSession }
  }, [accounts])

  const logout = useCallback(() => {
    setStoredSession(null)
    setSession(null)
    setIsAuthenticated(false)
    setStoredAuth(false)
  }, [])

  const importSyncData = useCallback((decodedBundle) => {
    if (!decodedBundle || typeof decodedBundle !== 'object') {
      return { success: false, error: 'Invalid sync data format.' }
    }

    if (decodedBundle.accounts && Array.isArray(decodedBundle.accounts)) {
      setAccounts(decodedBundle.accounts)
      saveAccounts(decodedBundle.accounts)
    }

    setState(s => ({
      ...s,
      user: { ...s.user, ...(decodedBundle.user || {}) },
      budgets: { ...s.budgets, ...(decodedBundle.budgets || {}) },
      transactions: Array.isArray(decodedBundle.transactions) ? decodedBundle.transactions : s.transactions,
      bills: Array.isArray(decodedBundle.bills) ? decodedBundle.bills : s.bills,
      splitBills: Array.isArray(decodedBundle.splitBills) ? decodedBundle.splitBills : s.splitBills,
    }))

    return { success: true }
  }, [])

  return (
    <FinanceContext.Provider
      value={{
        state,
        session,
        isAuthenticated,
        accounts,
        login,
        register,
        logout,
        importSyncData,
        ...actions,
      }}
    >
      {children}
    </FinanceContext.Provider>
  )
}

export const useFinance = () => useContext(FinanceContext)
