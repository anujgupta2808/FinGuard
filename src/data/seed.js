import { OFFICIAL_SCHOLARSHIPS } from './officialScholarships'

export const seedState = {
  user: {
    name: 'Anuj Gupta',
    email: 'anuj@example.com',
    major: 'Computer Science',
    year: 'Junior',
    gpa: 3.7,
    location: 'Delhi / Bengaluru',
    needBased: true,
  },
  currency: 'INR', // 'INR' (₹) | 'USD' ($) | 'EUR' (€) | 'GBP' (£)
  transactions: [],
  budgets: {
    total: 0,
    categories: {
      'Food': 0,
      'Travel': 0,
      'Education': 0,
      'Housing': 0,
      'Entertainment': 0,
      'Bills': 0,
      'Shopping': 0,
      'Healthcare': 0,
      'Other': 0,
    },
  },
  bills: [],
  splitBills: [],
  scholarships: OFFICIAL_SCHOLARSHIPS,
  goal: {
    target: 0,
    current: 0,
    targetDate: '',
    title: '',
  },
  habit: {
    streak: 0,
    xp: 0,
    lastCheckin: '',
  },
  theme: 'light',
}
