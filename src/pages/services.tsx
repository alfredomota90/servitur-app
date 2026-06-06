import { Link } from 'react-router-dom'
import { Bus, MapPin, Users, ArrowLeft, Building2 } from 'lucide-react'
import { useTheme } from '@/lib/theme'

export default function Services() {
  const { colors } = useTheme()

  const services = [
    {
      id: 'mina',
      title: 'Transporte a Minas',
      subtitle: 'Servicio periódico de personal',
      icon: Building2,
      color: 'from-amber-500 to-amber-700',
      features: [
        'Viajes regulares cada 10 días',
        'Transporte de personal operativo',
        'Unidades de capacidad media y grande',
        'Puntualidad garantizada',
      ],
      routes: ['Durango - Bacis', 'Durango - Los Gatos', 'Rutas personalizadas según mina'],
      pricing: 'Cotización por contrato mensual',
    },
    {
      id: 'turismo',
      title: 'Viajes Turísticos',
      subtitle: 'Durango - Puerto Vallarta y más',
      icon: MapPin,
      color: 'from-blue-500 to-blue-700',
      features: [
        'Viajes esporádicos y tours',
        'Unidades para grupos grandes',
        'Servicio de chofer incluido',
        'Rutas personalizadas',
      ],
      routes: ['Durango - Puerto Vallarta', 'Durango - Mazatlán', 'Viajes a cualquier destino'],
      pricing: 'Según distancia y tipo de unidad',
    },
    {
      id: 'empresas',
      title: 'Transporte Corporativo',
      subtitle: 'Para empresas y eventos',
      icon: Users,
      color: 'from-green-500 to-green-700',
      features: [
        'Eventos empresariales',
        'Transporte de personal diario',
        'Viajes de capacitación',
        'Servicio de ruta',
      ],
      routes: ['Rutas dentro ciudad', 'Viajes foráneos', 'Servicio recurrente'],
      pricing: 'Contratos mensuales o por evento',
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
        <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: colors.text }}>
          Nuestros Servicios
        </h1>
        <p className="mb-10 max-w-2xl" style={{ color: colors.textMuted }}>
          Ofrecemos soluciones de transporte adaptadas a las necesidades de tu empresa o negocio.
        </p>

        <div className="space-y-8">
          {services.map((service) => (
            <div
              key={service.id}
              className="rounded-2xl overflow-hidden shadow-sm"
              style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}` }}
            >
              <div
                className="h-24 flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentHover} 100%)`,
                }}
              >
                <service.icon size={48} style={{ opacity: 0.8, color: colors.background }} />
              </div>

              <div className="p-6">
                <div className="mb-4">
                  <h2 className="text-2xl font-bold mb-1" style={{ color: colors.text }}>
                    {service.title}
                  </h2>
                  <p style={{ color: colors.textMuted }}>{service.subtitle}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3
                      className="font-semibold mb-3 flex items-center gap-2"
                      style={{ color: colors.text }}
                    >
                      <Bus size={18} style={{ color: colors.accent }} />
                      Incluye
                    </h3>
                    <ul className="space-y-2">
                      {service.features.map((f, i) => (
                        <li
                          key={i}
                          className="text-sm flex items-start gap-2"
                          style={{ color: colors.textMuted }}
                        >
                          <span style={{ color: colors.success }}>✓</span>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3
                      className="font-semibold mb-3 flex items-center gap-2"
                      style={{ color: colors.text }}
                    >
                      <MapPin size={18} style={{ color: colors.accent }} />
                      Rutas principales
                    </h3>
                    <ul className="space-y-2">
                      {service.routes.map((r, i) => (
                        <li
                          key={i}
                          className="text-sm flex items-start gap-2"
                          style={{ color: colors.textMuted }}
                        >
                          <span style={{ color: colors.accent }}>•</span>
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div
                  className="mt-6 pt-4 border-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  style={{ borderColor: colors.border }}
                >
                  <div className="text-sm">
                    <span style={{ color: colors.textMuted }}>Precio: </span>
                    <span className="font-medium" style={{ color: colors.text }}>
                      {service.pricing}
                    </span>
                  </div>
                  <Link
                    to="/contacto"
                    className="px-6 py-2 rounded-lg font-medium transition-colors"
                    style={{ backgroundColor: colors.accent, color: colors.background }}
                  >
                    Solicitar cotización
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div
          className="mt-12 rounded-xl p-6 border"
          style={{ backgroundColor: colors.card, borderColor: colors.border }}
        >
          <h3 className="font-bold mb-4" style={{ color: colors.text }}>
            ¿Tienes necesidades específicas?
          </h3>
          <p className="mb-4" style={{ color: colors.textMuted }}>
            Contáctanos y diseñamos un plan de transporte personalizado para tu empresa.
          </p>
          <Link
            to="/contacto"
            className="font-medium hover:underline"
            style={{ color: colors.accent }}
          >
            Hablemos de tu proyecto →
          </Link>
        </div>
      </div>
    </div>
  )
}
