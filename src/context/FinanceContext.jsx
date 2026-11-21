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
  && typeof value.method === 'string'
const isValidBill = (value) => isRecord(value)
  && typeof value.id === 'string'
  && typeof value.title === 'string'
  && value.amount !== null
  && Number.isFinite(Number(value.amount))
  && typeof value.due === 'string'
  && typeof value.status === 'string'
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
  && value.minGpa !== null
  && Number.isFinite(Number(value.minGpa))

export function FinanceProvider({ children }) {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem('finguard-v1')
      if (!saved) return seedState

      // Keep persisted data across app updates while filling in any fields that
      // were added after the user's last visit. A shallow merge can leave
      // nested objects (like `user` or `goal`) incomplete and crash rendering.
      const parsed = JSON.parse(saved)
      const user = { ...seedState.user, ...(parsed?.user ?? {}) }
      const goal = { ...seedState.goal, ...(parsed?.goal ?? {}) }
      const habit = { ...seedState.habit, ...(parsed?.habit ?? {}) }
      const budgets = { ...seedState.budgets, ...(parsed?.budgets ?? {}) }

      // Older or manually edited browser data can contain valid JSON but
      // invalid field values. Keep those values from breaking the first render.
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
        budgets: {
          ...budgets,
          categories: { ...seedState.budgets.categories, ...(budgets.categories ?? {}) },
        },
        goal,
        habit,
        transactions: Array.isArray(parsed.transactions)
          ? parsed.transactions.filter(isValidTransaction)
          : seedState.transactions,
        bills: Array.isArray(parsed.bills)
          ? parsed.bills.filter(isValidBill)
          : seedState.bills,
        scholarships: Array.isArray(parsed.scholarships)
          ? parsed.scholarships.filter(isValidScholarship)
          : seedState.scholarships,
      }
    }
    catch { return seedState }
  })
  useEffect(() => { localStorage.setItem('finguard-v1', JSON.stringify(state)) }, [state])
  const actions = useMemo(() => ({
    addTransaction: (tx) => setState(s => ({ ...s, transactions: [{ ...tx, id: crypto.randomUUID() }, ...s.transactions], habit: { ...s.habit, xp: s.habit.xp + 10 } })),
    updateTransaction: (tx) => setState(s => ({ ...s, transactions: s.transactions.map(t => t.id === tx.id ? tx : t) })),
    deleteTransaction: (id) => setState(s => ({ ...s, transactions: s.transactions.filter(t => t.id !== id) })),
    updateBudget: (budgets) => setState(s => ({ ...s, budgets })),
    updateGoal: (goal) => setState(s => ({ ...s, goal })),
    contribute: (amount) => setState(s => ({ ...s, goal: { ...s.goal, current: Number(s.goal.current) + Number(amount) }, habit: { ...s.habit, xp: s.habit.xp + 20 } })),
    updateScholarship: (id, status) => setState(s => ({ ...s, scholarships: s.scholarships.map(x => x.id === id ? { ...x, status } : x), habit: { ...s.habit, xp: s.habit.xp + (status === 'Submitted' ? 25 : 0) } })),
    checkin: () => setState(s => s.habit.lastCheckin === new Date().toISOString().slice(0,10) ? s : ({ ...s, habit: { ...s.habit, streak: s.habit.streak + 1, xp: s.habit.xp + 15, lastCheckin: new Date().toISOString().slice(0,10) } })),
    setTheme: (theme) => setState(s => ({ ...s, theme })),
    updateUser: (user) => setState(s => ({ ...s, user })),
  }), [])
  return <FinanceContext.Provider value={{ state, ...actions }}>{children}</FinanceContext.Provider>
}
export const useFinance = () => useContext(FinanceContext)
