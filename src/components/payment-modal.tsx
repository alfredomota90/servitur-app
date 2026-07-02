import type { Invoice } from '@/features/invoices/api'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { fmtAmount } from '@/lib/utils'
import PaymentMethodSelector from '@/components/payment-method-selector'
import AttachmentField from '@/components/attachment-field'

interface PaymentModalProps {
  open: boolean
  invoices: Invoice[]
  paymentData: {
    method: Invoice['paymentMethod']
    reference: string
    notes: string
    attachment: string
    attachmentName: string
    date: string
  }
  onPaymentDataChange: (data: PaymentModalProps['paymentData']) => void
  onConfirm: () => void
  onAddMore: () => void
  onClose: () => void
}

export default function PaymentModal({
  open,
  invoices,
  paymentData,
  onPaymentDataChange,
  onConfirm,
  onAddMore,
  onClose,
}: PaymentModalProps) {
  const totalAmount = invoices.reduce((sum, inv) => sum + (inv.totalMxn || inv.total), 0)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        onPaymentDataChange({
          ...paymentData,
          attachment: reader.result as string,
          attachmentName: file.name,
        })
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <Modal open={open} title="Registrar pago" onClose={onClose}>
      <div className="p-4 space-y-4">
        <div className="p-3 rounded-lg space-y-2 bg-background-secondary">
          <p className="text-sm font-medium text-foreground">Facturas ({invoices.length})</p>
          {invoices.map((inv) => (
            <div key={inv.id} className="flex items-center justify-between">
              <span className="text-muted">{inv.serieFolio || '—'}</span>
              <span className="font-medium text-foreground">
                ${fmtAmount(inv.totalMxn || inv.total)}
              </span>
            </div>
          ))}
          <div className="border-t border-border pt-2 flex items-center justify-between font-bold">
            <span className="text-foreground">Total</span>
            <span className="text-success">${fmtAmount(totalAmount)}</span>
          </div>
        </div>

        <Input
          label="Fecha de pago"
          type="date"
          value={paymentData.date}
          onChange={(e) =>
            onPaymentDataChange({
              ...paymentData,
              date: (e as React.ChangeEvent<HTMLInputElement>).target.value,
            })
          }
        />

        <PaymentMethodSelector
          value={paymentData.method}
          onChange={(method) => onPaymentDataChange({ ...paymentData, method })}
        />

        <Input
          label="Referencia"
          type="text"
          value={paymentData.reference}
          onChange={(e) =>
            onPaymentDataChange({
              ...paymentData,
              reference: (e as React.ChangeEvent<HTMLInputElement>).target.value,
            })
          }
          placeholder="Número de transacción"
        />

        <AttachmentField
          value={paymentData.attachment}
          fileName={paymentData.attachmentName}
          onChange={handleFileChange}
          onClear={() =>
            onPaymentDataChange({
              ...paymentData,
              attachment: '',
              attachmentName: '',
            })
          }
        />

        <div className="flex gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onAddMore}>
            + Agregar más facturas
          </Button>
          <Button type="button" variant="primary" className="flex-1" onClick={onConfirm}>
            Confirmar pago
          </Button>
        </div>
      </div>
    </Modal>
  )
}
