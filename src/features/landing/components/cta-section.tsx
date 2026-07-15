import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
        <Button asChild size="lg">
          <Link to="/contacto">
            Contactar ahora
            <ArrowRight size={20} />
          </Link>
        </Button>
      </div>
    </section>
  )
}
