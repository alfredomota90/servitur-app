import { useState, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useClients } from '@/features/clients/api'
import {
  useInvoicesByClient,
  useCreateInvoice,
  useUpdateInvoice,
  useDeleteInvoice,
  useBatchUpdateInvoicesPaymentDate,
} from '@/features/invoices/api'
import {
  usePaymentsTQ,
  useCreatePayment,
  useUpdatePayment,
  useDeletePayment,
} from '@/features/payments/api'
import type { Invoice } from '@/features/invoices/api'
import { ClipboardCheck } from 'lucide-react'
import BackHeader from '@/components/back-header'
import {
  generatePendingReport,
  generatePendingComplementsReport,
  generatePaymentHistoryReport,
} from '@/lib/pdf-service'
import { getNextBillingDate, formatDate, fmtAmount } from '@/lib/utils'
import { previewXMLAsPDF, previewPDFFromInvoiceData } from '@/lib/xml-parser'
import { useSort } from '@/hooks/use-sort'
import { usePayments } from '@/hooks/use-payments'
import { useDeleteConfirm } from '@/hooks/use-delete-confirm'
import { useStore } from '@/store/use-store'
import StatsCards from '@/components/stats-cards'
import PendingInvoicesTable from '@/components/pending-invoices-table'
import PaidInvoicesTable from '@/components/paid-invoices-table'
import PaymentHistoryTable from '@/components/payment-history-table'
import SelectionBar from '@/components/selection-bar'
import InvoicePreviewModal from '@/components/invoice-preview-modal'
import ConfirmModal from '@/components/confirm-modal'
import InvoiceFormModal from '@/components/invoice-form-modal'
import PaymentModal from '@/components/payment-modal'
import EditPaymentModal from '@/components/edit-payment-modal'
import ViewAttachmentModal from '@/components/view-attachment-modal'
import type { Payment } from '@/features/payments/api'

export default function ClientDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: clients = [] } = useClients()
  const { data: clientInvoices = [] } = useInvoicesByClient(id)
  const { data: payments = [] } = usePaymentsTQ()
  const createInvoice = useCreateInvoice()
  const updateInvoice = useUpdateInvoice()
  const deleteInvoice = useDeleteInvoice()
  const createPayment = useCreatePayment()
  const updatePayment = useUpdatePayment()
  const deletePayment = useDeletePayment()
  const batchUpdatePaymentDate = useBatchUpdateInvoicesPaymentDate()

  const [showForm, setShowForm] = useState(false)
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null)
  const [expandedDescId, setExpandedDescId] = useState<string | null>(null)
  const [viewingAttachment, setViewingAttachment] = useState<string | null>(null)

  const client = clients.find((c) => c.id === id)
  const pendingInvoices = clientInvoices.filter((i) => i.status === 'pendiente')
  const paidInvoices = clientInvoices.filter((i) => i.status === 'pagado')

  const totalGenerated = useMemo(
    () => clientInvoices.reduce((sum, i) => sum + (i.totalMxn || i.total), 0),
    [clientInvoices],
  )
  const totalPaid = useMemo(
    () => paidInvoices.reduce((sum, i) => sum + (i.totalMxn || i.total), 0),
    [paidInvoices],
  )
  const totalPending = useMemo(
    () => pendingInvoices.reduce((sum, i) => sum + (i.totalMxn || i.total), 0),
    [pendingInvoices],
  )

  const [invoicePreviewUrl, setInvoicePreviewUrl] = useState<string | null>(null)
  const addToast = useStore((s) => s.addToast)

  const previewInvoice = async (inv: Invoice) => {
    try {
      if (inv.xmlPath) {
        const url = await previewXMLAsPDF(inv.xmlPath)
        if (url) {
          setInvoicePreviewUrl(url)
          return
        }
      }
      const url = previewPDFFromInvoiceData({
        serieFolio: inv.serieFolio,
        rfcReceptor: inv.rfcReceptor,
        receptorName: inv.receptorName,
        invoiceDescription: inv.invoiceDescription,
        totalMxn: inv.totalMxn,
        total: inv.total,
        certificationDate: inv.certificationDate,
        tripDate: inv.tripDate,
        fromLocation: inv.fromLocation,
        toLocation: inv.toLocation,
        clientName: inv.clientName,
      })
      setInvoicePreviewUrl(url)
    } catch {
      addToast({ type: 'error', message: 'Error al generar vista previa' })
    }
  }

  const closePreview = () => {
    if (invoicePreviewUrl) URL.revokeObjectURL(invoicePreviewUrl)
    setInvoicePreviewUrl(null)
  }

  const sort = useSort(clientInvoices, pendingInvoices)
  const paymentsCtrl = usePayments(clientInvoices, pendingInvoices, payments, {
    addPayment: (p: Payment) => createPayment.mutateAsync(p),
    updateInvoice: (id: string, data: Partial<Invoice>) => updateInvoice.mutate({ id, data }),
    updatePayment: async (id: string, data: Partial<Payment>) => {
      updatePayment.mutate({ id, data })
    },
    deletePayment: async (id: string) => {
      deletePayment.mutate(id)
    },
    batchUpdatePaymentDate: (paymentId: string, paymentDate: string) => {
      batchUpdatePaymentDate.mutate({ paymentId, paymentDate })
    },
  })
  const del = useDeleteConfirm((id: string) => deleteInvoice.mutate(id))
  const delPayment = useDeleteConfirm((id: string) => deletePayment.mutate(id))

  if (!client) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted">Cliente no encontrado</p>
        <Link to="/admin/clientes" className="text-error hover:underline">
          Volver a clientes
        </Link>
      </div>
    )
  }

  const handleEdit = (invoice: Invoice) => {
    setEditingInvoice(invoice)
    setShowForm(true)
  }

  const generatePDF = async () => {
    await generatePendingReport(pendingInvoices, client.name, totalPending)
  }

  const generateComplementsPDF = async () => {
    await generatePendingComplementsReport(paidInvoices, client.name, totalPaid)
  }

  const generatePaymentHistoryPDF = async () => {
    await generatePaymentHistoryReport(payments, clientInvoices, client.name)
  }

  const stats = [
    {
      label: 'Pendiente',
      value: `$${fmtAmount(totalPending)}`,
      textClass: 'text-warning',
    },
    {
      label: 'Pagado',
      value: `$${fmtAmount(totalPaid)}`,
      textClass: 'text-success',
    },
    {
      label: 'Total generado',
      value: `$${fmtAmount(totalGenerated)}`,
      textClass: 'text-foreground',
    },
    {
      label: 'Facturas pendientes de pago',
      value: pendingInvoices.length.toString(),
      textClass: 'text-accent',
    },
  ]

  return (
    <div className="p-4 md:p-6">
      <BackHeader to="/admin/clientes" label="Volver a clientes" />

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{client.name}</h1>
          <p className="text-muted">
            {client.email && <>{client.email} • </>}
            {client.phone}
          </p>
          {client.billingInterval > 0 &&
            (() => {
              const nextDate = getNextBillingDate(clientInvoices, client.billingInterval)
              if (!nextDate) return null
              return (
                <p className="text-sm mt-1 text-muted">
                  Intervalo de facturación:{' '}
                  <span className="font-medium">{client.billingInterval} días</span>
                  {' — '}
                  Próxima facturación: <span className="font-medium">{formatDate(nextDate)}</span>
                </p>
              )
            })()}
        </div>
        <div className="flex gap-1.5" />
      </div>

      <StatsCards stats={stats} />

      {client.requiresPapeleria && (
        <button
          onClick={() => navigate(`/admin/clientes/${id}/requisitos`)}
          className="w-full mb-6 p-4 rounded-xl border-2 border-dashed border-accent/40 bg-accent/5 hover:bg-accent/10 transition-colors flex items-center justify-center gap-3"
        >
          <ClipboardCheck size={24} className="text-accent" />
          <div className="text-left">
            <p className="font-semibold text-accent-text">Gestión de requisitos</p>
            <p className="text-sm text-muted">Administrar papelería y documentos</p>
          </div>
        </button>
      )}

      <PendingInvoicesTable
        invoices={sort.sortedPendingInvoices}
        payments={payments}
        sortKey={sort.sortKey}
        sortDir={sort.sortDir}
        selectingMode={paymentsCtrl.selectingMode}
        selectedInvoiceIds={paymentsCtrl.selectedInvoiceIds}
        expandedDescId={expandedDescId}
        totalPending={totalPending}
        onToggleSort={sort.toggleSort}
        onToggleSelect={paymentsCtrl.toggleSelectInvoice}
        onSelectAll={paymentsCtrl.handleSelectAll}
        onPayment={paymentsCtrl.openPaymentModal}
        onEdit={handleEdit}
        onPreview={previewInvoice}
        onDelete={del.handleDelete}
        onViewAttachment={setViewingAttachment}
        onEditPayment={paymentsCtrl.openEditPayment}
        onToggleExpandDesc={setExpandedDescId}
        onGeneratePDF={generatePDF}
        onAddInvoice={() => {
          setEditingInvoice(null)
          setShowForm(true)
        }}
      />

      {paymentsCtrl.selectingMode && (
        <SelectionBar
          count={paymentsCtrl.selectedInvoiceIds.length}
          totalAmount={paymentsCtrl.selectedInvoices.reduce(
            (s, i) => s + (i.totalMxn || i.total),
            0,
          )}
          onCancel={paymentsCtrl.cancelSelection}
          onContinue={paymentsCtrl.continueToPayment}
        />
      )}

      <PaidInvoicesTable
        paidInvoices={paidInvoices}
        payments={payments}
        totalPaid={totalPaid}
        onPreview={previewInvoice}
        onViewAttachment={setViewingAttachment}
        onEditPayment={paymentsCtrl.openEditPayment}
        onDelete={del.handleDelete}
        onGenerateComplementsPDF={generateComplementsPDF}
      />

      <PaymentHistoryTable
        payments={payments}
        invoices={clientInvoices}
        onViewAttachment={setViewingAttachment}
        onEditPayment={(payment) => {
          const inv = clientInvoices.find((i) => i.paymentId === payment.id)
          if (inv) paymentsCtrl.openEditPayment(inv)
        }}
        onDelete={delPayment.handleDelete}
        onGeneratePaymentHistoryPDF={generatePaymentHistoryPDF}
      />

      <InvoiceFormModal
        open={showForm}
        clientId={id || ''}
        clientName={client.name}
        editingInvoice={editingInvoice}
        onSave={(data) => {
          if (editingInvoice) {
            updateInvoice.mutate({ id: editingInvoice.id, data })
          } else {
            createInvoice.mutate(data)
          }
        }}
        onClose={() => {
          setShowForm(false)
          setEditingInvoice(null)
        }}
      />

      <PaymentModal
        open={paymentsCtrl.showPaymentModal && paymentsCtrl.selectedInvoiceIds.length > 0}
        invoices={paymentsCtrl.selectedInvoices}
        paymentData={paymentsCtrl.paymentData}
        onPaymentDataChange={paymentsCtrl.setPaymentData}
        onConfirm={paymentsCtrl.registerPayment}
        onAddMore={paymentsCtrl.addMoreInvoices}
        onClose={paymentsCtrl.closePaymentModal}
      />

      <EditPaymentModal
        open={paymentsCtrl.showEditPayment}
        payment={paymentsCtrl.editingPayment}
        invoice={paymentsCtrl.editingPaymentInvoice}
        linkedInvoices={paymentsCtrl.editingLinkedInvoices}
        availableInvoices={paidInvoices.filter(
          (inv) => !paymentsCtrl.editingLinkedInvoices.some((l) => l.id === inv.id),
        )}
        editData={paymentsCtrl.editPaymentData}
        onEditDataChange={paymentsCtrl.setEditPaymentData}
        onAddInvoice={paymentsCtrl.addInvoiceToEdit}
        onRemoveInvoice={paymentsCtrl.removeInvoiceFromEdit}
        onSave={paymentsCtrl.saveEditPayment}
        onClose={paymentsCtrl.closeEditPayment}
        showDeletePaymentConfirm={paymentsCtrl.showDeletePaymentConfirm}
        onConfirmDeletePayment={paymentsCtrl.confirmDeleteOrphanPayment}
        onCancelDeletePayment={paymentsCtrl.cancelDeleteOrphanPayment}
      />

      <InvoicePreviewModal url={invoicePreviewUrl} onClose={closePreview} />

      <ViewAttachmentModal
        attachment={viewingAttachment}
        onClose={() => setViewingAttachment(null)}
      />

      <ConfirmModal
        open={del.deleteModal.open}
        title="Eliminar viaje/factura"
        message="¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede revertir."
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onConfirm={del.confirmDelete}
        onCancel={del.cancelDelete}
        danger={true}
      />
      <ConfirmModal
        open={delPayment.deleteModal.open}
        title="Eliminar pago"
        message="¿Estás seguro de que deseas eliminar este pago? Esta acción no se puede revertir."
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onConfirm={delPayment.confirmDelete}
        onCancel={delPayment.cancelDelete}
        danger={true}
      />
    </div>
  )
}
