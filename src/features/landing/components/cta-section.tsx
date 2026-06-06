import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useTheme } from '@/lib/theme'

export function CtaSection() {
  const { colors } = useTheme()

  return (
    <section className="py-12 px-4">
      <div
        className="max-w-4xl mx-auto rounded-2xl p-8 text-center"
        style={{ backgroundColor: colors.background }}
      >
        <h2 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: colors.text }}>
          ¿Necesitas transporte para tu empresa?
        </h2>
        <p className="mb-6" style={{ color: colors.textMuted }}>
          Contáctanos y te Cotizamos sin compromiso. Tenemos planes adaptados a tus necesidades.
        </p>
        <Link
          to="/contacto"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-semibold transition-colors"
          style={{ backgroundColor: colors.accent, color: colors.background }}
        >
          Contactar ahora
          <ArrowRight size={20} />
        </Link>
      </div>
    </section>
  )
}
