import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export function CtaSection() {
  return (
    <section className="py-12 px-4">
      <div className="max-w-4xl mx-auto rounded-2xl p-8 text-center bg-background">
        <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">
          ¿Necesitas transporte para tu empresa?
        </h2>
        <p className="mb-6 text-muted">
          Contáctanos y te Cotizamos sin compromiso. Tenemos planes adaptados a tus necesidades.
        </p>
        <Link
          to="/contacto"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-semibold transition-colors bg-accent-text text-background"
        >
          Contactar ahora
          <ArrowRight size={20} />
        </Link>
      </div>
    </section>
  )
}
