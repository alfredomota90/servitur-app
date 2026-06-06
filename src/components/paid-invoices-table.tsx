import { Download, FileText, Eye, Edit2 } from 'lucide-react'
import type { Invoice } from '@/features/invoices/api'
import type { Colors } from '@/lib/theme'
import { getPaymentAttachmentUrl } from '@/lib/storage'

interface Props {
  paidInvoices: Invoice[]
  payments: { id: string; method?: string; attachmentPath?: string }[]
  colors: Colors
  onPreview: (invoice: Invoice) => void
  onViewAttachment: (path: string) => void
  onEditPayment: (invoice: Invoice) => void
  onGenerateComplementsPDF: () => void
}

export default function PaidInvoicesTable({
  paidInvoices,
  payments,
  colors,
  onPreview,
  onViewAttachment,
  onEditPayment,
  onGenerateComplementsPDF,
}: Props) {
  if (paidInvoices.length === 0) return null

  return (
    <div className="rounded-xl p-4 shadow-sm" style={{ backgroundColor: colors.card }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold" style={{ color: colors.text }}>
          Historial de pagos
        </h2>
        <button
          onClick={onGenerateComplementsPDF}
          disabled={paidInvoices.length === 0}
          className="flex items-center gap-2 bg-[#0d1c2f] text-white px-4 py-2 rounded-lg hover:bg-[#0a1525] disabled:bg-gray-300 transition-colors text-sm"
        >
          <Download size={16} />
          Complementos pendientes
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead style={{ backgroundColor: colors.backgroundSecondary }}>
            <tr>
              <th className="px-4 py-3 text-left" style={{ color: colors.textMuted }}>
                Serie/Folio
              </th>
              <th className="px-4 py-3 text-left" style={{ color: colors.textMuted }}>
                Fecha pago
              </th>
              <th className="px-4 py-3 text-right" style={{ color: colors.textMuted }}>
                Monto
              </th>
              <th className="px-4 py-3 text-center" style={{ color: colors.textMuted }}>
                Método
              </th>
              <th className="px-4 py-3 text-center" style={{ color: colors.textMuted }}>
                Acciones
              </th>
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
                <tr key={inv.id} className="border-t" style={{ borderColor: colors.border }}>
                  <td className="px-4 py-3" style={{ color: colors.text }}>
                    {inv.serieFolio || '-'}
                  </td>
                  <td className="px-4 py-3" style={{ color: colors.textMuted }}>
                    {inv.paymentDate || '-'}
                  </td>
                  <td
                    className="px-4 py-3 text-right font-medium"
                    style={{ color: colors.success }}
                  >
                    ${(inv.totalMxn || inv.total).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-center" style={{ color: colors.textMuted }}>
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
                        className="p-1.5 rounded"
                        style={{ color: '#3b82f6' }}
                        title="Ver factura"
                      >
                        <FileText size={14} />
                      </button>
                      {inv.xmlPath && (
                        <span
                          className="text-[10px] px-1 py-0.5 rounded font-bold"
                          style={{
                            backgroundColor: '#d1fae5',
                            color: '#065f46',
                          }}
                        >
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
                            className="flex items-center gap-1 text-xs"
                            style={{ color: colors.accent }}
                          >
                            <Eye size={14} /> Ver
                          </button>
                        ) : null
                      })()}
                      <button
                        onClick={() => onEditPayment(inv)}
                        className="p-1.5 rounded"
                        style={{ color: colors.accent }}
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
