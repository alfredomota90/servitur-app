import { Link, useLocation } from 'react-router-dom'
import { Home, Settings, Phone, Car } from 'lucide-react'

const PUBLIC_SIDEBAR_WIDTH = 220
const navItems = [
  { path: '/', icon: Home, label: 'Inicio' },
  { path: '/servicios', icon: Car, label: 'Servicios' },
  { path: '/contacto', icon: Phone, label: 'Contacto' },
  { path: '/admin', icon: Settings, label: 'Admin' },
]

export default function PublicSidebar() {
  const location = useLocation()

  return (
    <aside
      className="hidden md:flex fixed left-0 top-0 h-full z-40 flex-col border-r bg-card border-border"
      style={{ width: PUBLIC_SIDEBAR_WIDTH }}
    >
      <div className="flex items-center justify-center py-6 border-b border-border">
        <Link to="/" className="flex items-center gap-2">
          <img
            src={`${import.meta.env.BASE_URL}serviturlogo.png`}
            alt="SERVITUR"
            className="h-11 w-11 rounded-full object-cover"
          />
          <img
            src={`${import.meta.env.BASE_URL}serviture_letter.svg`}
            alt="SERVITUR"
            className="h-6"
          />
        </Link>
      </div>
      <nav className="flex-1 py-6 px-3 space-y-1">
        {navItems.map((item) => {
          const active =
            item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path)
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                active ? 'bg-accent-muted text-accent-text' : ''
              }`}
            >
              <item.icon size={20} />
              <span className={`text-sm font-medium ${!active ? 'text-muted' : ''}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>
      <div className="py-4 px-3">
        <a
          href="tel:+525512345678"
          className="flex items-center justify-center gap-2 w-full py-2 rounded-lg text-sm bg-accent text-white"
        >
          <Phone size={16} />
          Contáctanos
        </a>
      </div>
    </aside>
  )
}
