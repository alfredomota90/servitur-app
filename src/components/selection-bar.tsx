import type { Colors } from '@/lib/theme'

interface Props {
  count: number
  totalAmount: number
  colors: Colors
  onCancel: () => void
  onContinue: () => void
}

export default function SelectionBar({ count, totalAmount, colors, onCancel, onContinue }: Props) {
  return (
    <div
      className="sticky bottom-0 z-40 -mx-4 md:-mx-6 px-4 md:px-6 py-3 border-t shadow-lg"
      style={{ backgroundColor: colors.card, borderColor: colors.border }}
    >
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        <p style={{ color: colors.text }}>
          <span className="font-bold">{count}</span> factura(s) seleccionada(s) — Total:{' '}
          <span className="font-bold" style={{ color: colors.success }}>
            ${totalAmount.toLocaleString()}
          </span>
        </p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={onContinue}
            disabled={count === 0}
            className="px-4 py-2 rounded-lg text-sm text-white disabled:opacity-50"
            style={{ backgroundColor: colors.success }}
          >
            Continuar con el pago ({count})
          </button>
        </div>
      </div>
    </div>
  )
}
