import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { BottomNav } from './BottomNav'
import { Toast } from '../common/Toast'
import { TransactionModal } from '../modals/TransactionModal'
import { SplitBillModal } from '../modals/SplitBillModal'
import { useFinance } from '../../context/FinanceContext'

export function Shell() {
  const { state } = useFinance()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [txModalOpen, setTxModalOpen] = useState(false)
  const [splitModalOpen, setSplitModalOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState('success')

  const notify = (msg, type = 'success') => {
    setToastMessage(msg)
    setToastType(type)
  }

  return (
    <div className={`app-root ${state.theme === 'dark' ? 'dark-mode' : 'light-mode'}`}>
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onQuickAdd={() => setTxModalOpen(true)}
      />

      <div className="app-main-wrapper">
        <Topbar
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onQuickAdd={() => setTxModalOpen(true)}
          onQuickSplit={() => setSplitModalOpen(true)}
          notify={notify}
        />

        <main className="app-content-area" id="main-content">
          <Outlet context={{ notify, openAddTransaction: () => setTxModalOpen(true), openAddSplitBill: () => setSplitModalOpen(true) }} />
        </main>

        <BottomNav onOpenMore={() => setMobileMenuOpen(true)} />
      </div>

      <TransactionModal
        isOpen={txModalOpen}
        onClose={() => setTxModalOpen(false)}
        onSaved={(msg) => notify(msg, 'success')}
      />

      <SplitBillModal
        isOpen={splitModalOpen}
        onClose={() => setSplitModalOpen(false)}
        onSaved={(msg) => notify(msg, 'success')}
      />

      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage('')}
        />
      )}
    </div>
  )
}
