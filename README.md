# FinGuard — Student Personal Financial Management

FinGuard is a modern, student-focused personal finance manager designed to keep student spending simple, responsible, and transparent. It runs offline-first with client-side persistence in `localStorage`; no account or backend setup is required.

**Live Application:** [https://anujgupta2808.github.io/FinGuard/](https://anujgupta2808.github.io/FinGuard/)

---

## Run Locally

```sh
npm install
npm run dev
```

To build for production:

```sh
npm run build
npm run preview
```

---

## Core Product Architecture & Modules

1. **Dashboard**
   - Immediate answers to: Current Balance, Total Income, Total Expenses, and Savings Cushion.
   - Rule-based Financial Health indicator (LOW, MEDIUM, HIGH risk classification based on spending ratios, remaining balance, and overdue bills — no black-box AI claims).
   - Monthly cash flow chart (Area chart: Income vs. Expenses across weeks).
   - Upcoming obligations preview and budget usage tracker.
   - Recent transactions ledger preview.

2. **Transactions Ledger**
   - Sub-views: All, Income, and Expenses.
   - Search by merchant or title, filter by category and payment method (UPI, Card, Bank transfer, Cash, etc.).
   - Date range filters and sorting (Newest, Oldest, Highest amount).
   - Add, edit, and delete transactions with confirmation dialogs.
   - Export filtered transactions to CSV.

3. **Budget Planner**
   - Monthly ceiling cap and individual category envelope budgets.
   - Real-time progress indicators (On track, Near cap, Exceeded).
   - Contextual overspending alerts (e.g. "Shopping budget exceeded by ₹600").
   - Inline adjustment modal to redistribute category caps.

4. **Bills & Obligations**
   - Dedicated bills management page with Upcoming, Due Soon, Paid, and Overdue tracking.
   - "₹X due in next 7 days" urgency summary.
   - Mark as Paid toggles with immediate live settlement.
   - Recurring bill indicators (Monthly, Semester, Annual).

5. **Split Bills & Settlements (⭐ NEW)**
   - Guided bill creation: Title, Total Amount, Date, Category, and Payer ("You" or friend).
   - Dynamic participants list (+ Add person / remove).
   - Three split methods:
     - **Equal Split**: Even division among all participants.
     - **Custom Split**: Exact per-person amounts with strict total bill sum validation.
     - **Percentage Split**: Custom percentages with strict 100% sum validation.
   - Real-time settlement tracking: Mark individual participant shares as Paid / Pending with instant balance updates.
   - Top summary cards: "You Will Receive" vs. "You Owe" with detailed breakdowns by friend.
   - **Personal Expense Integration**: Accurately tracks only the user's actual personal share in monthly expenses, not the full group bill when covering for others.

6. **Scholarship Finder**
   - Student opportunity directory with eligibility match scoring based on student major and GPA.
   - Deadline countdowns, requirements checklists, and status tracking (Saved, In Progress, Submitted).

7. **Financial Reports & Audit**
   - Monthly financial statement statement (Income, Expenses, Net Savings, Budget Used %, Settled Bills, Split Summary).
   - Spending by category horizontal bar chart.
   - Export statement to CSV and Print/Save PDF support.

8. **Savings & Habits**
   - Emergency safety net tracking with milestone markers (25%, 50%, 75%, 100%).
   - Recommended weekly savings pace calculator.
   - Daily check-in tracking streak (🔥) and habit wellness score (XP momentum points and achievement badges).

9. **Profile & Settings**
   - Student academic identity (Major, Year, GPA, Campus).
   - Multi-currency support (INR ₹ default, USD $, EUR €, GBP £).
   - Light and Dark mode appearance toggle.
   - Safe reset to demonstration student dataset.

---

## Design System

- **Palette**: Primary `#2563EB`, Success `#16A34A`, Warning `#F59E0B`, Danger `#DC2626`, Background `#F8FAFC`, Card `#FFFFFF`, Text `#0F172A`, Secondary `#64748B`, Border `#E2E8F0`.
- **Typography**: Plus Jakarta Sans / Inter with clear hierarchy.
- **Spacing**: Strict 4px, 8px, 12px, 16px, 24px, 32px, 48px rhythm.
- **Responsive**: Full responsiveness across 320px mobile to 1440px desktop with bottom navigation on mobile.
- **Interactions**: Global ESC key modal dismiss, destructive delete confirmation dialogs, and non-intrusive action feedback toasts.
