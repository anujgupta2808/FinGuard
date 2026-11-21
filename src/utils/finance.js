export const money = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(Number(n) || 0)
export const shortMoney = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(Number(n) || 0)
export const categorize = (title) => {
  const s = title.toLowerCase()
  if (/rent|housing|lease/.test(s)) return 'Housing'
  if (/food|grocery|grocer|dinner|lunch|coffee|restaurant|cafe|snack/.test(s)) return 'Food & dining'
  if (/bus|uber|lyft|gas|fuel|train|transit|transport/.test(s)) return 'Transport'
  if (/book|tuition|course|school|class|campus|education/.test(s)) return 'Education'
  if (/netflix|spotify|movie|game|stream|concert|entertainment/.test(s)) return 'Entertainment'
  if (/electric|water|internet|phone|utility|wifi/.test(s)) return 'Utilities'
  if (/salary|paycheck|wage/.test(s)) return 'Salary'
  if (/scholar|grant|fellowship/.test(s)) return 'Scholarship'
  if (/freelance|client|tutoring|project/.test(s)) return 'Freelance'
  if (/allowance/.test(s)) return 'Allowance'
  return 'Other'
}
export const scholarshipScore = (s, user) => {
  let score = 40
  if (s.field === 'Any field' || (user.major && /stem|computer|engineering|science|math|tech/i.test(user.major) && s.field === 'STEM') || (/art|design|creative/i.test(user.major) && s.field === 'Arts')) score += 25
  if (s.level === 'Any level' || s.level.includes(user.year) || s.level === 'Undergraduate') score += 15
  score += user.gpa >= s.minGpa ? 15 : -20
  if (s.need && user.needBased) score += 10
  return Math.max(0, Math.min(99, score))
}
export const weeklySavings = (goal) => {
  const weeks = Math.max(1, Math.ceil((new Date(goal.targetDate) - new Date()) / (7 * 864e5)))
  return Math.ceil(Math.max(0, goal.target - goal.current) / weeks)
}
export const habitScore = (state) => {
  const expenses = state.transactions.filter(t => t.type === 'expense')
  const budgetPoints = Object.entries(state.budgets.categories).reduce((n, [cat, limit]) => {
    const spent = expenses.filter(t => t.category === cat).reduce((sum, t) => sum + Number(t.amount), 0)
    return n + (spent <= limit ? 4 : 0)
  }, 0)
  const tracking = Math.min(30, new Set(expenses.map(t => t.date)).size * 4)
  const savings = Math.min(25, Math.round(state.goal.current / Math.max(1, state.goal.target) * 25))
  const bills = Math.min(15, state.bills.filter(b => b.status === 'Paid').length * 5)
  return Math.min(100, 25 + tracking + budgetPoints + savings + bills)
}
export const monthExpenses = (transactions) => transactions.filter(t => t.type === 'expense' && new Date(t.date).getMonth() === new Date().getMonth() && new Date(t.date).getFullYear() === new Date().getFullYear()).reduce((a, t) => a + Number(t.amount), 0)
export const diningInsight = (transactions) => {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const start = new Date(today); start.setDate(start.getDate() - 6)
  const priorStart = new Date(start); priorStart.setDate(priorStart.getDate() - 7)
  const inRange = (tx, from, to) => tx.category === 'Food & dining' && tx.type === 'expense' && new Date(`${tx.date}T12:00:00`) >= from && new Date(`${tx.date}T12:00:00`) <= to
  const current = transactions.filter(t => inRange(t, start, today)).reduce((n,t) => n + Number(t.amount), 0)
  const previous = transactions.filter(t => inRange(t, priorStart, new Date(start.getTime() - 864e5))).reduce((n,t) => n + Number(t.amount), 0)
  const change = previous ? Math.round(Math.abs(current - previous) / previous * 100) : 0
  return { current, previous, change, amount: Math.abs(current - previous), trend: current < previous ? 'down' : current > previous ? 'up' : 'steady' }
}
