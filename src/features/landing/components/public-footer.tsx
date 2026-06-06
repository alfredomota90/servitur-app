import { useTheme } from '@/lib/theme'

export function PublicFooter() {
  const { colors } = useTheme()

  return (
    <footer
      className="py-12 px-4"
      style={{ backgroundColor: colors.background, borderTop: `1px solid ${colors.border}` }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <img
            src={`${import.meta.env.BASE_URL}serviturlogo.png`}
            alt="SERVITUR"
            className="h-8 w-auto"
          />
        </div>
        <p className="text-sm mb-6" style={{ color: colors.textMuted }}>
          Servicio de transporte de personas. Compromiso, seguridad y puntualidad en cada viaje.
        </p>
        <div
          className="text-xs pt-6"
          style={{ borderTop: `1px solid ${colors.border}`, color: colors.textMuted }}
        >
          &copy; 2026 SERVITUR. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  )
}
