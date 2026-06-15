import { fmtAmount } from '@/lib/utils'

interface Props {
  count: number
  totalAmount: number
  onCancel: () => void
  onContinue: () => void
}

export default function SelectionBar({ count, totalAmount, onCancel, onContinue }: Props) {
  return (
    <div className="sticky bottom-0 z-40 -mx-4 md:-mx-6 px-4 md:px-6 py-3 border-t shadow-lg bg-card border-border">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        <p className="text-foreground">
          <span className="font-bold">{count}</span> factura(s) seleccionada(s) — Total:{' '}
          <span className="font-bold text-success">${fmtAmount(totalAmount)}</span>
        </p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 border rounded-lg text-sm border-border text-foreground hover:bg-card-hover"
          >
            Cancelar
          </button>
          <button
            onClick={onContinue}
            disabled={count === 0}
            className="px-4 py-2 rounded-lg text-sm text-white disabled:opacity-50 bg-success"
          >
            Continuar con el pago ({count})
          </button>
        </div>
      </div>
    </div>
  )
}
