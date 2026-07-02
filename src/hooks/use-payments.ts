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

function toInputDate(value?: string | null): string {
  if (!value) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  const m = value.match(/^(\d{4}-\d{2}-\d{2})/)
  return m ? m[1] : ''
}

interface StoreActions {
  addPayment: (payment: Payment) => Promise<Payment | null>
  updateInvoice: (id: string, data: Partial<Invoice>) => void
  updatePayment: (id: string, payment: Partial<Payment>) => Promise<void>
  deletePayment: (id: string) => Promise<void>
  batchUpdatePaymentDate: (paymentId: string, paymentDate: string) => void
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
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null)
  const [editingLinkedInvoices, setEditingLinkedInvoices] = useState<Invoice[]>([])
  const [prevLinkedInvoiceIds, setPrevLinkedInvoiceIds] = useState<string[]>([])
  const [showDeletePaymentConfirm, setShowDeletePaymentConfirm] = useState(false)

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
      date: toInputDate(invoice.paymentDate) || new Date().toISOString().split('T')[0],
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

    if (linkedPayment) {
      const linkedInvs = invoices.filter((i) => i.paymentId === linkedPayment.id)
      setEditingPayment(linkedPayment)
      setEditingLinkedInvoices(linkedInvs)
      setPrevLinkedInvoiceIds(linkedInvs.map((i) => i.id))
      setEditPaymentData({
        method: linkedPayment.method || 'transferencia',
        reference: linkedPayment.reference || '',
        attachment: linkedPayment.attachmentPath || '',
        attachmentName: '',
        date: toInputDate(invoice.paymentDate),
      })
      setEditingPaymentInvoice(invoice)
    } else {
      setEditingPayment(null)
      setEditingLinkedInvoices([invoice])
      setPrevLinkedInvoiceIds([invoice.id])
      setEditPaymentData({
        method: invoice.paymentMethod || 'transferencia',
        reference: invoice.paymentReference || '',
        attachment: invoice.paymentAttachmentPath || '',
        attachmentName: '',
        date: toInputDate(invoice.paymentDate),
      })
      setEditingPaymentInvoice(invoice)
    }
    setShowEditPayment(true)
  }

  const closePaymentModal = () => {
    setShowPaymentModal(false)
    setSelectedInvoiceIds([])
  }

  const closeEditPayment = () => {
    setShowEditPayment(false)
    setEditingPaymentInvoice(null)
    setEditingPayment(null)
    setEditingLinkedInvoices([])
    setPrevLinkedInvoiceIds([])
    setShowDeletePaymentConfirm(false)
  }

  const addInvoiceToEdit = (invoiceId: string) => {
    const inv = invoices.find((i) => i.id === invoiceId)
    if (inv && !editingLinkedInvoices.some((l) => l.id === invoiceId)) {
      setEditingLinkedInvoices((prev) => [...prev, inv])
    }
  }

  const removeInvoiceFromEdit = (invoiceId: string) => {
    setEditingLinkedInvoices((prev) => prev.filter((i) => i.id !== invoiceId))
  }

  const confirmDeleteOrphanPayment = () => {
    if (!editingPayment) return
    prevLinkedInvoiceIds.forEach((id) => {
      actions.updateInvoice(id, {
        status: 'pendiente',
        paymentId: null,
        paymentDate: undefined,
        paymentMethod: undefined,
        paymentReference: undefined,
      })
    })
    actions.deletePayment(editingPayment.id)
    closeEditPayment()
  }

  const cancelDeleteOrphanPayment = () => {
    setShowDeletePaymentConfirm(false)
  }

  const saveEditPayment = () => {
    if (!editingPaymentInvoice) return

    if (editingPayment) {
      if (editingLinkedInvoices.length === 0) {
        setShowDeletePaymentConfirm(true)
        return
      }

      actions.updatePayment(editingPayment.id, {
        method: editPaymentData.method,
        reference: editPaymentData.reference || undefined,
        attachmentPath: editPaymentData.attachment || undefined,
        amount: editingLinkedInvoices.reduce((sum, i) => sum + (i.totalMxn || i.total), 0),
      })

      const currentIds = editingLinkedInvoices.map((i) => i.id)

      prevLinkedInvoiceIds.forEach((id) => {
        if (!currentIds.includes(id)) {
          actions.updateInvoice(id, {
            status: 'pendiente',
            paymentId: null,
            paymentDate: undefined,
            paymentMethod: undefined,
            paymentReference: undefined,
          })
        }
      })

      currentIds.forEach((id) => {
        if (!prevLinkedInvoiceIds.includes(id)) {
          actions.updateInvoice(id, {
            paymentId: editingPayment.id,
          })
        }
      })

      if (editPaymentData.date) {
        actions.batchUpdatePaymentDate(editingPayment.id, editPaymentData.date)
      }
    } else {
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
    }

    closeEditPayment()
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
    editingPayment,
    editingLinkedInvoices,
    prevLinkedInvoiceIds,
    showDeletePaymentConfirm,
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
    addInvoiceToEdit,
    removeInvoiceFromEdit,
    confirmDeleteOrphanPayment,
    cancelDeleteOrphanPayment,
  }
}
