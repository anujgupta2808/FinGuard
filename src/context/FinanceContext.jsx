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
import {
  fetchCloudState,
  pushCloudState,
  debounceCloudPush,
} from '../utils/cloudSync'

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

    // Automatically synchronize state to cloud for cross-browser continuity
    if (session?.email) {
      const currentAccount = accounts.find(
        (a) => a.email.toLowerCase() === session.email.toLowerCase()
      )
      debounceCloudPush(session.email, state, currentAccount)
    }
  }, [state, session, accounts])

  // Background check on launch to sync changes made from other browsers or devices
  useEffect(() => {
    if (session?.email) {
      fetchCloudState(session.email)
        .then((cloudData) => {
          if (cloudData?.state) {
            const cs = cloudData.state
            setState((curr) => {
              const remoteTxLen = Array.isArray(cs.transactions) ? cs.transactions.length : 0
              const localTxLen = Array.isArray(curr.transactions) ? curr.transactions.length : 0

              // If remote cloud has updated transactions or newer dataset, hydrate
              if (remoteTxLen > localTxLen || (remoteTxLen > 0 && !localTxLen)) {
                return {
                  ...curr,
                  ...cs,
                  user: { ...curr.user, ...(cs.user || {}) },
                  scholarships:
                    curr.scholarships && curr.scholarships.length > 0
                      ? curr.scholarships
                      : cs.scholarships || [],
                }
              }
              return curr
            })
          }
        })
        .catch(() => {})
    }
  }, [session?.email])

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
    syncScholarships: (incomingList) => setState(s => {
      const existingMap = new Map((s.scholarships || []).map(x => [x.id, x]))
      const merged = incomingList.map(item => {
        const existing = existingMap.get(item.id)
        if (existing) {
          return { ...item, status: existing.status }
        }
        return item
      })
      existingMap.forEach((val, id) => {
        if (!incomingList.some(item => item.id === id)) {
          merged.push(val)
        }
      })
      return {
        ...s,
        scholarships: merged,
      }
    }),

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

  const login = useCallback(async (email, password) => {
    const normalizedEmail = (email || '').trim().toLowerCase()
    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      return { success: false, error: 'Please enter a valid student email address.' }
    }
    if (!password || password.trim().length === 0) {
      return { success: false, error: 'Please enter your password.' }
    }

    // 1. Check cloud storage first for cross-browser synchronization
    let cloudData = null
    try {
      cloudData = await fetchCloudState(normalizedEmail)
    } catch (e) {
      console.warn('Cloud fetch during login failed:', e)
    }

    let userFound = accounts.find(
      a => a.email.toLowerCase() === normalizedEmail
    )

    // If cloud data exists, verify password and restore full user state!
    if (cloudData) {
      if (cloudData.account && cloudData.account.password) {
        if (cloudData.account.password !== password) {
          return { success: false, error: 'Incorrect password for this student account.' }
        }
        userFound = { ...cloudData.account }
      }

      // Restore full student state across browsers!
      if (cloudData.state) {
        const cs = cloudData.state
        const restoredState = {
          ...seedState,
          ...cs,
          user: { ...seedState.user, ...(cs.user || {}) },
          budgets: cs.budgets || seedState.budgets,
          transactions: Array.isArray(cs.transactions) ? cs.transactions : [],
          bills: Array.isArray(cs.bills) ? cs.bills : [],
          splitBills: Array.isArray(cs.splitBills) ? cs.splitBills : [],
          scholarships: Array.isArray(cs.scholarships) && cs.scholarships.length > 0 ? cs.scholarships : seedState.scholarships,
          goal: cs.goal || seedState.goal,
          habit: cs.habit || seedState.habit,
          currency: cs.currency || seedState.currency || 'INR',
          theme: cs.theme || seedState.theme || 'light',
        }
        setState(restoredState)
        try {
          localStorage.setItem('finguard-app-state', JSON.stringify(restoredState))
        } catch {}
      }
    }

    if (!userFound) {
      // 2. Fallback to local accounts or create new account record
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
    } else if (userFound.password && userFound.password !== password) {
      return { success: false, error: 'Incorrect password for this student account.' }
    }

    // Update local accounts
    const updatedAccounts = [userFound, ...accounts.filter(a => a.email.toLowerCase() !== normalizedEmail)]
    setAccounts(updatedAccounts)
    saveAccounts(updatedAccounts)

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

    // If cloud had no data, immediately seed the cloud with this state
    if (!cloudData) {
      pushCloudState(normalizedEmail, state, userFound).catch(() => {})
    }

    return { success: true, user: userFound, session: newSession }
  }, [accounts, state])

  const register = useCallback(async ({ name, email, password, major, year }) => {
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
      major: (major || 'Computer Science').trim(),
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

    const freshState = {
      ...seedState,
      user: {
        ...seedState.user,
        name: newAccount.name,
        email: newAccount.email,
        major: newAccount.major,
        year: newAccount.year,
      },
    }

    setState(freshState)
    try {
      localStorage.setItem('finguard-app-state', JSON.stringify(freshState))
    } catch {}

    // Push new account and initial state to cloud
    await pushCloudState(normalizedEmail, freshState, newAccount).catch(() => {})

    return { success: true, user: newAccount, session: newSession }
  }, [accounts])

  const syncWithCloud = useCallback(async () => {
    if (!session?.email) {
      return { success: false, error: 'No active student session to sync.' }
    }
    try {
      const cloudData = await fetchCloudState(session.email)
      const currentAccount = accounts.find(a => a.email.toLowerCase() === session.email.toLowerCase())
      if (cloudData?.state) {
        const mergedState = {
          ...state,
          ...cloudData.state,
          user: { ...state.user, ...(cloudData.state.user || {}) },
          transactions: cloudData.state.transactions || state.transactions,
          budgets: cloudData.state.budgets || state.budgets,
          bills: cloudData.state.bills || state.bills,
          splitBills: cloudData.state.splitBills || state.splitBills,
        }
        setState(mergedState)
        localStorage.setItem('finguard-app-state', JSON.stringify(mergedState))
        return { success: true, timestamp: new Date().toISOString() }
      } else {
        await pushCloudState(session.email, state, currentAccount)
        return { success: true, timestamp: new Date().toISOString() }
      }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }, [session, state, accounts])

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
        syncWithCloud,
        importSyncData,
        ...actions,
      }}
    >
      {children}
    </FinanceContext.Provider>
  )
}

export const useFinance = () => useContext(FinanceContext)
