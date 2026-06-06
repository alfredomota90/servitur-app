import { useTheme } from '@/lib/theme'
import { AlertTriangle } from 'lucide-react'

interface MainErrorFallbackProps {
  error?: Error
  resetErrorBoundary?: () => void
}

export function MainErrorFallback({ error, resetErrorBoundary }: MainErrorFallbackProps) {
  const { colors } = useTheme()

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: colors.background }}
    >
      <div className="text-center max-w-md">
        <AlertTriangle size={48} className="mx-auto mb-4" style={{ color: colors.error }} />
        <h1 className="text-xl font-bold mb-2" style={{ color: colors.text }}>
          Algo salió mal
        </h1>
        <p className="text-sm mb-4" style={{ color: colors.textMuted }}>
          {error?.message || 'Ha ocurrido un error inesperado. Intenta recargar la página.'}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-lg text-white text-sm font-medium"
            style={{ backgroundColor: colors.accent }}
          >
            Recargar página
          </button>
          {resetErrorBoundary && (
            <button
              onClick={resetErrorBoundary}
              className="px-4 py-2 rounded-lg text-sm font-medium border"
              style={{ borderColor: colors.border, color: colors.text }}
            >
              Reintentar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
