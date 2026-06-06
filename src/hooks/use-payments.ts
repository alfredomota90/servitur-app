import { useState, useMemo } from 'react'
import type { Invoice } from '@/features/invoices/api'
import type { Payment } from '@/features/payments/api'

interface PaymentFormData {
  method: Invoice['paymentMethod']
  reference: string
  notes: string
  attachment: string
  attachmentName: string
  date: string
}

interface EditPaymentFormData {
  method: Invoice['paymentMethod']
  reference: string
  attachment: string
  attachmentName: string
  date: string
}

interface StoreActions {
  addPayment: (payment: Payment) => Promise<Payment | null>
  updateInvoice: (id: string, data: Partial<Invoice>) => void
  updatePayment: (id: string, payment: Partial<Payment>) => Promise<void>
}

export function usePayments(
  invoices: Invoice[],
  pendingInvoices: Invoice[],
  payments: Payment[],
  actions: StoreActions,
) {
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([])
  const [selectingMode, setSelectingMode] = useState(false)
  const [paymentData, setPaymentData] = useState<PaymentFormData>({
    method: 'transferencia',
    reference: '',
    notes: '',
    attachment: '',
    attachmentName: '',
    date: new Date().toISOString().split('T')[0],
  })

  const [showEditPayment, setShowEditPayment] = useState(false)
  const [editingPaymentInvoice, setEditingPaymentInvoice] = useState<Invoice | null>(null)
  const [editPaymentData, setEditPaymentData] = useState<EditPaymentFormData>({
    method: 'transferencia',
    reference: '',
    attachment: '',
    attachmentName: '',
    date: '',
  })

  const selectedInvoices = useMemo(
    () => invoices.filter((inv) => selectedInvoiceIds.includes(inv.id)),
    [invoices, selectedInvoiceIds],
  )

  const openPaymentModal = (invoice: Invoice) => {
    setSelectedInvoiceIds([invoice.id])
    setPaymentData({
      method: invoice.paymentMethod || 'transferencia',
      reference: invoice.paymentReference || '',
      notes: '',
      attachment: '',
      attachmentName: '',
      date: invoice.paymentDate || new Date().toISOString().split('T')[0],
    })
    setShowPaymentModal(true)
  }

  const addMoreInvoices = () => {
    setShowPaymentModal(false)
    setSelectingMode(true)
  }

  const toggleSelectInvoice = (id: string) => {
    setSelectedInvoiceIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    )
  }

  const handleSelectAll = () => {
    const pendientes = pendingInvoices.map((i) => i.id)
    const allSelected = pendientes.every((id) => selectedInvoiceIds.includes(id))
    if (allSelected) {
      setSelectedInvoiceIds((prev) => prev.filter((id) => !pendientes.includes(id)))
    } else {
      setSelectedInvoiceIds((prev) => [...new Set([...prev, ...pendientes])])
    }
  }

  const continueToPayment = () => {
    setSelectingMode(false)
    setShowPaymentModal(true)
  }

  const cancelSelection = () => {
    setSelectingMode(false)
    setSelectedInvoiceIds([])
  }

  const registerPayment = () => {
    if (selectedInvoiceIds.length === 0) return

    const totalAmount = selectedInvoices.reduce((sum, inv) => sum + (inv.totalMxn || inv.total), 0)

    actions
      .addPayment({
        id: '',
        amount: totalAmount,
        method: paymentData.method || 'transferencia',
        reference: paymentData.reference || undefined,
        attachmentPath: paymentData.attachment || undefined,
      })
      .then((newPayment) => {
        if (newPayment) {
          selectedInvoiceIds.forEach((id) => {
            actions.updateInvoice(id, {
              status: 'pagado',
              paymentDate: paymentData.date,
              paymentId: newPayment.id,
              notes: paymentData.notes || undefined,
            })
          })
        }
        setShowPaymentModal(false)
        setSelectedInvoiceIds([])
        setPaymentData({
          method: 'transferencia',
          reference: '',
          notes: '',
          attachment: '',
          attachmentName: '',
          date: new Date().toISOString().split('T')[0],
        })
      })
  }

  const openEditPayment = (invoice: Invoice) => {
    const linkedPayment = invoice.paymentId
      ? payments.find((p) => p.id === invoice.paymentId)
      : undefined
    setEditingPaymentInvoice(invoice)
    setEditPaymentData({
      method: invoice.paymentMethod || linkedPayment?.method || 'transferencia',
      reference: invoice.paymentReference || linkedPayment?.reference || '',
      attachment: invoice.paymentAttachmentPath || linkedPayment?.attachmentPath || '',
      attachmentName: '',
      date: invoice.paymentDate || '',
    })
    setShowEditPayment(true)
  }

  const closePaymentModal = () => {
    setShowPaymentModal(false)
    setSelectedInvoiceIds([])
  }

  const closeEditPayment = () => {
    setShowEditPayment(false)
    setEditingPaymentInvoice(null)
  }

  const saveEditPayment = () => {
    if (!editingPaymentInvoice) return

    const invoiceUpdates: Partial<Invoice> = {
      paymentDate: editPaymentData.date || undefined,
    }

    if (editingPaymentInvoice.paymentId) {
      actions.updatePayment(editingPaymentInvoice.paymentId, {
        method: editPaymentData.method,
        reference: editPaymentData.reference || undefined,
        attachmentPath: editPaymentData.attachment || undefined,
      })
      actions.updateInvoice(editingPaymentInvoice.id, invoiceUpdates)
    } else {
      actions.updateInvoice(editingPaymentInvoice.id, {
        ...invoiceUpdates,
        paymentMethod: editPaymentData.method,
        paymentReference: editPaymentData.reference || undefined,
        paymentAttachmentPath: editPaymentData.attachment || undefined,
      })
    }

    setShowEditPayment(false)
    setEditingPaymentInvoice(null)
  }

  return {
    showPaymentModal,
    selectedInvoiceIds,
    selectingMode,
    paymentData,
    setPaymentData,
    showEditPayment,
    editingPaymentInvoice,
    editPaymentData,
    setEditPaymentData,
    selectedInvoices,
    openPaymentModal,
    addMoreInvoices,
    toggleSelectInvoice,
    handleSelectAll,
    continueToPayment,
    cancelSelection,
    registerPayment,
    openEditPayment,
    saveEditPayment,
    closePaymentModal,
    closeEditPayment,
  }
}
