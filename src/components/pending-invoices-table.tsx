import { FileText, Wallet, Eye, Edit2, Trash2, CheckCircle, Clock } from 'lucide-react'
import type { Invoice } from '@/features/invoices/api'
import type { Colors } from '@/lib/theme'
import ExpandableTextCell from '@/components/expandable-text-cell'
import { getInvoiceDate } from '@/lib/invoice-utils'
import { getPaymentAttachmentUrl } from '@/lib/storage'

interface Props {
  invoices: Invoice[]
  payments: { id: string; method?: string; attachmentPath?: string }[]
  sortKey: string
  sortDir: 'asc' | 'desc'
  selectingMode: boolean
  selectedInvoiceIds: string[]
  expandedDescId: string | null
  totalPending: number
  colors: Colors
  onToggleSort: (key: 'date' | 'description' | 'total' | 'status' | 'serieFolio') => void
  onToggleSelect: (id: string) => void
  onSelectAll: () => void
  onPayment: (invoice: Invoice) => void
  onEdit: (invoice: Invoice) => void
  onPreview: (invoice: Invoice) => void
  onDelete: (id: string) => void
  onViewAttachment: (path: string) => void
  onEditPayment: (invoice: Invoice) => void
  onToggleExpandDesc: (id: string | null) => void
}

function SortIcon({
  col,
  sortKey,
  sortDir,
}: {
  col: string
  sortKey: string
  sortDir: 'asc' | 'desc'
}) {
  if (sortKey !== col) return <span className="ml-1 opacity-30">↕</span>
  return <span className="ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>
}

export default function PendingInvoicesTable({
  invoices,
  payments,
  sortKey,
  sortDir,
  selectingMode,
  selectedInvoiceIds,
  expandedDescId,
  totalPending,
  colors,
  onToggleSort,
  onToggleSelect,
  onSelectAll,
  onPayment,
  onEdit,
  onPreview,
  onDelete,
  onViewAttachment,
  onEditPayment,
  onToggleExpandDesc,
}: Props) {
  return (
    <div
      className="rounded-xl shadow-sm overflow-hidden mb-6"
      style={{ backgroundColor: colors.card }}
    >
      <div className="p-4 border-b" style={{ borderColor: colors.border }}>
        <h2 className="font-semibold flex items-center gap-2" style={{ color: colors.text }}>
          <FileText size={18} />
          Facturas pendientes ({invoices.length})
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead style={{ backgroundColor: colors.backgroundSecondary }}>
            <tr>
              {selectingMode && (
                <th className="px-4 py-3 text-center w-10" style={{ color: colors.textMuted }}>
                  <input
                    type="checkbox"
                    checked={
                      invoices.length > 0 &&
                      invoices.every((inv) => selectedInvoiceIds.includes(inv.id))
                    }
                    onChange={onSelectAll}
                  />
                </th>
              )}
              <th
                className="px-4 py-3 text-left cursor-pointer select-none hover:opacity-80"
                style={{ color: colors.textMuted }}
                onClick={() => onToggleSort('serieFolio')}
              >
                Serie/Folio <SortIcon col="serieFolio" sortKey={sortKey} sortDir={sortDir} />
              </th>
              <th
                className="px-4 py-3 text-left cursor-pointer select-none hover:opacity-80"
                style={{ color: colors.textMuted }}
                onClick={() => onToggleSort('description')}
              >
                Descripción <SortIcon col="description" sortKey={sortKey} sortDir={sortDir} />
              </th>
              <th
                className="px-4 py-3 text-left cursor-pointer select-none hover:opacity-80"
                style={{ color: colors.textMuted }}
                onClick={() => onToggleSort('date')}
              >
                Fecha <SortIcon col="date" sortKey={sortKey} sortDir={sortDir} />
              </th>
              <th
                className="px-4 py-3 text-center cursor-pointer select-none hover:opacity-80"
                style={{ color: colors.textMuted }}
                onClick={() => onToggleSort('status')}
              >
                Estado <SortIcon col="status" sortKey={sortKey} sortDir={sortDir} />
              </th>
              <th
                className="px-4 py-3 text-right cursor-pointer select-none hover:opacity-80"
                style={{ color: colors.textMuted }}
                onClick={() => onToggleSort('total')}
              >
                Monto <SortIcon col="total" sortKey={sortKey} sortDir={sortDir} />
              </th>
              <th className="px-4 py-3 text-center" style={{ color: colors.textMuted }}>
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr>
                <td
                  colSpan={selectingMode ? 7 : 6}
                  className="px-4 py-8 text-center"
                  style={{ color: colors.textMuted }}
                >
                  No hay facturas pendientes
                </td>
              </tr>
            ) : (
              invoices.map((inv) => (
                <tr key={inv.id} className="border-t" style={{ borderColor: colors.border }}>
                  {selectingMode && (
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedInvoiceIds.includes(inv.id)}
                        onChange={() => onToggleSelect(inv.id)}
                      />
                    </td>
                  )}
                  <td className="px-4 py-3 font-medium" style={{ color: colors.text }}>
                    {inv.serieFolio || '-'}
                  </td>
                  <td className="px-4 py-3" style={{ color: colors.textMuted }}>
                    <ExpandableTextCell
                      text={inv.invoiceDescription || inv.period || '-'}
                      color={colors.textMuted}
                      expanded={expandedDescId === inv.id}
                      onToggle={() => onToggleExpandDesc(expandedDescId === inv.id ? null : inv.id)}
                    />
                  </td>
                  <td className="px-4 py-3" style={{ color: colors.textMuted }}>
                    {getInvoiceDate(inv)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {inv.status === 'pagado' ? (
                      <span
                        className="inline-flex items-center gap-1"
                        style={{ color: colors.success }}
                      >
                        <CheckCircle size={14} />
                        Pagado
                      </span>
                    ) : (
                      <span
                        className="inline-flex items-center gap-1"
                        style={{ color: colors.warning }}
                      >
                        <Clock size={14} />
                        Pendiente
                      </span>
                    )}
                  </td>
                  <td
                    className="px-4 py-3 text-right font-medium"
                    style={{ color: colors.success }}
                  >
                    ${(inv.totalMxn || inv.total).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      {inv.status === 'pendiente' ? (
                        <button
                          onClick={() => onPayment(inv)}
                          className="p-1.5 rounded"
                          style={{ color: colors.success }}
                          title="Pagar"
                        >
                          <Wallet size={16} />
                        </button>
                      ) : (
                        (() => {
                          const linkedPayment = inv.paymentId
                            ? payments.find((p) => p.id === inv.paymentId)
                            : undefined
                          const attachPath =
                            inv.paymentAttachmentPath || linkedPayment?.attachmentPath
                          const payMethod = inv.paymentMethod || linkedPayment?.method
                          return (
                            <>
                              {attachPath ? (
                                <button
                                  onClick={() =>
                                    onViewAttachment(getPaymentAttachmentUrl(attachPath))
                                  }
                                  className="flex items-center gap-1 text-xs"
                                  style={{ color: colors.accent }}
                                >
                                  <Eye size={14} />
                                  Ver
                                </button>
                              ) : (
                                <span className="text-xs" style={{ color: colors.textMuted }}>
                                  {payMethod || '-'}
                                </span>
                              )}
                              <button
                                onClick={() => onEditPayment(inv)}
                                className="p-1 rounded text-xs"
                                style={{ color: colors.accent }}
                                title="Editar pago"
                              >
                                <Edit2 size={14} />
                              </button>
                            </>
                          )
                        })()
                      )}
                      <button
                        onClick={() => onEdit(inv)}
                        className="p-1.5 rounded"
                        style={{ color: colors.accent }}
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => onPreview(inv)}
                        className="p-1.5 rounded"
                        style={{ color: '#3b82f6' }}
                        title="Ver factura"
                      >
                        <FileText size={16} />
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
                      <button
                        onClick={() => onDelete(inv.id)}
                        className="p-1.5 rounded"
                        style={{ color: colors.error }}
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot style={{ backgroundColor: colors.backgroundSecondary }}>
            <tr>
              <td
                colSpan={selectingMode ? 5 : 4}
                className="px-4 py-3 font-semibold text-right"
                style={{ color: colors.text }}
              >
                TOTAL
              </td>
              <td className="px-4 py-3 text-right font-bold" style={{ color: colors.success }}>
                ${totalPending.toLocaleString()}
              </td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
