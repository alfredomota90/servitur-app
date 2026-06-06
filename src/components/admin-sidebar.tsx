import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Home, Users, Car, X, LogOut } from 'lucide-react'
import { useTheme } from '@/lib/theme'
import { useAuth } from '@/lib/auth'

const SIDEBAR_WIDTH = 260

export default function AdminSidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const location = useLocation()
  const { colors } = useTheme()
  const { signOut, user } = useAuth()
  const navigate = useNavigate()

  const navItems = [
    { path: '/admin', icon: Home, label: 'Dashboard', exact: true },
    { path: '/admin/viajes', icon: Car, label: 'Viajes/Facturas' },
    { path: '/admin/clientes', icon: Users, label: 'Clientes' },
  ]

  const isActive = (item: (typeof navItems)[0]) => {
    if (item.exact) return location.pathname === item.path
    return location.pathname.startsWith(item.path)
  }

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  const closeMobile = () => {
    if (window.innerWidth < 768) {
      onClose()
    }
  }

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={onClose} />}
      <aside
        className={`fixed top-0 left-0 h-full z-50 flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
        style={{
          width: SIDEBAR_WIDTH,
          backgroundColor: colors.adminBg,
          color: colors.adminText,
          borderRight: `1px solid ${colors.border}`,
        }}
      >
        <div
          className="flex items-center justify-between px-4 py-5 border-b"
          style={{ borderColor: colors.border }}
        >
          <Link to="/admin" className="flex items-center gap-2" onClick={closeMobile}>
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
          <button
            onClick={onClose}
            className="p-1 rounded md:hidden"
            style={{ color: colors.textMuted }}
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={closeMobile}
              className="flex items-center gap-3 px-5 py-3 transition-colors"
              style={{
                backgroundColor: isActive(item) ? colors.accent + '20' : 'transparent',
                borderLeft: isActive(item) ? `3px solid ${colors.accent}` : '3px solid transparent',
                color: isActive(item) ? colors.accent : colors.adminText,
              }}
            >
              <item.icon size={20} />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="border-t py-4" style={{ borderColor: colors.border }}>
          {user && (
            <button
              onClick={() => {
                handleLogout()
                closeMobile()
              }}
              className="flex items-center gap-3 w-full px-5 py-3 transition-colors"
              style={{ color: colors.error }}
            >
              <LogOut size={20} />
              <span className="text-sm font-medium">Cerrar sesión</span>
            </button>
          )}
          <Link
            to="/"
            onClick={closeMobile}
            className="flex items-center gap-3 w-full px-5 py-3 transition-colors"
            style={{ color: colors.textMuted }}
          >
            <Home size={20} />
            <span className="text-sm font-medium">Ver sitio</span>
          </Link>
        </div>
      </aside>
    </>
  )
}
