import { useState } from 'react'
import type { Invoice } from '@/features/invoices/api'
import { sortInvoices, type SortKey } from '@/lib/invoice-utils'

export function useSort(allInvoices: Invoice[], pendingInvoices: Invoice[]) {
  const [sortKey, setSortKey] = useState<SortKey>('date')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  return {
    sortKey,
    sortDir,
    toggleSort,
    sortedInvoices: sortInvoices(allInvoices, sortKey, sortDir),
    sortedPendingInvoices: sortInvoices(pendingInvoices, sortKey, sortDir),
  }
}
