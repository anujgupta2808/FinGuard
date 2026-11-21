const today = new Date()
const date = (offset) => { const d = new Date(today); d.setDate(d.getDate() + offset); return d.toISOString().slice(0, 10) }
export const seedState = {
  user: { name: 'Alex Morgan', major: 'Computer Science', year: 'Junior', gpa: 3.7, location: 'California', needBased: true },
  transactions: [
    { id: 't1', title: 'Campus bookstore', amount: 68.5, type: 'expense', category: 'Education', date: date(-1), method: 'Card', notes: '' },
    { id: 't2', title: 'Part-time paycheck', amount: 680, type: 'income', category: 'Salary', date: date(-2), method: 'Direct deposit', notes: '' },
    { id: 't3', title: 'Groceries at Trader Joe’s', amount: 54.2, type: 'expense', category: 'Food & dining', date: date(-3), method: 'Card', notes: '' },
    { id: 't4', title: 'Monthly rent', amount: 720, type: 'expense', category: 'Housing', date: date(-5), method: 'Bank transfer', notes: '' },
    { id: 't5', title: 'Freelance design project', amount: 240, type: 'income', category: 'Freelance', date: date(-7), method: 'PayPal', notes: '' },
    { id: 't6', title: 'Coffee with Jamie', amount: 8.75, type: 'expense', category: 'Food & dining', date: date(-8), method: 'Card', notes: '' },
    { id: 't7', title: 'Bus pass', amount: 42, type: 'expense', category: 'Transport', date: date(-10), method: 'Card', notes: '' },
    { id: 't8', title: 'Streaming subscription', amount: 12.99, type: 'expense', category: 'Entertainment', date: date(-12), method: 'Card', notes: '' },
    { id: 't9', title: 'Scholarship award', amount: 500, type: 'income', category: 'Scholarship', date: date(-15), method: 'Direct deposit', notes: '' },
    { id: 't10', title: 'Electric bill', amount: 48, type: 'expense', category: 'Utilities', date: date(-17), method: 'Bank transfer', notes: '' },
    { id: 't11', title: 'Dinner out', amount: 32.5, type: 'expense', category: 'Food & dining', date: date(-20), method: 'Card', notes: '' },
    { id: 't12', title: 'Tutoring session', amount: 90, type: 'income', category: 'Freelance', date: date(-22), method: 'Cash', notes: '' },
  ],
  budgets: { total: 1500, categories: { 'Housing': 750, 'Food & dining': 300, 'Transport': 120, 'Education': 150, 'Entertainment': 100, 'Utilities': 100 } },
  bills: [
    { id: 'b1', title: 'Rent', amount: 720, due: date(3), status: 'Due soon', icon: 'home' },
    { id: 'b2', title: 'Electricity', amount: 48, due: date(6), status: 'Upcoming', icon: 'zap' },
    { id: 'b3', title: 'Spotify Student', amount: 5.99, due: date(9), status: 'Upcoming', icon: 'music' },
    { id: 'b4', title: 'Phone plan', amount: 35, due: date(-2), status: 'Paid', icon: 'phone' },
  ],
  scholarships: [
    { id: 's1', name: 'Bright Futures STEM Award', org: 'Future Forward Foundation', amount: 2500, deadline: date(12), field: 'STEM', level: 'Undergraduate', minGpa: 3.3, need: false, status: 'Saved', description: 'Supporting curious minds building a brighter, more innovative future.' },
    { id: 's2', name: 'First-Gen Student Grant', org: 'National Student Fund', amount: 1500, deadline: date(25), field: 'Any field', level: 'Undergraduate', minGpa: 2.5, need: true, status: 'In Progress', description: 'Financial support for first-generation students with demonstrated need.' },
    { id: 's3', name: 'Women in Computing Scholarship', org: 'CodeTogether', amount: 5000, deadline: date(41), field: 'STEM', level: 'Undergraduate', minGpa: 3.5, need: false, status: 'Saved', description: 'Helping the next generation of women shape the future of technology.' },
    { id: 's4', name: 'California Community Impact Award', org: 'Golden State Scholars', amount: 1000, deadline: date(8), field: 'Any field', level: 'Any level', minGpa: 3.0, need: true, status: 'Saved', description: 'Recognizing students who give back to their local communities.' },
    { id: 's5', name: 'Next Chapter Creative Fund', org: 'The Creative Futures Fund', amount: 3000, deadline: date(55), field: 'Arts', level: 'Undergraduate', minGpa: 2.8, need: false, status: 'Submitted', description: 'A little runway for big creative ideas and the people behind them.' },
  ],
  goal: { target: 5000, current: 1875, targetDate: date(180) },
  habit: { streak: 6, xp: 420, lastCheckin: date(0) },
  theme: 'light',
}
