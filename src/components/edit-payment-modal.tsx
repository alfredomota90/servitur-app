import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus } from 'lucide-react'
import type { Invoice } from '@/features/invoices/api'
import type { Payment } from '@/features/payments/api'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Form } from '@/components/ui/form'
import { fmtAmount } from '@/lib/utils'
import PaymentMethodSelector from '@/components/payment-method-selector'
import AttachmentField from '@/components/attachment-field'
import ConfirmModal from '@/components/confirm-modal'

const editPaymentSchema = z.object({
  method: z.enum(['transferencia', 'efectivo', 'cheque']),
  reference: z.string(),
  attachment: z.string(),
  attachmentName: z.string(),
  date: z.string(),
})

export type EditPaymentFormValues = z.infer<typeof editPaymentSchema>

export const defaultEditPaymentValues: EditPaymentFormValues = {
  method: 'transferencia',
  reference: '',
  attachment: '',
  attachmentName: '',
  date: '',
}

interface EditPaymentModalProps {
  open: boolean
  payment?: Payment | null
  invoice: Invoice | null
  linkedInvoices: Invoice[]
  availableInvoices: Invoice[]
  defaultValues?: EditPaymentFormValues
  onConfirm: (data: EditPaymentFormValues) => void
  onAddInvoice: (id: string) => void
  onRemoveInvoice: (id: string) => void
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
  defaultValues: externalDefaults,
  onConfirm,
  onAddInvoice,
  onRemoveInvoice,
  onClose,
  showDeletePaymentConfirm,
  onConfirmDeletePayment,
  onCancelDeletePayment,
}: EditPaymentModalProps) {
  const [selectedAvailableId, setSelectedAvailableId] = useState('')
  const isGroupMode = !!payment

  const form = useForm<EditPaymentFormValues>({
    resolver: zodResolver(editPaymentSchema),
    defaultValues: externalDefaults || defaultEditPaymentValues,
  })

  useEffect(() => {
    if (open && externalDefaults) {
      form.reset(externalDefaults)
      setSelectedAvailableId('')
    }
  }, [open, externalDefaults, form])

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
        <Form form={form} onSubmit={onConfirm}>
          <div className="p-4 space-y-4">
            {isGroupMode && payment ? (
              <div className="p-3 rounded-lg bg-background-secondary">
                <p className="text-sm text-muted">
                  {payment.reference
                    ? `Referencia: ${payment.reference}`
                    : `${linkedInvoices.length} factura(s) vinculada(s)`}
                </p>
                <p className="text-2xl font-bold text-success">${fmtAmount(totalAmount)}</p>
                <p className="text-xs text-muted">
                  {linkedInvoices.length} factura(s) vinculada(s)
                </p>
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
              error={form.formState.errors.date?.message}
              {...form.register('date')}
            />

            <PaymentMethodSelector
              value={form.watch('method')}
              onChange={(method) => form.setValue('method', method || 'transferencia')}
            />

            <Input
              label="Referencia"
              type="text"
              placeholder="Número de transacción"
              {...form.register('reference')}
            />

            <AttachmentField
              value={form.watch('attachment')}
              fileName={form.watch('attachmentName')}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  const reader = new FileReader()
                  reader.onloadend = () => {
                    form.setValue('attachment', reader.result as string)
                    form.setValue('attachmentName', file.name)
                  }
                  reader.readAsDataURL(file)
                }
              }}
              onClear={() => {
                form.setValue('attachment', '')
                form.setValue('attachmentName', '')
              }}
            />

            {isGroupMode && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">
                    Facturas vinculadas
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent">
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
              <Button type="submit" variant="primary" className="flex-1">
                Guardar cambios
              </Button>
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancelar
              </Button>
            </div>
          </div>
        </Form>
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
