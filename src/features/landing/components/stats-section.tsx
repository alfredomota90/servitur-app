import { stats } from '@/features/landing/data'

export function StatsSection() {
  return (
    <section className="py-8 shadow-sm bg-background-secondary">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-3 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-accent">{stat.value}</div>
              <div className="text-xs md:text-sm text-muted">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
