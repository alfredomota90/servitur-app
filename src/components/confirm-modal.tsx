import { AlertTriangle } from 'lucide-react'

interface ConfirmModalProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  danger?: boolean
}

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
  danger = true,
}: ConfirmModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="rounded-xl max-w-md w-full p-6 bg-card">
        <div className="flex items-center gap-4 mb-4">
          <div className={`p-3 rounded-full ${danger ? 'bg-error/10' : 'bg-accent-muted'}`}>
            <AlertTriangle size={24} className={danger ? 'text-error' : 'text-warning'} />
          </div>
          <h2 className="text-lg font-bold text-foreground">{title}</h2>
        </div>

        <p className="mb-6 text-muted">{message}</p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 rounded-lg border transition-colors text-foreground border-border"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors text-background ${
              danger ? 'bg-error' : 'bg-accent'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
