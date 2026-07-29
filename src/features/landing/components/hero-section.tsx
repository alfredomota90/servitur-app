import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import ServiturLogo from '@/components/servitur-logo'
import { Button } from '@/components/ui/button'

export function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-background to-card">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full blur-3xl bg-accent" />
        <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full blur-3xl bg-accent" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-24">
        <div className="flex items-center gap-3 mb-6">
          <ServiturLogo size="lg" />
        </div>

        <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight text-foreground">
          Transporte de personas
          <br />
          <span className="text-accent">confiable y profesional</span>
        </h1>

        <p className="text-lg md:text-xl mb-8 max-w-xl text-muted">
          Servicio de transporte para empresas, minas y turismo. Covers desde Durango hacia Puerto
          Vallarta y toda la región.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild>
            <Link to="/contacto">
              Solicitar cotización
              <ArrowRight size={20} />
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/servicios">Ver servicios</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
