import { Link } from 'react-router-dom'
import { Bus, MapPin, ChevronRight } from 'lucide-react'

export function ServicesPreview() {
  return (
    <section className="py-12 px-4 bg-background-secondary">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">Nuestros servicios</h2>
          <Link
            to="/servicios"
            className="text-sm font-medium flex items-center gap-1 text-accent-text"
          >
            Ver todos <ChevronRight size={16} />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-xl overflow-hidden shadow-sm bg-card">
            <div className="h-32 flex items-center justify-center bg-gradient-to-br from-accent to-accent-hover">
              <Bus size={48} className="opacity-80 text-background" />
            </div>
            <div className="p-5">
              <h3 className="text-lg font-semibold mb-2 text-foreground">Transporte a Minas</h3>
              <p className="text-sm mb-4 text-muted">
                Servicio regular de transporte de personal a minas. Viajes periódicos cada 10 días.
              </p>
              <span className="text-xs px-2 py-1 rounded bg-accent-muted text-accent-text">
                Durango y alrededores
              </span>
            </div>
          </div>

          <div className="rounded-xl overflow-hidden shadow-sm bg-card">
            <div className="h-32 flex items-center justify-center bg-gradient-to-br from-muted to-border">
              <MapPin size={48} className="opacity-80 text-background" />
            </div>
            <div className="p-5">
              <h3 className="text-lg font-semibold mb-2 text-foreground">Turismo & Viajes</h3>
              <p className="text-sm mb-4 text-muted">
                Viajes a Puerto Vallarta y destinos turísticos. Units equipadas para grupos grandes.
              </p>
              <span className="text-xs px-2 py-1 rounded bg-accent-muted text-accent-text">
                Rutas turísticas
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
