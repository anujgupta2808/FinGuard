import { formatCurrency } from './finance'

export const exportTransactionsToCSV = (transactions = [], currency = 'INR') => {
  const headers = ['ID', 'Title', 'Type', 'Amount', 'Category', 'Date', 'Payment Method', 'Notes']
  const rows = transactions.map(t => [
    t.id,
    `"${(t.title || '').replace(/"/g, '""')}"`,
    t.type,
    t.amount,
    `"${(t.category || '').replace(/"/g, '""')}"`,
    t.date,
    `"${(t.method || '').replace(/"/g, '""')}"`,
    `"${(t.notes || '').replace(/"/g, '""')}"`,
  ])

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  downloadBlob(csvContent, `FinGuard_Transactions_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8;')
}

export const exportMonthlyReportToCSV = (reportData, currency = 'INR') => {
  const { monthName, metrics, topCategory, categoryBreakdown, billsSummary, splitSummary } = reportData
  
  const lines = [
    `FinGuard Financial Report - ${monthName}`,
    `Generated on: ${new Date().toLocaleDateString()}`,
    '',
    '=== MONTHLY SUMMARY ===',
    `Total Income,${formatCurrency(metrics.income, currency)}`,
    `Total Expenses,${formatCurrency(metrics.expenses, currency)}`,
    `Net Savings,${formatCurrency(metrics.balance, currency)}`,
    `Savings Rate,${metrics.savingsRate}%`,
    `Top Spending Category,${topCategory?.name || 'None'} (${formatCurrency(topCategory?.amount || 0, currency)})`,
    '',
    '=== CATEGORY SPENDING BREAKDOWN ===',
    'Category,Spent,Budget Limit,Status',
    ...(categoryBreakdown || []).map(c => 
      `"${c.name}",${formatCurrency(c.spent, currency)},${formatCurrency(c.limit, currency)},${c.status}`
    ),
    '',
    '=== BILLS STATUS ===',
    `Paid Bills,${billsSummary.paidCount} (${formatCurrency(billsSummary.paidTotal, currency)})`,
    `Upcoming Bills,${billsSummary.upcomingCount} (${formatCurrency(billsSummary.upcomingTotal, currency)})`,
    `Overdue Bills,${billsSummary.overdueCount} (${formatCurrency(billsSummary.overdueTotal, currency)})`,
    '',
    '=== SPLIT BILLS SUMMARY ===',
    `You Owe,${formatCurrency(splitSummary.youOwe, currency)}`,
    `You Will Receive,${formatCurrency(splitSummary.youWillReceive, currency)}`,
    `Net Settlement Balance,${formatCurrency(splitSummary.netBalance, currency)}`,
  ]

  const csvContent = lines.join('\n')
  downloadBlob(csvContent, `FinGuard_Report_${monthName.replace(/\s+/g, '_')}.csv`, 'text/csv;charset=utf-8;')
}

function downloadBlob(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
