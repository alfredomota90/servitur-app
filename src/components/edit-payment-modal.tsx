import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { Invoice } from '@/features/invoices/api'
import type { Payment } from '@/features/payments/api'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { fmtAmount } from '@/lib/utils'
import PaymentMethodSelector from '@/components/payment-method-selector'
import AttachmentField from '@/components/attachment-field'
import ConfirmModal from '@/components/confirm-modal'

interface EditPaymentModalProps {
  open: boolean
  payment?: Payment | null
  invoice: Invoice | null
  linkedInvoices: Invoice[]
  availableInvoices: Invoice[]
  editData: {
    method: Invoice['paymentMethod']
    reference: string
    attachment: string
    attachmentName: string
    date: string
  }
  onEditDataChange: (data: EditPaymentModalProps['editData']) => void
  onAddInvoice: (id: string) => void
  onRemoveInvoice: (id: string) => void
  onSave: () => void
  onClose: () => void
  showDeletePaymentConfirm: boolean
  onConfirmDeletePayment: () => void
  onCancelDeletePayment: () => void
}

export default function EditPaymentModal({
  open,
  payment,
  invoice,
  linkedInvoices = [],
  availableInvoices = [],
  editData,
  onEditDataChange,
  onAddInvoice,
  onRemoveInvoice,
  onSave,
  onClose,
  showDeletePaymentConfirm,
  onConfirmDeletePayment,
  onCancelDeletePayment,
}: EditPaymentModalProps) {
  const [selectedAvailableId, setSelectedAvailableId] = useState('')
  const isGroupMode = !!payment

  const handleAddAvailable = () => {
    if (selectedAvailableId) {
      onAddInvoice(selectedAvailableId)
      setSelectedAvailableId('')
    }
  }

  const totalAmount = linkedInvoices.reduce((sum, i) => sum + (i.totalMxn || i.total), 0)

  return (
    <>
      <Modal open={open} title="Editar pago" onClose={onClose}>
        <div className="p-4 space-y-4">
          {isGroupMode && payment ? (
            <div className="p-3 rounded-lg bg-background-secondary">
              <p className="text-sm text-muted">
                {payment.reference
                  ? `Referencia: ${payment.reference}`
                  : `${linkedInvoices.length} factura(s) vinculada(s)`}
              </p>
              <p className="text-2xl font-bold text-success">${fmtAmount(totalAmount)}</p>
              <p className="text-xs text-muted">{linkedInvoices.length} factura(s) vinculada(s)</p>
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-background-secondary">
              <p className="text-sm text-muted">Factura</p>
              <p className="font-medium text-foreground">{invoice?.serieFolio || '—'}</p>
              <p className="text-2xl font-bold text-success">
                ${fmtAmount(invoice?.totalMxn || invoice?.total || 0)}
              </p>
            </div>
          )}

          <Input
            label="Fecha de pago"
            type="date"
            value={editData.date}
            onChange={(e) =>
              onEditDataChange({
                ...editData,
                date: (e as React.ChangeEvent<HTMLInputElement>).target.value,
              })
            }
          />

          <PaymentMethodSelector
            value={editData.method}
            onChange={(method) => onEditDataChange({ ...editData, method })}
          />

          <Input
            label="Referencia"
            type="text"
            value={editData.reference}
            onChange={(e) =>
              onEditDataChange({
                ...editData,
                reference: (e as React.ChangeEvent<HTMLInputElement>).target.value,
              })
            }
            placeholder="Número de transacción"
          />

          <AttachmentField
            value={editData.attachment}
            fileName={editData.attachmentName}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                const reader = new FileReader()
                reader.onloadend = () => {
                  onEditDataChange({
                    ...editData,
                    attachment: reader.result as string,
                    attachmentName: file.name,
                  })
                }
                reader.readAsDataURL(file)
              }
            }}
            onClear={() => onEditDataChange({ ...editData, attachment: '', attachmentName: '' })}
          />

          {isGroupMode && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">
                  Facturas vinculadas
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {linkedInvoices.map((inv) => (
                    <div
                      key={inv.id}
                      className="flex items-center justify-between p-2 rounded bg-background-secondary"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {inv.serieFolio || '—'}
                        </p>
                        <p className="text-xs text-muted">
                          ${fmtAmount(inv.totalMxn || inv.total)}
                        </p>
                      </div>
                      <button
                        onClick={() => onRemoveInvoice(inv.id)}
                        className="p-1 rounded text-error hover:bg-error/10"
                        title="Desvincular"
                        type="button"
                      >
                        <Plus size={14} className="rotate-45" />
                      </button>
                    </div>
                  ))}
                  {linkedInvoices.length === 0 && (
                    <p className="text-sm text-muted py-2">Ninguna factura vinculada</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">
                  Agregar factura
                </label>
                <div className="flex gap-2">
                  <Select
                    value={selectedAvailableId}
                    onChange={(e) => setSelectedAvailableId(e.target.value)}
                    placeholder="Seleccionar factura..."
                    className="flex-1"
                  >
                    {availableInvoices.map((inv) => (
                      <option key={inv.id} value={inv.id}>
                        {inv.serieFolio || '—'} — ${fmtAmount(inv.totalMxn || inv.total)}
                      </option>
                    ))}
                  </Select>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleAddAvailable}
                    disabled={!selectedAvailableId}
                  >
                    <Plus size={16} />
                  </Button>
                </div>
              </div>
            </>
          )}

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="primary" className="flex-1" onClick={onSave}>
              Guardar cambios
            </Button>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={showDeletePaymentConfirm}
        title="Pago sin facturas"
        message="Este pago se quedó sin facturas vinculadas. ¿Eliminar registro de pago?"
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onConfirm={onConfirmDeletePayment}
        onCancel={onCancelDeletePayment}
        danger={true}
      />
    </>
  )
}
