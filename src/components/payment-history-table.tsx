import { Eye, Edit2, Download, FileText, Trash2 } from 'lucide-react'
import type { Payment } from '@/features/payments/api'
import type { Invoice } from '@/features/invoices/api'
import { getPaymentAttachmentUrl } from '@/lib/storage'
import { fmtAmount, fmtDate } from '@/lib/utils'

interface Props {
  payments: Payment[]
  invoices: Invoice[]
  onViewAttachment: (path: string) => void
  onEditPayment?: (payment: Payment) => void
  onDelete: (id: string) => void
  onGeneratePaymentHistoryPDF?: () => void
}

export default function PaymentHistoryTable({
  payments,
  invoices,
  onViewAttachment,
  onEditPayment,
  onDelete,
  onGeneratePaymentHistoryPDF,
}: Props) {
  const paymentsWithInvoices = payments
    .map((p) => ({
      ...p,
      affectedInvoices: invoices.filter((inv) => inv.paymentId === p.id),
    }))
    .filter((p) => p.affectedInvoices.length > 0)
    .sort((a, b) => {
      const dateA = a.affectedInvoices[0]?.paymentDate || a.createdAt || ''
      const dateB = b.affectedInvoices[0]?.paymentDate || b.createdAt || ''
      return dateB > dateA ? 1 : -1
    })

  if (paymentsWithInvoices.length === 0) return null

  return (
    <div className="rounded-xl shadow-sm overflow-hidden mb-6 bg-card">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="font-semibold flex items-center gap-2 text-foreground">
          <FileText size={18} />
          Historial de Pagos ({paymentsWithInvoices.length})
        </h2>
        <button
          onClick={onGeneratePaymentHistoryPDF}
          disabled={payments.length === 0}
          className="flex items-center gap-2 bg-accent text-background px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 transition-colors text-sm"
        >
          <Download size={16} />
          Historial de pagos
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <colgroup>
            <col />
            <col />
            <col />
            <col className="w-28" />
            <col className="w-44" />
          </colgroup>
          <thead className="bg-background-secondary">
            <tr>
              <th className="px-4 py-3 text-left text-muted">Referencia</th>
              <th className="sticky left-0 px-4 py-3 text-left cursor-pointer select-none hover:opacity-80 text-muted">
                Fecha
              </th>
              <th className="sticky left-0 px-4 py-3 text-left cursor-pointer select-none hover:opacity-80 text-muted">
                Folios afectados
              </th>
              <th className="px-4 py-3 text-right text-muted">Monto</th>
              <th className="sticky left-0 px-4 py-3 text-left cursor-pointer select-none hover:opacity-80 text-muted">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {paymentsWithInvoices.map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className="px-4 py-3 text-muted">{p.reference || '—'}</td>
                <td className="sticky left-0 px-4 py-3 text-left cursor-pointer select-none hover:opacity-80 text-muted">
                  {fmtDate(p.affectedInvoices[0]?.paymentDate || p.createdAt)}
                </td>
                <td className="sticky left-0 px-4 py-3 text-left cursor-pointer select-none hover:opacity-80 text-muted">
                  {p.affectedInvoices
                    .map((inv) => inv.serieFolio)
                    .filter(Boolean)
                    .join(', ') || '—'}
                </td>
                <td className="px-4 py-3 text-right font-medium text-success">
                  ${fmtAmount(p.amount)}
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1">
                    {onEditPayment && (
                      <button
                        onClick={() => onEditPayment(p)}
                        className="p-1.5 rounded text-accent-text"
                        title="Editar pago"
                      >
                        <Edit2 size={14} />
                      </button>
                    )}
                    {p.attachmentPath && (
                      <button
                        onClick={() => onViewAttachment(getPaymentAttachmentUrl(p.attachmentPath!))}
                        className="p-1.5 rounded text-accent-text"
                        title="Ver comprobante"
                      >
                        <Eye size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(p.id)}
                      className="p-1.5 rounded text-error"
                      title="Eliminar pago"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-background-secondary">
            <tr>
              <td colSpan={3} className="px-4 py-3 font-semibold text-right text-foreground">
                TOTAL
              </td>
              <td className="px-4 py-3 text-right font-bold text-success">
                ${fmtAmount(paymentsWithInvoices.reduce((s, p) => s + p.amount, 0))}
              </td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
