import { useState } from 'react'
import { Trash2, ArrowUpDown } from 'lucide-react'
import { useInvoices } from '@/features/invoices/api'
import { useDeleteInvoice } from '@/features/invoices/api'
import ExpandableTextCell from '@/components/expandable-text-cell'
import ConfirmModal from '@/components/confirm-modal'
import { useDeleteConfirm } from '@/hooks/use-delete-confirm'
import { sortInvoices, type SortKey } from '@/lib/invoice-utils'
import { fmtDate } from '@/lib/utils'
import BackHeader from '@/components/back-header'

export default function Trips() {
  const { data: invoices = [] } = useInvoices()
  const deleteInvoice = useDeleteInvoice()
  const [expandedDescId, setExpandedDescId] = useState<string | null>(null)
  const [sortKey, setSortKey] = useState<SortKey>('date')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const del = useDeleteConfirm((id: string) => deleteInvoice.mutate(id))

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const sortedInvoices = sortInvoices(invoices, sortKey, sortDir)
  const totalInvoices = invoices.length
  const totalIncome = invoices.reduce((sum, i) => sum + (i.totalMxn || i.total), 0)

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ArrowUpDown size={12} className="ml-1 opacity-30 inline" />
    return <span className="ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>
  }

  return (
    <div className="p-4 md:p-6">
      <BackHeader />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Facturas</h1>
          <p className="text-sm text-muted">
            {totalInvoices} registros • $
            {totalIncome.toLocaleString('es-MX', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{' '}
            ingresos
          </p>
        </div>
      </div>

      <div className="rounded-xl shadow-sm overflow-hidden bg-card">
        <div className="overflow-x-auto [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent">
          <table className="w-full text-sm">
            <thead className="bg-background-secondary">
              <tr>
                <th
                  className="px-4 py-3 text-left cursor-pointer select-none hover:opacity-80 text-muted"
                  onClick={() => toggleSort('clientName')}
                >
                  Cliente <SortIcon col="clientName" />
                </th>
                <th
                  className="px-4 py-3 text-left cursor-pointer select-none hover:opacity-80 text-muted"
                  onClick={() => toggleSort('description')}
                >
                  Descripción <SortIcon col="description" />
                </th>
                <th
                  className="px-4 py-3 text-left cursor-pointer select-none hover:opacity-80 text-muted"
                  onClick={() => toggleSort('serieFolio')}
                >
                  Serie/Folio <SortIcon col="serieFolio" />
                </th>
                <th
                  className="px-4 py-3 text-left cursor-pointer select-none hover:opacity-80 text-muted"
                  onClick={() => toggleSort('date')}
                >
                  Fecha <SortIcon col="date" />
                </th>
                <th
                  className="px-4 py-3 text-center cursor-pointer select-none hover:opacity-80 text-muted"
                  onClick={() => toggleSort('status')}
                >
                  Estado <SortIcon col="status" />
                </th>
                <th
                  className="px-4 py-3 text-right cursor-pointer select-none hover:opacity-80 text-muted"
                  onClick={() => toggleSort('total')}
                >
                  Monto <SortIcon col="total" />
                </th>
                <th className="px-4 py-3 text-center text-muted">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sortedInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted">
                    No hay viajes/facturas registrados
                  </td>
                </tr>
              ) : (
                sortedInvoices.map((inv) => (
                  <tr key={inv.id} className="border-t border-border">
                    <td className="px-4 py-3 font-medium text-foreground">{inv.clientName}</td>
                    <td className="px-4 py-3 text-muted">
                      <ExpandableTextCell
                        text={inv.invoiceDescription || ''}
                        expanded={expandedDescId === inv.id}
                        onToggle={() =>
                          setExpandedDescId(expandedDescId === inv.id ? null : inv.id)
                        }
                      />
                    </td>
                    <td className="px-4 py-3 text-muted">{inv.serieFolio || '-'}</td>
                    <td className="px-4 py-3 text-muted">
                      {fmtDate(inv.tripDate || inv.certificationDate || inv.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          inv.status === 'pagado'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {inv.status === 'pagado' ? 'Pagado' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-success">
                      $
                      {(inv.totalMxn || inv.total).toLocaleString('es-MX', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => del.handleDelete(inv.id)}
                          className="p-1.5 rounded text-error"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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
