import { Link } from 'react-router-dom'
import { Bus, MapPin, ChevronRight } from 'lucide-react'
import { useTheme } from '@/lib/theme'

export function ServicesPreview() {
  const { colors } = useTheme()

  return (
    <section className="py-12 px-4" style={{ backgroundColor: colors.backgroundSecondary }}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold" style={{ color: colors.text }}>
            Nuestros servicios
          </h2>
          <Link
            to="/servicios"
            className="text-sm font-medium flex items-center gap-1"
            style={{ color: colors.accent }}
          >
            Ver todos <ChevronRight size={16} />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div
            className="rounded-xl overflow-hidden shadow-sm"
            style={{ backgroundColor: colors.card }}
          >
            <div
              className="h-32 flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentHover} 100%)`,
              }}
            >
              <Bus size={48} style={{ opacity: 0.8, color: colors.background }} />
            </div>
            <div className="p-5">
              <h3 className="text-lg font-semibold mb-2" style={{ color: colors.text }}>
                Transporte a Minas
              </h3>
              <p className="text-sm mb-4" style={{ color: colors.textMuted }}>
                Servicio regular de transporte de personal a minas. Viajes periódicos cada 10 días.
              </p>
              <span
                className="text-xs px-2 py-1 rounded"
                style={{ backgroundColor: colors.accentMuted, color: colors.accent }}
              >
                Durango y alrededores
              </span>
            </div>
          </div>

          <div
            className="rounded-xl overflow-hidden shadow-sm"
            style={{ backgroundColor: colors.card }}
          >
            <div
              className="h-32 flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${colors.textMuted} 0%, ${colors.border} 100%)`,
              }}
            >
              <MapPin size={48} style={{ opacity: 0.8, color: colors.background }} />
            </div>
            <div className="p-5">
              <h3 className="text-lg font-semibold mb-2" style={{ color: colors.text }}>
                Turismo & Viajes
              </h3>
              <p className="text-sm mb-4" style={{ color: colors.textMuted }}>
                Viajes a Puerto Vallarta y destinos turísticos. Units equipadas para grupos grandes.
              </p>
              <span
                className="text-xs px-2 py-1 rounded"
                style={{ backgroundColor: colors.accentMuted, color: colors.accent }}
              >
                Rutas turísticas
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
