import { useTheme } from '@/lib/theme'
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
  const { colors } = useTheme()

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="rounded-xl max-w-md w-full p-6" style={{ backgroundColor: colors.card }}>
        <div className="flex items-center gap-4 mb-4">
          <div
            className="p-3 rounded-full"
            style={{
              backgroundColor: danger ? 'rgba(248, 113, 113, 0.1)' : 'rgba(197, 157, 92, 0.1)',
            }}
          >
            <AlertTriangle size={24} style={{ color: danger ? colors.error : colors.warning }} />
          </div>
          <h2 className="text-lg font-bold" style={{ color: colors.text }}>
            {title}
          </h2>
        </div>

        <p className="mb-6" style={{ color: colors.textMuted }}>
          {message}
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 rounded-lg border transition-colors"
            style={{ borderColor: colors.border, color: colors.text }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: danger ? colors.error : colors.accent,
              color: '#fff',
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
