import { trustedCompanies } from '@/features/landing/data'

export function TrustedBySection() {
  return (
    <section className="py-12 px-4 bg-background-secondary">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center text-foreground">
          Empresas que confían en nosotros
        </h2>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
          {trustedCompanies.map((company) => (
            <a
              key={company.abbr}
              href={company.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:opacity-80 transition-opacity bg-card"
            >
              <div className="w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold bg-accent-muted text-accent-text">
                {company.abbr}
              </div>
              <span className="text-sm font-medium hidden sm:block text-foreground">
                {company.name}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
