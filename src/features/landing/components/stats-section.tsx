import { useTheme } from '@/lib/theme'
import { stats } from '@/features/landing/data'

export function StatsSection() {
  const { colors } = useTheme()

  return (
    <section className="py-8 shadow-sm" style={{ backgroundColor: colors.backgroundSecondary }}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-3 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl md:text-3xl font-bold" style={{ color: colors.accent }}>
                {stat.value}
              </div>
              <div className="text-xs md:text-sm" style={{ color: colors.textMuted }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
