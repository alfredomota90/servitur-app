import ServiturLogo from '@/components/servitur-logo'

export function PublicFooter() {
  return (
    <footer className="py-12 px-4 bg-background border-t border-border">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <ServiturLogo size="lg" />
        </div>
        <p className="text-sm mb-6 text-muted">
          Servicio de transporte de personas. Compromiso, seguridad y puntualidad en cada viaje.
        </p>
        <div className="text-xs pt-6 border-t border-border text-muted">
          &copy; 2026 SERVITUR. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  )
}
