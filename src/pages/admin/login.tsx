import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { useTheme } from '@/lib/theme'
import { LogIn, AlertCircle } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const { colors } = useTheme()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await signIn(email, password)

    if (error) {
      setError('Email o contraseña incorrectos')
      setLoading(false)
    } else {
      navigate('/admin')
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: colors.background }}
    >
      <div
        className="w-full max-w-md"
        style={{
          backgroundColor: colors.card,
          borderRadius: '1rem',
          padding: '2rem',
          border: `1px solid ${colors.border}`,
        }}
      >
        <div className="text-center mb-8">
          <img
            src={`${import.meta.env.BASE_URL}serviturlogo.png`}
            alt="SERVITUR"
            className="h-12 w-auto mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold" style={{ color: colors.text }}>
            Iniciar Sesión
          </h1>
          <p style={{ color: colors.textMuted }}>Accede al panel de administración</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border"
              style={{
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.text,
              }}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border"
              style={{
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.text,
              }}
              required
            />
          </div>

          {error && (
            <div
              className="mb-4 flex items-center gap-2 p-3 rounded-lg"
              style={{ backgroundColor: 'rgba(248, 113, 113, 0.1)', color: colors.error }}
            >
              <AlertCircle size={18} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-colors"
            style={{ backgroundColor: colors.accent, color: colors.background }}
          >
            {loading ? (
              'Cargando...'
            ) : (
              <>
                <LogIn size={20} />
                Iniciar Sesión
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm" style={{ color: colors.textMuted }}>
          Solo usuarios autorizados
        </p>
      </div>
    </div>
  )
}
