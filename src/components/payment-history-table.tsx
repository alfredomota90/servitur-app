import { Eye, Edit2, Download } from 'lucide-react'
import type { Payment } from '@/features/payments/api'
import type { Invoice } from '@/features/invoices/api'
import { getPaymentAttachmentUrl } from '@/lib/storage'

interface Props {
  payments: Payment[]
  invoices: Invoice[]
  onViewAttachment: (path: string) => void
  onEditPayment?: (payment: Payment) => void
  onGeneratePaymentHistoryPDF?: () => void
}

function fmtDate(iso?: string): string {
  if (!iso) return '-'
  const d = new Date(iso)
  return d.toLocaleDateString('es-MX')
}

function fmtAmount(n: number): string {
  return n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function PaymentHistoryTable({
  payments,
  invoices,
  onViewAttachment,
  onEditPayment,
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
    <div className="rounded-xl p-4 shadow-sm bg-card mt-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-foreground">Historial de Pagos</h2>
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
          <thead className="bg-background-secondary">
            <tr>
              <th className="px-4 py-3 text-left text-muted">Referencia</th>
              <th className="px-4 py-3 text-left text-muted">Fecha</th>
              <th className="px-4 py-3 text-left text-muted">Folios afectados</th>
              <th className="px-4 py-3 text-right text-muted">Monto</th>
              <th className="px-4 py-3 text-center text-muted">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paymentsWithInvoices.map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className="px-4 py-3 text-muted">{p.reference || '—'}</td>
                <td className="px-4 py-3 text-muted">
                  {fmtDate(p.affectedInvoices[0]?.paymentDate || p.createdAt)}
                </td>
                <td className="px-4 py-3 text-muted">
                  {p.affectedInvoices
                    .map((inv) => inv.serieFolio)
                    .filter(Boolean)
                    .join(', ') || '—'}
                </td>
                <td className="px-4 py-3 text-right font-medium text-success">
                  ${fmtAmount(p.amount)}
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    {onEditPayment && (
                      <button
                        onClick={() => onEditPayment(p)}
                        className="p-1.5 rounded text-accent"
                        title="Editar pago"
                      >
                        <Edit2 size={16} />
                      </button>
                    )}
                    {p.attachmentPath && (
                      <button
                        onClick={() => onViewAttachment(getPaymentAttachmentUrl(p.attachmentPath!))}
                        className="p-1.5 rounded text-accent"
                        title="Ver comprobante"
                      >
                        <Eye size={16} />
                      </button>
                    )}
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
