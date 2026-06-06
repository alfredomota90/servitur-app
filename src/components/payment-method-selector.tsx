import { useTheme } from '@/lib/theme'
import type { Invoice } from '@/features/invoices/api'

interface PaymentMethodSelectorProps {
  value: Invoice['paymentMethod']
  onChange: (method: Invoice['paymentMethod']) => void
}

const METHODS: Invoice['paymentMethod'][] = ['transferencia', 'efectivo', 'cheque']

export default function PaymentMethodSelector({ value, onChange }: PaymentMethodSelectorProps) {
  const { colors } = useTheme()

  return (
    <div>
      <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
        Método
      </label>
      <div className="grid grid-cols-3 gap-2">
        {METHODS.map((method) => (
          <button
            key={method}
            type="button"
            onClick={() => onChange(method)}
            className={`p-2 rounded-lg border text-sm capitalize ${
              value === method
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            {method}
          </button>
        ))}
      </div>
    </div>
  )
}
