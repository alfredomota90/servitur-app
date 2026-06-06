import { useTheme } from '@/lib/theme'
import type { Invoice } from '@/features/invoices/api'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
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
  const { colors } = useTheme()

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
        <div
          className="p-3 rounded-lg space-y-2"
          style={{ backgroundColor: colors.backgroundSecondary }}
        >
          <p className="text-sm font-medium" style={{ color: colors.text }}>
            Facturas ({invoices.length})
          </p>
          {invoices.map((inv) => (
            <div key={inv.id} className="flex items-center justify-between">
              <span style={{ color: colors.textMuted }}>{inv.serieFolio || inv.period || '—'}</span>
              <span className="font-medium" style={{ color: colors.text }}>
                ${(inv.totalMxn || inv.total).toLocaleString()}
              </span>
            </div>
          ))}
          <div
            className="border-t pt-2 flex items-center justify-between font-bold"
            style={{ borderColor: colors.border }}
          >
            <span style={{ color: colors.text }}>Total</span>
            <span style={{ color: colors.success }}>${totalAmount.toLocaleString()}</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
            Fecha de pago
          </label>
          <input
            type="date"
            value={paymentData.date}
            onChange={(e) =>
              onPaymentDataChange({
                ...paymentData,
                date: e.target.value,
              })
            }
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        <PaymentMethodSelector
          value={paymentData.method}
          onChange={(method) => onPaymentDataChange({ ...paymentData, method })}
        />

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
            Referencia
          </label>
          <input
            type="text"
            value={paymentData.reference}
            onChange={(e) =>
              onPaymentDataChange({
                ...paymentData,
                reference: e.target.value,
              })
            }
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="Número de transacción"
          />
        </div>

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
