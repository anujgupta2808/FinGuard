# FinGuard AI

FinGuard AI is a client-side personal finance SPA built with Vite and React. It runs with realistic sample data and stores changes in `localStorage`; no account or backend setup is needed.

## Run locally

```sh
npm install
npm run dev
```

## Modules

- **Dashboard:** cash flow, spending categories, bills, and an AI-style spending snapshot powered by local heuristics.
- **Transactions:** add, edit, remove, search, filter, and sort ledger entries. Expense categories are suggested from transaction keywords and can be overridden.
- **Budget planner:** adjust the monthly cap and category budgets, then see spending progress and threshold states.
- **Scholarship finder:** seeded opportunity directory, student profile, eligibility match score, deadline countdown, and application status actions.
- **Emergency fund:** customizable savings goal, essential-spend recommendation, milestones, weekly target, and contributions.
- **Financial habits:** calculated wellness score, XP, daily check-ins, streak display, and achievement progress.

## Client state model

`src/data/seed.js` defines the initial `user`, `transactions`, `budgets`, `bills`, `scholarships`, `goal`, `habit`, and `theme` data. `FinanceContext` hydrates this model from `finguard-v1` in localStorage and persists state changes. The store is intentionally isolated so a Firebase or Supabase adapter can replace local persistence later.

The core rule functions live in `src/utils/finance.js`: `categorize` suggests ledger categories from keywords, `scholarshipScore` estimates eligibility from the saved profile and criteria, `weeklySavings` spreads the remaining goal across weeks, and `habitScore` combines tracking, budget, savings, and bill-payment behavior.

All currency displays currently use USD. Scholarship details and scores are guidance from the included sample directory, not live provider data.
