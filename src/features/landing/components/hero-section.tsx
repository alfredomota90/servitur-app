import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useTheme } from '@/lib/theme'

export function HeroSection() {
  const { colors } = useTheme()

  return (
    <section
      className="relative"
      style={{
        background: `linear-gradient(135deg, ${colors.background} 0%, ${colors.card} 100%)`,
      }}
    >
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute top-10 left-10 w-32 h-32 rounded-full blur-3xl"
          style={{ backgroundColor: colors.accent }}
        />
        <div
          className="absolute bottom-10 right-10 w-40 h-40 rounded-full blur-3xl"
          style={{ backgroundColor: colors.accent }}
        />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-24">
        <div className="flex items-center gap-3 mb-6">
          <img
            src={`${import.meta.env.BASE_URL}serviturlogo.png`}
            alt="SERVITUR"
            className="h-12 w-auto"
          />
        </div>

        <h1
          className="text-3xl md:text-5xl font-bold mb-4 leading-tight"
          style={{ color: colors.text }}
        >
          Transporte de personas
          <br />
          <span style={{ color: colors.accent }}>confiable y profesional</span>
        </h1>

        <p className="text-lg md:text-xl mb-8 max-w-xl" style={{ color: colors.textMuted }}>
          Servicio de transporte para empresas, minas y turismo. Covers desde Durango hacia Puerto
          Vallarta y toda la región.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/contacto"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors"
            style={{ backgroundColor: colors.accent, color: colors.background }}
          >
            Solicitar cotización
            <ArrowRight size={20} />
          </Link>
          <Link
            to="/servicios"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors"
            style={{ backgroundColor: colors.accentMuted, color: colors.accent }}
          >
            Ver servicios
          </Link>
        </div>
      </div>
    </section>
  )
}
