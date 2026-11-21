import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { FinanceProvider } from './context/FinanceContext'
import { Shell } from './components/layout/Shell'

import { DashboardPage } from './pages/DashboardPage'
import { TransactionsPage } from './pages/TransactionsPage'
import { BudgetPage } from './pages/BudgetPage'
import { BillsPage } from './pages/BillsPage'
import { SplitBillsPage } from './pages/SplitBillsPage'
import { ScholarshipsPage } from './pages/ScholarshipsPage'
import { ReportsPage } from './pages/ReportsPage'
import { SavingsPage } from './pages/SavingsPage'
import { SettingsPage } from './pages/SettingsPage'

export default function App() {
  return (
    <FinanceProvider>
      <Routes>
        <Route element={<Shell />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/budget" element={<BudgetPage />} />
          <Route path="/bills" element={<BillsPage />} />
          <Route path="/split-bills" element={<SplitBillsPage />} />
          <Route path="/scholarships" element={<ScholarshipsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/savings" element={<SavingsPage />} />
          <Route path="/profile" element={<Navigate to="/settings" replace />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </FinanceProvider>
  )
}
