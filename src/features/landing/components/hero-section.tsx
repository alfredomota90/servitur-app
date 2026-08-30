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
        <div className="flex flex-col md:flex-row items-center md:items-stretch gap-6 mb-8">
          <ServiturLogo size="lg" className="shrink-0 h-28 md:h-40 lg:h-48 w-auto object-contain" />
          <h1 className="text-5xl md:text-7xl font-bold leading-tight text-foreground text-center md:text-left">
            Transporte de personas
            <br />
            <span className="text-accent">confiable y profesional</span>
          </h1>
        </div>

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
