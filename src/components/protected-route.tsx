import { Navigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { useTheme } from '@/lib/theme'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const { colors } = useTheme()

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: colors.background }}
      >
        <div className="text-center">
          <div
            className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{
              borderColor: colors.accent,
              borderTopColor: 'transparent',
            }}
          />
          <p style={{ color: colors.textMuted }}>Cargando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
