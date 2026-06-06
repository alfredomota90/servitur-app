import { useState, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useTheme } from '@/lib/theme'
import { useClients } from '@/features/clients/api'
import {
  useInvoicesByClient,
  useCreateInvoice,
  useUpdateInvoice,
  useDeleteInvoice,
} from '@/features/invoices/api'
import { usePaymentsTQ, useCreatePayment, useUpdatePayment } from '@/features/payments/api'
import type { Invoice } from '@/features/invoices/api'
import { ArrowLeft, Download, Plus } from 'lucide-react'
import { generatePendingReport, generatePendingComplementsReport } from '@/lib/pdf-service'
import { getNextBillingDate, formatDate } from '@/lib/utils'
import { previewXMLAsPDF, previewPDFFromInvoiceData } from '@/lib/xml-parser'
import { useSort } from '@/hooks/use-sort'
import { usePayments } from '@/hooks/use-payments'
import { useDeleteConfirm } from '@/hooks/use-delete-confirm'
import { useStore } from '@/store/use-store'
import StatsCards from '@/components/stats-cards'
import PendingInvoicesTable from '@/components/pending-invoices-table'
import PaidInvoicesTable from '@/components/paid-invoices-table'
import SelectionBar from '@/components/selection-bar'
import InvoicePreviewModal from '@/components/invoice-preview-modal'
import ConfirmModal from '@/components/confirm-modal'
import InvoiceFormModal from '@/components/invoice-form-modal'
import PaymentModal from '@/components/payment-modal'
import EditPaymentModal from '@/components/edit-payment-modal'
import ViewAttachmentModal from '@/components/view-attachment-modal'
import type { Payment } from '@/features/payments/api'

export default function ClientDetail() {
  const { colors } = useTheme()
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
  })
  const del = useDeleteConfirm((id: string) => deleteInvoice.mutate(id))

  if (!client) {
    return (
      <div className="p-6 text-center">
        <p style={{ color: colors.textMuted }}>Cliente no encontrado</p>
        <Link to="/admin/clientes" className="text-red-600 hover:underline">
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

  const stats = [
    {
      label: 'Pendiente',
      value: `$${totalPending.toLocaleString()}`,
      color: colors.warning,
    },
    {
      label: 'Pagado',
      value: `$${totalPaid.toLocaleString()}`,
      color: colors.success,
    },
    {
      label: 'Total generado',
      value: `$${totalGenerated.toLocaleString()}`,
      color: colors.text,
    },
    {
      label: 'Facturas pendientes de pago',
      value: pendingInvoices.length.toString(),
      color: colors.accent,
    },
  ]

  return (
    <div className="p-4 md:p-6">
      <button
        onClick={() => navigate('/admin/clientes')}
        className="flex items-center gap-2 mb-4"
        style={{ color: colors.textMuted }}
      >
        <ArrowLeft size={20} />
        Volver a clientes
      </button>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: colors.text }}>
            {client.name}
          </h1>
          <p style={{ color: colors.textMuted }}>
            {client.email && <>{client.email} • </>}
            {client.phone}
          </p>
          {client.billingInterval > 0 &&
            (() => {
              const nextDate = getNextBillingDate(clientInvoices, client.billingInterval)
              if (!nextDate) return null
              return (
                <p className="text-sm mt-1" style={{ color: colors.textMuted }}>
                  Intervalo de facturación:{' '}
                  <span className="font-medium">{client.billingInterval} días</span>
                  {' — '}
                  Próxima facturación: <span className="font-medium">{formatDate(nextDate)}</span>
                </p>
              )
            })()}
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={generatePDF}
            disabled={pendingInvoices.length === 0}
            className="flex items-center gap-1.5 px-1.5 py-0.5 rounded text-[11px] md:gap-2 md:px-4 md:py-2 md:rounded-lg md:text-sm disabled:opacity-50"
            style={{ backgroundColor: colors.accent, color: colors.background }}
          >
            <Download size={12} className="md:hidden" />
            <Download size={16} className="hidden md:block" />
            Estado de Cuenta
          </button>
          <button
            onClick={() => {
              setEditingInvoice(null)
              setShowForm(true)
            }}
            className="flex items-center gap-1.5 px-1.5 py-0.5 rounded text-[11px] md:gap-2 md:px-4 md:py-2 md:rounded-lg md:text-sm"
            style={{ backgroundColor: colors.success, color: '#fff' }}
          >
            <Plus size={12} className="md:hidden" />
            <Plus size={18} className="md:block hidden" />
            Agregar
          </button>
        </div>
      </div>

      <StatsCards stats={stats} />

      <PendingInvoicesTable
        invoices={sort.sortedPendingInvoices}
        payments={payments}
        sortKey={sort.sortKey}
        sortDir={sort.sortDir}
        selectingMode={paymentsCtrl.selectingMode}
        selectedInvoiceIds={paymentsCtrl.selectedInvoiceIds}
        expandedDescId={expandedDescId}
        totalPending={totalPending}
        colors={colors}
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
      />

      {paymentsCtrl.selectingMode && (
        <SelectionBar
          count={paymentsCtrl.selectedInvoiceIds.length}
          totalAmount={paymentsCtrl.selectedInvoices.reduce(
            (s, i) => s + (i.totalMxn || i.total),
            0,
          )}
          colors={colors}
          onCancel={paymentsCtrl.cancelSelection}
          onContinue={paymentsCtrl.continueToPayment}
        />
      )}

      <PaidInvoicesTable
        paidInvoices={paidInvoices}
        payments={payments}
        colors={colors}
        onPreview={previewInvoice}
        onViewAttachment={setViewingAttachment}
        onEditPayment={paymentsCtrl.openEditPayment}
        onGenerateComplementsPDF={generateComplementsPDF}
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
        invoice={paymentsCtrl.editingPaymentInvoice}
        editData={paymentsCtrl.editPaymentData}
        onEditDataChange={paymentsCtrl.setEditPaymentData}
        onSave={paymentsCtrl.saveEditPayment}
        onClose={paymentsCtrl.closeEditPayment}
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
    </div>
  )
}
