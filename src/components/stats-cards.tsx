interface Stat {
  label: string
  value: string | number
  textClass: string
}

export default function StatsCards({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {stats.map((stat, i) => (
        <div key={i} className="rounded-lg p-4 shadow-sm text-center bg-card min-w-0">
          <p className="text-xs text-muted truncate">{stat.label}</p>
          <p className={`text-xl font-bold truncate ${stat.textClass}`}>{stat.value}</p>
        </div>
      ))}
    </div>
  )
}
