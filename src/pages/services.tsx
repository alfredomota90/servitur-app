import { Link } from 'react-router-dom'
import { Bus, MapPin, Users, ArrowLeft, Building2 } from 'lucide-react'

export default function Services() {
  const services = [
    {
      id: 'mina',
      title: 'Transporte a Minas',
      subtitle: 'Servicio periódico de personal',
      icon: Building2,
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
      <header className="shadow-sm sticky top-0 z-40 bg-background-secondary border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link to="/" className="flex items-center gap-2 font-medium transition-colors text-muted">
            <ArrowLeft size={20} />
            <span>Volver</span>
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Nuestros Servicios</h1>
        <p className="mb-10 max-w-2xl text-muted">
          Ofrecemos soluciones de transporte adaptadas a las necesidades de tu empresa o negocio.
        </p>

        <div className="space-y-8">
          {services.map((service) => (
            <div
              key={service.id}
              className="rounded-2xl overflow-hidden shadow-sm bg-card border border-border"
            >
              <div className="h-24 flex items-center justify-center bg-gradient-to-br from-accent to-accent-hover">
                <service.icon size={48} className="opacity-80 text-background" />
              </div>

              <div className="p-6">
                <div className="mb-4">
                  <h2 className="text-2xl font-bold mb-1 text-foreground">{service.title}</h2>
                  <p className="text-muted">{service.subtitle}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2 text-foreground">
                      <Bus size={18} className="text-accent" />
                      Incluye
                    </h3>
                    <ul className="space-y-2">
                      {service.features.map((f, i) => (
                        <li key={i} className="text-sm flex items-start gap-2 text-muted">
                          <span className="text-success">✓</span>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2 text-foreground">
                      <MapPin size={18} className="text-accent" />
                      Rutas principales
                    </h3>
                    <ul className="space-y-2">
                      {service.routes.map((r, i) => (
                        <li key={i} className="text-sm flex items-start gap-2 text-muted">
                          <span className="text-accent">•</span>
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="text-sm">
                    <span className="text-muted">Precio: </span>
                    <span className="font-medium text-foreground">{service.pricing}</span>
                  </div>
                  <Link
                    to="/contacto"
                    className="px-6 py-2 rounded-lg font-medium transition-colors bg-accent-text text-background"
                  >
                    Solicitar cotización
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-xl p-6 border bg-card border-border">
          <h3 className="font-bold mb-4 text-foreground">¿Tienes necesidades específicas?</h3>
          <p className="mb-4 text-muted">
            Contáctanos y diseñamos un plan de transporte personalizado para tu empresa.
          </p>
          <Link to="/contacto" className="font-medium hover:underline text-accent-text">
            Hablemos de tu proyecto →
          </Link>
        </div>
      </div>
    </div>
  )
}
