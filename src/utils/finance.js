export const CURRENCIES = {
  INR: { code: 'INR', symbol: '₹', label: 'INR (₹) - Indian Rupee', locale: 'en-IN' },
  USD: { code: 'USD', symbol: '$', label: 'USD ($) - US Dollar', locale: 'en-US' },
  EUR: { code: 'EUR', symbol: '€', label: 'EUR (€) - Euro', locale: 'de-DE' },
  GBP: { code: 'GBP', symbol: '£', label: 'GBP (£) - British Pound', locale: 'en-GB' },
}

export const INCOME_CATEGORIES = ['Allowance', 'Salary', 'Freelance', 'Scholarship', 'Other']
export const EXPENSE_CATEGORIES = ['Food', 'Travel', 'Education', 'Housing', 'Shopping', 'Entertainment', 'Bills', 'Healthcare', 'Other']

export const formatCurrency = (val, currencyCode = 'INR', maximumFractionDigits = 0) => {
  const num = Number(val) || 0
  const cur = CURRENCIES[currencyCode] || CURRENCIES.INR
  try {
    return new Intl.NumberFormat(cur.locale, {
      style: 'currency',
      currency: cur.code,
      maximumFractionDigits: maximumFractionDigits,
      minimumFractionDigits: maximumFractionDigits > 0 ? 2 : 0,
    }).format(num)
  } catch {
    return `${cur.symbol}${num.toLocaleString()}`
  }
}

export const formatShortCurrency = (val, currencyCode = 'INR') => {
  const num = Number(val) || 0
  const cur = CURRENCIES[currencyCode] || CURRENCIES.INR
  try {
    return new Intl.NumberFormat(cur.locale, {
      style: 'currency',
      currency: cur.code,
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(num)
  } catch {
    return `${cur.symbol}${num >= 1000 ? `${(num / 1000).toFixed(1)}k` : num}`
  }
}

export const categorize = (title) => {
  const s = String(title || '').toLowerCase()
  if (/salary|paycheck|stipend|wage/.test(s)) return 'Salary'
  if (/freelance|client|tutoring|consulting|gig/.test(s)) return 'Freelance'
  if (/scholarship|grant|fellowship|bursary|award/.test(s)) return 'Scholarship'
  if (/allowance|pocket money|parents|relative/.test(s)) return 'Allowance'
  
  if (/rent|hostel|room|flat|apartment|broker|maintenance/.test(s)) return 'Housing'
  if (/food|grocer|swiggy|zomato|dinner|lunch|breakfast|coffee|cafe|restaurant|snack|thali|canteen|bistro|chai/.test(s)) return 'Food'
  if (/bus|metro|uber|ola|cab|auto|train|ticket|flight|transport|transit|fuel|petrol|bike/.test(s)) return 'Travel'
  if (/book|tuition|course|exam|udemy|coursera|college|university|lab|stationery|xerox|print/.test(s)) return 'Education'
  if (/movie|cinema|netflix|spotify|game|steam|concert|entertainment|show|party|bowling/.test(s)) return 'Entertainment'
  if (/wifi|broadband|electric|utility|water|bill|gas|cylinder|postpaid|recharge|dth/.test(s)) return 'Bills'
  if (/cloth|shoes|amazon|flipkart|myntra|zara|h&m|shopping|order|mall|apparel/.test(s)) return 'Shopping'
  if (/doctor|medicine|pharmacy|clinic|dental|hospital|health|gym|vitamin/.test(s)) return 'Healthcare'
  return 'Other'
}

export const getMonthMetrics = (transactions) => {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  const monthTx = (transactions || []).filter(t => {
    const d = new Date(`${t.date}T12:00:00`)
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear
  })

  const income = monthTx.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount || 0), 0)
  const expenses = monthTx.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount || 0), 0)
  const balance = income - expenses
  const savingsRate = income > 0 ? Math.max(0, Math.round(((income - expenses) / income) * 100)) : 0

  return { income, expenses, balance, savingsRate, count: monthTx.length }
}

export const getFinancialRisk = (state) => {
  const metrics = getMonthMetrics(state?.transactions)
  const budgetTotal = Number(state?.budgets?.total) || 0
  const spendingRatio = budgetTotal > 0 ? (metrics.expenses / budgetTotal) * 100 : 0

  const todayStr = new Date().toISOString().slice(0, 10)
  const overdueBills = (state?.bills || []).filter(b => b.status === 'Overdue' || (b.status !== 'Paid' && b.due < todayStr))
  const upcomingBills = (state?.bills || []).filter(b => b.status !== 'Paid' && b.due >= todayStr)
  const upcomingBillsTotal = upcomingBills.reduce((s, b) => s + Number(b.amount || 0), 0)

  if (metrics.count === 0 && (state?.bills || []).length === 0) {
    return {
      level: 'LOW',
      label: 'NEW ACCOUNT',
      color: 'blue',
      score: 100,
      spendingRatio: 0,
      reasons: [
        'Fresh ledger ready for student expense tracking.',
        'No pending or overdue commitments.',
        'Ready to set monthly budgets and log transactions.',
      ],
      overdueBillsCount: 0,
      upcomingBillsTotal: 0,
    }
  }

  let level = 'LOW'
  let label = 'LOW RISK'
  let color = 'green'
  let score = 92
  const reasons = []

  if (spendingRatio > 100 || overdueBills.length > 0 || (metrics.balance < 0 && metrics.income > 0)) {
    level = 'HIGH'
    label = 'HIGH RISK'
    color = 'red'
    score = Math.max(35, Math.round(100 - (spendingRatio - 80) * 1.5 - overdueBills.length * 15))
    if (spendingRatio > 100) reasons.push(`Budget exceeded by ${(spendingRatio - 100).toFixed(0)}% this month.`)
    if (overdueBills.length > 0) reasons.push(`${overdueBills.length} overdue bill(s) pending settlement.`)
    if (metrics.balance < 0) reasons.push(`Net monthly cash flow is negative.`)
  } else if (spendingRatio >= 80 || upcomingBillsTotal > metrics.balance || spendingRatio > 70 && metrics.balance < 2000) {
    level = 'MEDIUM'
    label = 'MODERATE RISK'
    color = 'amber'
    score = Math.max(60, Math.round(95 - (spendingRatio - 70) * 1.2))
    if (spendingRatio >= 80) reasons.push(`Spending reached ${spendingRatio.toFixed(0)}% of monthly budget limit.`)
    if (upcomingBillsTotal > metrics.balance) reasons.push(`Upcoming bills exceed current month's remaining balance.`)
    reasons.push(`Approaching planned category thresholds.`)
  } else {
    level = 'LOW'
    label = 'HEALTHY'
    color = 'green'
    score = Math.min(98, Math.round(90 + (100 - spendingRatio) * 0.1))
    reasons.push(`Spending is disciplined at ${spendingRatio.toFixed(0)}% of monthly budget.`)
    reasons.push(`All scheduled bills are manageable with positive cash flow.`)
    reasons.push(`Emergency cushion and savings stay protected.`)
  }

  return {
    level,
    label,
    color,
    score,
    spendingRatio,
    reasons,
    overdueBillsCount: overdueBills.length,
    upcomingBillsTotal,
  }
}

export const getSplitBillSummary = (splitBills = [], userName = 'Anuj Gupta') => {
  let youOwe = 0
  let youWillReceive = 0
  const peopleWhoOweYouMap = {}
  const peopleYouOweMap = {}

  let totalActive = 0
  let totalSettled = 0

  splitBills.forEach(sb => {
    const isSettled = sb.status === 'Settled' || sb.participants.every(p => p.paid)
    if (isSettled) {
      totalSettled += 1
      return
    }
    totalActive += 1

    const isPayer = sb.paidBy === userName || sb.paidBy?.toLowerCase() === 'you' || sb.paidBy?.toLowerCase() === userName.toLowerCase()

    if (isPayer) {
      // User paid for this bill. Others who have not paid owe user their share.
      sb.participants.forEach(p => {
        const isSelf = p.name === userName || p.name?.toLowerCase() === 'you' || p.name?.toLowerCase() === userName.toLowerCase()
        if (!isSelf && !p.paid) {
          const share = Number(p.share || 0)
          youWillReceive += share
          if (!peopleWhoOweYouMap[p.name]) {
            peopleWhoOweYouMap[p.name] = { name: p.name, amount: 0, count: 0, bills: [] }
          }
          peopleWhoOweYouMap[p.name].amount += share
          peopleWhoOweYouMap[p.name].count += 1
          peopleWhoOweYouMap[p.name].bills.push({ title: sb.title, share, id: sb.id })
        }
      })
    } else {
      // Someone else paid. User owes their own share if not paid.
      const userPart = sb.participants.find(p => p.name === userName || p.name?.toLowerCase() === 'you' || p.name?.toLowerCase() === userName.toLowerCase())
      if (userPart && !userPart.paid) {
        const share = Number(userPart.share || 0)
        youOwe += share
        const payerName = sb.paidBy
        if (!peopleYouOweMap[payerName]) {
          peopleYouOweMap[payerName] = { name: payerName, amount: 0, count: 0, bills: [] }
        }
        peopleYouOweMap[payerName].amount += share
        peopleYouOweMap[payerName].count += 1
        peopleYouOweMap[payerName].bills.push({ title: sb.title, share, id: sb.id })
      }
    }
  })

  return {
    youOwe,
    youWillReceive,
    netBalance: youWillReceive - youOwe,
    peopleWhoOweYou: Object.values(peopleWhoOweYouMap).sort((a, b) => b.amount - a.amount),
    peopleYouOwe: Object.values(peopleYouOweMap).sort((a, b) => b.amount - a.amount),
    totalActive,
    totalSettled,
  }
}

export const scholarshipScore = (s, user) => {
  let score = 40
  if (s.field === 'Any field' || (user?.major && /stem|computer|engineering|science|math|tech/i.test(user.major) && s.field === 'STEM') || (/art|design|creative/i.test(user?.major) && s.field === 'Arts')) score += 25
  if (s.level === 'Any level' || s.level?.includes(user?.year) || s.level === 'Undergraduate') score += 15
  score += (user?.gpa || 0) >= (s.minGpa || 0) ? 15 : -20
  if (s.need && user?.needBased) score += 10
  return Math.max(0, Math.min(99, score))
}

export const weeklySavings = (goal) => {
  const weeks = Math.max(1, Math.ceil((new Date(goal.targetDate) - new Date()) / (7 * 864e5)))
  return Math.ceil(Math.max(0, (goal.target || 0) - (goal.current || 0)) / weeks)
}

export const habitScore = (state) => {
  const expenses = (state.transactions || []).filter(t => t.type === 'expense')
  const categories = state.budgets?.categories || {}
  const budgetPoints = Object.entries(categories).reduce((n, [cat, limit]) => {
    const spent = expenses.filter(t => t.category === cat).reduce((sum, t) => sum + Number(t.amount || 0), 0)
    return n + (spent <= limit ? 4 : 0)
  }, 0)
  const tracking = Math.min(30, new Set(expenses.map(t => t.date)).size * 4)
  const savings = Math.min(25, Math.round(((state.goal?.current || 0) / Math.max(1, state.goal?.target || 1)) * 25))
  const bills = Math.min(15, (state.bills || []).filter(b => b.status === 'Paid').length * 5)
  return Math.min(100, 25 + tracking + budgetPoints + savings + bills)
}
