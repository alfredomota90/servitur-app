import type { Invoice } from '@/features/invoices/api'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import PaymentMethodSelector from '@/components/payment-method-selector'
import AttachmentField from '@/components/attachment-field'

interface EditPaymentModalProps {
  open: boolean
  invoice: Invoice | null
  editData: {
    method: Invoice['paymentMethod']
    reference: string
    attachment: string
    attachmentName: string
    date: string
  }
  onEditDataChange: (data: EditPaymentModalProps['editData']) => void
  onSave: () => void
  onClose: () => void
}

export default function EditPaymentModal({
  open,
  invoice,
  editData,
  onEditDataChange,
  onSave,
  onClose,
}: EditPaymentModalProps) {
  return (
    <Modal open={open} title="Editar pago" onClose={onClose}>
      <div className="p-4 space-y-4">
        <div className="p-3 rounded-lg bg-background-secondary">
          <p className="text-sm text-muted">Factura</p>
          <p className="font-medium text-foreground">
            {invoice?.serieFolio || invoice?.period || '—'}
          </p>
          <p className="text-2xl font-bold text-success">
            ${(invoice?.totalMxn || invoice?.total || 0).toLocaleString()}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-foreground">Fecha de pago</label>
          <input
            type="date"
            value={editData.date}
            onChange={(e) => onEditDataChange({ ...editData, date: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg bg-background text-foreground border-border"
          />
        </div>

        <PaymentMethodSelector
          value={editData.method}
          onChange={(method) => onEditDataChange({ ...editData, method })}
        />

        <div>
          <label className="block text-sm font-medium mb-1 text-foreground">Referencia</label>
          <input
            type="text"
            value={editData.reference}
            onChange={(e) =>
              onEditDataChange({
                ...editData,
                reference: e.target.value,
              })
            }
            className="w-full px-3 py-2 border rounded-lg bg-background text-foreground border-border"
            placeholder="Número de transacción"
          />
        </div>

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
          onClear={() =>
            onEditDataChange({
              ...editData,
              attachment: '',
              attachmentName: '',
            })
          }
        />

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
  )
}
