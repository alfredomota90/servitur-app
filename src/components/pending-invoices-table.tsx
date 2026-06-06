import { FileText, Wallet, Eye, Edit2, Trash2, CheckCircle, Clock } from 'lucide-react'
import type { Invoice } from '@/features/invoices/api'
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
    <div className="rounded-xl shadow-sm overflow-hidden mb-6 bg-card">
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold flex items-center gap-2 text-foreground">
          <FileText size={18} />
          Facturas pendientes ({invoices.length})
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-background-secondary">
            <tr>
              {selectingMode && (
                <th className="px-4 py-3 text-center w-10 text-muted">
                  <input
                    type="checkbox"
                    className="accent-accent"
                    checked={
                      invoices.length > 0 &&
                      invoices.every((inv) => selectedInvoiceIds.includes(inv.id))
                    }
                    onChange={onSelectAll}
                  />
                </th>
              )}
              <th
                className="px-4 py-3 text-left cursor-pointer select-none hover:opacity-80 text-muted"
                onClick={() => onToggleSort('serieFolio')}
              >
                Serie/Folio <SortIcon col="serieFolio" sortKey={sortKey} sortDir={sortDir} />
              </th>
              <th
                className="px-4 py-3 text-left cursor-pointer select-none hover:opacity-80 text-muted"
                onClick={() => onToggleSort('description')}
              >
                Descripción <SortIcon col="description" sortKey={sortKey} sortDir={sortDir} />
              </th>
              <th
                className="px-4 py-3 text-left cursor-pointer select-none hover:opacity-80 text-muted"
                onClick={() => onToggleSort('date')}
              >
                Fecha <SortIcon col="date" sortKey={sortKey} sortDir={sortDir} />
              </th>
              <th
                className="px-4 py-3 text-center cursor-pointer select-none hover:opacity-80 text-muted"
                onClick={() => onToggleSort('status')}
              >
                Estado <SortIcon col="status" sortKey={sortKey} sortDir={sortDir} />
              </th>
              <th
                className="px-4 py-3 text-right cursor-pointer select-none hover:opacity-80 text-muted"
                onClick={() => onToggleSort('total')}
              >
                Monto <SortIcon col="total" sortKey={sortKey} sortDir={sortDir} />
              </th>
              <th className="px-4 py-3 text-center text-muted">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={selectingMode ? 7 : 6} className="px-4 py-8 text-center text-muted">
                  No hay facturas pendientes
                </td>
              </tr>
            ) : (
              invoices.map((inv) => (
                <tr key={inv.id} className="border-t border-border">
                  {selectingMode && (
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        className="accent-accent"
                        checked={selectedInvoiceIds.includes(inv.id)}
                        onChange={() => onToggleSelect(inv.id)}
                      />
                    </td>
                  )}
                  <td className="px-4 py-3 font-medium text-foreground">{inv.serieFolio || '-'}</td>
                  <td className="px-4 py-3 text-muted">
                    <ExpandableTextCell
                      text={inv.invoiceDescription || inv.period || '-'}
                      expanded={expandedDescId === inv.id}
                      onToggle={() => onToggleExpandDesc(expandedDescId === inv.id ? null : inv.id)}
                    />
                  </td>
                  <td className="px-4 py-3 text-muted">{getInvoiceDate(inv)}</td>
                  <td className="px-4 py-3 text-center">
                    {inv.status === 'pagado' ? (
                      <span className="inline-flex items-center gap-1 text-success">
                        <CheckCircle size={14} />
                        Pagado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-warning">
                        <Clock size={14} />
                        Pendiente
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-success">
                    ${(inv.totalMxn || inv.total).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      {inv.status === 'pendiente' ? (
                        <button
                          onClick={() => onPayment(inv)}
                          className="p-1.5 rounded text-success"
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
                                  className="flex items-center gap-1 text-xs text-accent-text"
                                >
                                  <Eye size={14} />
                                  Ver
                                </button>
                              ) : (
                                <span className="text-xs text-muted">{payMethod || '-'}</span>
                              )}
                              <button
                                onClick={() => onEditPayment(inv)}
                                className="p-1 rounded text-xs text-accent-text"
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
                        className="p-1.5 rounded text-accent-text"
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => onPreview(inv)}
                        className="p-1.5 rounded text-accent-text"
                        title="Ver factura"
                      >
                        <FileText size={16} />
                      </button>
                      {inv.xmlPath && (
                        <span className="text-[10px] px-1 py-0.5 rounded font-bold bg-success/15 text-success">
                          XML
                        </span>
                      )}
                      <button
                        onClick={() => onDelete(inv.id)}
                        className="p-1.5 rounded text-error"
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
          <tfoot className="bg-background-secondary">
            <tr>
              <td
                colSpan={selectingMode ? 5 : 4}
                className="px-4 py-3 font-semibold text-right text-foreground"
              >
                TOTAL
              </td>
              <td className="px-4 py-3 text-right font-bold text-success">
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
