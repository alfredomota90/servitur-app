import { Download, FileText, Eye, Edit2 } from 'lucide-react'
import type { Invoice } from '@/features/invoices/api'
import { getPaymentAttachmentUrl } from '@/lib/storage'
import { fmtDate } from '@/lib/utils'

interface Props {
  paidInvoices: Invoice[]
  payments: { id: string; method?: string; attachmentPath?: string }[]
  onPreview: (invoice: Invoice) => void
  onViewAttachment: (path: string) => void
  onEditPayment: (invoice: Invoice) => void
  onGenerateComplementsPDF: () => void
}

export default function PaidInvoicesTable({
  paidInvoices,
  payments,
  onPreview,
  onViewAttachment,
  onEditPayment,
  onGenerateComplementsPDF,
}: Props) {
  if (paidInvoices.length === 0) return null

  return (
    <div className="rounded-xl p-4 shadow-sm bg-card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-foreground">Historial de pagos</h2>
        <button
          onClick={onGenerateComplementsPDF}
          disabled={paidInvoices.length === 0}
          className="flex items-center gap-2 bg-admin-bg text-admin-foreground px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 transition-colors text-sm"
        >
          <Download size={16} />
          Complementos pendientes
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-background-secondary">
            <tr>
              <th className="px-4 py-3 text-left text-muted">Serie/Folio</th>
              <th className="px-4 py-3 text-left text-muted">Fecha pago</th>
              <th className="px-4 py-3 text-right text-muted">Monto</th>
              <th className="px-4 py-3 text-center text-muted">Método</th>
              <th className="px-4 py-3 text-center text-muted">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {[...paidInvoices]
              .sort((a, b) => {
                const dateA = a.paymentDate || a.createdAt || ''
                const dateB = b.paymentDate || b.createdAt || ''
                return dateB.localeCompare(dateA)
              })
              .map((inv) => (
                <tr key={inv.id} className="border-t border-border">
                  <td className="px-4 py-3 text-foreground">{inv.serieFolio || '-'}</td>
                  <td className="px-4 py-3 text-muted">{fmtDate(inv.paymentDate)}</td>
                  <td className="px-4 py-3 text-right font-medium text-success">
                    ${(inv.totalMxn || inv.total).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-center text-muted">
                    {inv.paymentMethod ||
                      (inv.paymentId
                        ? payments.find((p) => p.id === inv.paymentId)?.method
                        : undefined) ||
                      '-'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => onPreview(inv)}
                        className="p-1.5 rounded text-accent-text"
                        title="Ver factura"
                      >
                        <FileText size={14} />
                      </button>
                      {inv.xmlPath && (
                        <span className="text-[10px] px-1 py-0.5 rounded font-bold bg-success/15 text-success">
                          XML
                        </span>
                      )}
                      {(() => {
                        const linkedPayment = inv.paymentId
                          ? payments.find((p) => p.id === inv.paymentId)
                          : undefined
                        const attachPath =
                          inv.paymentAttachmentPath || linkedPayment?.attachmentPath
                        return attachPath ? (
                          <button
                            onClick={() => onViewAttachment(getPaymentAttachmentUrl(attachPath))}
                            className="flex items-center gap-1 text-xs text-accent-text"
                          >
                            <Eye size={14} /> Ver
                          </button>
                        ) : null
                      })()}
                      <button
                        onClick={() => onEditPayment(inv)}
                        className="p-1.5 rounded text-accent-text"
                        title="Editar pago"
                      >
                        <Edit2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
