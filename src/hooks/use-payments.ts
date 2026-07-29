import { useMemo, useState } from 'react'

import type { EditPaymentFormValues } from '@/components/edit-payment-modal'
import type { PaymentFormValues } from '@/components/payment-modal'
import type { Invoice } from '@/features/invoices/api'
import type { Payment } from '@/features/payments/api'

interface StoreActions {
  addPayment: (payment: Payment) => Promise<Payment | null>
  updateInvoice: (id: string, data: Partial<Invoice>) => void
  updatePayment: (id: string, payment: Partial<Payment>) => Promise<void>
  deletePayment: (id: string) => Promise<void>
  batchUpdatePaymentDate: (paymentId: string, paymentDate: string) => void
}

function toInputDate(value?: string | null): string {
  if (!value) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  const m = value.match(/^(\d{4}-\d{2}-\d{2})/)
  return m ? m[1] : ''
}

function buildDefaultPaymentValues(invoice?: Invoice): PaymentFormValues {
  return {
    method: invoice?.paymentMethod || 'transferencia',
    reference: invoice?.paymentReference || '',
    attachment: '',
    attachmentName: '',
    date: toInputDate(invoice?.paymentDate) || new Date().toISOString().split('T')[0],
  }
}

function buildDefaultEditPaymentValues(
  payment?: Payment | null,
  invoice?: Invoice | null,
): EditPaymentFormValues {
  return {
    method: payment?.method || invoice?.paymentMethod || 'transferencia',
    reference: payment?.reference || invoice?.paymentReference || '',
    attachment: payment?.attachmentPath || invoice?.paymentAttachmentPath || '',
    attachmentName: '',
    date: toInputDate(invoice?.paymentDate),
  }
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
  const [paymentModalDefaults, setPaymentModalDefaults] = useState<PaymentFormValues | undefined>()

  const [showEditPayment, setShowEditPayment] = useState(false)
  const [editingPaymentInvoice, setEditingPaymentInvoice] = useState<Invoice | null>(null)
  const [editPaymentDefaults, setEditPaymentDefaults] = useState<
    EditPaymentFormValues | undefined
  >()
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
    setPaymentModalDefaults(buildDefaultPaymentValues(invoice))
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

  const registerPayment = (formData: PaymentFormValues) => {
    if (selectedInvoiceIds.length === 0) return

    const totalAmount = selectedInvoices.reduce((sum, inv) => sum + (inv.totalMxn || inv.total), 0)

    actions
      .addPayment({
        id: '',
        amount: totalAmount,
        method: formData.method || 'transferencia',
        reference: formData.reference || undefined,
        attachmentPath: formData.attachment || undefined,
      })
      .then((newPayment) => {
        if (newPayment) {
          selectedInvoiceIds.forEach((id) => {
            actions.updateInvoice(id, {
              status: 'pagado',
              paymentDate: formData.date,
              paymentId: newPayment.id,
              notes: undefined,
            })
          })
        }
        setShowPaymentModal(false)
        setSelectedInvoiceIds([])
        setPaymentModalDefaults(undefined)
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
      setEditPaymentDefaults(buildDefaultEditPaymentValues(linkedPayment, invoice))
      setEditingPaymentInvoice(invoice)
    } else {
      setEditingPayment(null)
      setEditingLinkedInvoices([invoice])
      setPrevLinkedInvoiceIds([invoice.id])
      setEditPaymentDefaults(buildDefaultEditPaymentValues(null, invoice))
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
    setEditPaymentDefaults(undefined)
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

  const saveEditPayment = (formData: EditPaymentFormValues) => {
    if (!editingPaymentInvoice) return

    if (editingPayment) {
      if (editingLinkedInvoices.length === 0) {
        setShowDeletePaymentConfirm(true)
        return
      }

      actions.updatePayment(editingPayment.id, {
        method: formData.method,
        reference: formData.reference || undefined,
        attachmentPath: formData.attachment || undefined,
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

      if (formData.date) {
        actions.batchUpdatePaymentDate(editingPayment.id, formData.date)
      }
    } else {
      const invoiceUpdates: Partial<Invoice> = {
        paymentDate: formData.date || undefined,
      }

      if (editingPaymentInvoice.paymentId) {
        actions.updatePayment(editingPaymentInvoice.paymentId, {
          method: formData.method,
          reference: formData.reference || undefined,
          attachmentPath: formData.attachment || undefined,
        })
        actions.updateInvoice(editingPaymentInvoice.id, invoiceUpdates)
      } else {
        actions.updateInvoice(editingPaymentInvoice.id, {
          ...invoiceUpdates,
          paymentMethod: formData.method,
          paymentReference: formData.reference || undefined,
          paymentAttachmentPath: formData.attachment || undefined,
        })
      }
    }

    closeEditPayment()
  }

  return {
    showPaymentModal,
    selectedInvoiceIds,
    selectingMode,
    paymentModalDefaults,
    showEditPayment,
    editingPaymentInvoice,
    editPaymentDefaults,
    editingPayment,
    editingLinkedInvoices,
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
