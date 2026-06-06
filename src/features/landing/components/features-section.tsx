import { useTheme } from '@/lib/theme'
import { features } from '@/features/landing/data'

export function FeaturesSection() {
  const { colors } = useTheme()

  return (
    <section className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h2
          className="text-2xl md:text-3xl font-bold text-center mb-10"
          style={{ color: colors.text }}
        >
          ¿Por qué elegirnos?
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow"
              style={{ backgroundColor: colors.card, borderColor: colors.border }}
            >
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                style={{ backgroundColor: colors.accentMuted }}
              >
                <feature.icon style={{ color: colors.accent }} size={24} />
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: colors.text }}>
                {feature.title}
              </h3>
              <p className="text-sm" style={{ color: colors.textMuted }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
