import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import AttachmentField from '@/components/attachment-field'
import PaymentMethodSelector from '@/components/payment-method-selector'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import type { Invoice } from '@/features/invoices/api'
import { fmtAmount } from '@/lib/utils'

const paymentMethodEnum = z.enum(['transferencia', 'efectivo', 'cheque'])

const paymentSchema = z.object({
  method: paymentMethodEnum,
  reference: z.string(),
  attachment: z.string(),
  attachmentName: z.string(),
  date: z.string().min(1, 'La fecha es requerida'),
})

export type PaymentFormValues = z.infer<typeof paymentSchema>

export const defaultPaymentValues: PaymentFormValues = {
  method: 'transferencia',
  reference: '',
  attachment: '',
  attachmentName: '',
  date: new Date().toISOString().split('T')[0],
}

interface PaymentModalProps {
  open: boolean
  invoices: Invoice[]
  defaultValues?: PaymentFormValues
  onConfirm: (data: PaymentFormValues) => void
  onAddMore: () => void
  onClose: () => void
}

export default function PaymentModal({
  open,
  invoices,
  defaultValues: externalDefaults,
  onConfirm,
  onAddMore,
  onClose,
}: PaymentModalProps) {
  const totalAmount = invoices.reduce((sum, inv) => sum + (inv.totalMxn || inv.total), 0)

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: externalDefaults || defaultPaymentValues,
  })

  useEffect(() => {
    if (open && externalDefaults) {
      form.reset(externalDefaults)
    }
  }, [open, externalDefaults, form])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        form.setValue('attachment', reader.result as string)
        form.setValue('attachmentName', file.name)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <Modal open={open} title="Registrar pago" onClose={onClose}>
      <Form form={form} onSubmit={onConfirm}>
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
            onChange={handleFileChange}
            onClear={() => {
              form.setValue('attachment', '')
              form.setValue('attachmentName', '')
            }}
          />

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onAddMore}>
              + Agregar más facturas
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              Confirmar pago
            </Button>
          </div>
        </div>
      </Form>
    </Modal>
  )
}
