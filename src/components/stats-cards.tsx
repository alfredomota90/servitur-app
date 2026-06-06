import { useTheme } from '@/lib/theme'

interface Stat {
  label: string
  value: string | number
  color: string
}

export default function StatsCards({ stats }: { stats: Stat[] }) {
  const { colors } = useTheme()

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {stats.map((stat, i) => (
        <div
          key={i}
          className="rounded-lg p-4 shadow-sm text-center"
          style={{ backgroundColor: colors.card }}
        >
          <p className="text-xs" style={{ color: colors.textMuted }}>
            {stat.label}
          </p>
          <p className="text-xl font-bold" style={{ color: stat.color }}>
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  )
}
