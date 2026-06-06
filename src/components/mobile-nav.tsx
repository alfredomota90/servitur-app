import { Link, useLocation } from 'react-router-dom'
import { Home, Settings, Phone, Car } from 'lucide-react'
import { useTheme } from '@/lib/theme'

const navItems = [
  { path: '/', icon: Home, label: 'Inicio' },
  { path: '/servicios', icon: Car, label: 'Servicios' },
  { path: '/contacto', icon: Phone, label: 'Contacto' },
  { path: '/admin', icon: Settings, label: 'Admin' },
]

export default function MobileNav() {
  const location = useLocation()
  const { colors } = useTheme()
  const isAdmin = location.pathname.startsWith('/admin')
  if (isAdmin) return null

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 border-t z-50 md:hidden"
      style={{
        backgroundColor: colors.backgroundSecondary,
        borderColor: colors.border,
      }}
    >
      <div className="flex justify-around py-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors"
            style={{
              color: location.pathname === item.path ? colors.accent : colors.textMuted,
            }}
          >
            <item.icon size={20} />
            <span className="text-xs">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
