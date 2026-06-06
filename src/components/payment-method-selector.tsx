import type { Invoice } from '@/features/invoices/api'

interface PaymentMethodSelectorProps {
  value: Invoice['paymentMethod']
  onChange: (method: Invoice['paymentMethod']) => void
}

const METHODS: Invoice['paymentMethod'][] = ['transferencia', 'efectivo', 'cheque']

export default function PaymentMethodSelector({ value, onChange }: PaymentMethodSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1 text-foreground">Método</label>
      <div className="grid grid-cols-3 gap-2">
        {METHODS.map((method) => (
          <button
            key={method}
            type="button"
            onClick={() => onChange(method)}
            className={`p-2 rounded-lg border text-sm capitalize transition-colors ${
              value === method
                ? 'border-success bg-success/10 text-success'
                : 'border-border bg-card text-foreground hover:bg-card-hover'
            }`}
          >
            {method}
          </button>
        ))}
      </div>
    </div>
  )
}
