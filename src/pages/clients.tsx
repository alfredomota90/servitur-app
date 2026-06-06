import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Users, Star, CheckCircle, Building2 } from 'lucide-react'
import { useTheme } from '@/lib/theme'

function ExpandableText({ text, accent, muted }: { text: string; accent: string; muted: string }) {
  const [expanded, setExpanded] = useState(false)
  const maxLen = 100
  const truncated = text.length > maxLen ? text.slice(0, maxLen) + '...' : text

  return (
    <div className="mb-4">
      <p className="text-sm leading-relaxed" style={{ color: muted }}>
        {expanded ? text : truncated}
      </p>
      {text.length > maxLen && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs mt-1 font-medium"
          style={{ color: accent }}
        >
          {expanded ? 'Ver menos' : 'Ver más'}
        </button>
      )}
    </div>
  )
}

export default function Clients() {
  const { colors } = useTheme()

  const clients = [
    {
      id: 1,
      name: 'Minera La Cantera',
      type: 'Mina / Minería',
      since: '2020',
      description:
        'Servicio de transporte de personal operativo a la mina. Viajes periódicos cada 10 días.',
      services: ['Transporte de personal', 'Viajes Durango - Mina', 'Servicio recurrente'],
      status: 'activo',
    },
    {
      id: 2,
      name: 'Cominvi',
      type: 'Mina / Minería',
      since: '2022',
      description:
        'Servicio de transporte de personal operativo a la mina. Viajes periódicos cada 10 días.',
      services: ['Transporte de personal', 'Viajes a obra', 'Servicio eventual'],
      status: 'activo',
    },
    {
      id: 3,
      name: 'Conade',
      type: 'Dependencia de gobierno',
      since: '2020',
      description:
        'Servicio de transporte equipos de deportistas para eventos deportivos en la republica mexicana',
      services: ['Transporte de deportistas', 'Viajes Durango - Vallarta', 'Movilidad local'],
      status: 'esporádico',
    },
  ]

  const testimonies = [
    {
      client: 'Mina Las Cuatas',
      text: 'Excelente servicio, siempre puntuales y las unidades en perfectas condiciones. Totalmente recomendados.',
      rating: 5,
    },
    {
      client: 'Hotel Paradise Vallarta',
      text: 'Hemos trabajado con SERVITUR en varios viajes y siempre han sido profesionales y confiables.',
      rating: 5,
    },
  ]

  return (
    <div className="pb-20 md:pb-0 min-h-screen">
      <header
        className="shadow-sm sticky top-0 z-40"
        style={{
          backgroundColor: colors.backgroundSecondary,
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link
            to="/"
            className="flex items-center gap-2 font-medium transition-colors"
            style={{ color: colors.textMuted }}
          >
            <ArrowLeft size={20} />
            <span>Volver</span>
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1
          className="text-2xl md:text-4xl font-bold mb-4 leading-tight"
          style={{ color: colors.text }}
        >
          Clientes &amp; Colaboraciones
        </h1>
        <p className="mb-10 max-w-2xl text-sm md:text-base" style={{ color: colors.textMuted }}>
          Empresas que confían en nuestro servicio de transporte.
        </p>

        <div className="mb-12">
          <h2
            className="text-xl font-bold mb-6 flex items-center gap-2"
            style={{ color: colors.text }}
          >
            <Users size={24} style={{ color: colors.accent }} />
            Clientes Actuales
          </h2>

          <div className="grid md:grid-cols-3 gap-4 md:gap-6">
            {clients.map((client) => (
              <div
                key={client.id}
                className="rounded-xl p-4 md:p-6 shadow-sm border min-w-0 break-words"
                style={{ backgroundColor: colors.card, borderColor: colors.border }}
              >
                <div className="flex items-start justify-between mb-4 min-w-0">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: colors.accentMuted }}
                  >
                    <Building2 style={{ color: colors.accent }} size={24} />
                  </div>
                  <span
                    className="text-xs px-2 py-1 rounded-full flex-shrink-0 ml-2"
                    style={{
                      backgroundColor:
                        client.status === 'activo'
                          ? 'rgba(74, 222, 128, 0.15)'
                          : 'rgba(251, 191, 36, 0.15)',
                      color: client.status === 'activo' ? colors.success : colors.warning,
                    }}
                  >
                    {client.status === 'activo' ? 'Activo' : 'Esporádico'}
                  </span>
                </div>

                <h3
                  className="font-bold text-base md:text-lg mb-1 break-words"
                  style={{ color: colors.text }}
                >
                  {client.name}
                </h3>
                <p className="text-sm mb-3 break-words" style={{ color: colors.textMuted }}>
                  {client.type}
                </p>

                <ExpandableText
                  text={client.description}
                  accent={colors.accent}
                  muted={colors.textMuted}
                />

                <div className="border-t pt-4">
                  <p className="text-xs mb-2" style={{ color: colors.textMuted }}>
                    Servicios:
                  </p>
                  <div className="flex flex-wrap gap-1 min-w-0">
                    {client.services.map((s, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-1 rounded break-words"
                        style={{
                          backgroundColor: colors.backgroundSecondary,
                          color: colors.textMuted,
                        }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t flex items-center justify-between">
                  <span className="text-xs" style={{ color: colors.textMuted }}>
                    Cliente desde {client.since}
                  </span>
                  <CheckCircle style={{ color: colors.success }} size={20} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-12">
          <h2
            className="text-xl font-bold mb-6 flex items-center gap-2"
            style={{ color: colors.text }}
          >
            <Star size={24} style={{ color: colors.accent }} />
            Testimonios
          </h2>

          <div className="grid md:grid-cols-2 gap-4 md:gap-6">
            {testimonies.map((t, i) => (
              <div
                key={i}
                className="rounded-xl p-4 md:p-6 shadow-sm border"
                style={{ backgroundColor: colors.card, borderColor: colors.border }}
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} size={18} style={{ color: colors.accent, fill: colors.accent }} />
                  ))}
                </div>
                <p className="italic mb-4 text-sm md:text-base" style={{ color: colors.textMuted }}>
                  "{t.text}"
                </p>
                <p className="font-medium" style={{ color: colors.text }}>
                  — {t.client}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div
          className="rounded-2xl p-6 md:p-8 text-center"
          style={{ backgroundColor: colors.background }}
        >
          <h3 className="text-lg md:text-xl font-bold mb-4" style={{ color: colors.text }}>
            ¿Quieres trabajar con nosotros?
          </h3>
          <p className="mb-6 text-sm md:text-base" style={{ color: colors.textMuted }}>
            Contáctanos y te cotizamos un plan adapté a las necesidades de tu empresa.
          </p>
          <Link
            to="/contacto"
            className="inline-block px-6 md:px-8 py-3 rounded-lg font-semibold transition-colors text-sm md:text-base"
            style={{ backgroundColor: colors.accent, color: colors.background }}
          >
            Contactar ahora
          </Link>
        </div>
      </div>
    </div>
  )
}
