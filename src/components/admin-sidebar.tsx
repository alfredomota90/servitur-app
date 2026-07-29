import { Car, Home, LogOut, Users, X } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import ServiturLetter from '@/components/servitur-letter'
import ServiturLogo from '@/components/servitur-logo'
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
  const { signOut, user } = useAuth()
  const navigate = useNavigate()

  const navItems = [
    { path: '/admin', icon: Home, label: 'Dashboard', exact: true },
    { path: '/admin/viajes', icon: Car, label: 'Facturas' },
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
        className={`fixed top-0 left-0 h-full z-50 flex flex-col transition-transform duration-300 bg-admin-bg text-admin-foreground border-r border-border ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
        style={{ width: SIDEBAR_WIDTH }}
      >
        <div className="flex items-center justify-between px-2 py-1 border-b border-border">
          <Link to="/admin" className="flex items-center gap-2" onClick={closeMobile}>
            <ServiturLogo size="md" />
            <ServiturLetter />
          </Link>
          <button onClick={onClose} className="p-1 rounded md:hidden text-muted">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={closeMobile}
              className={`flex items-center gap-3 px-5 py-3 transition-colors border-l-[3px] ${
                isActive(item)
                  ? 'bg-accent-muted text-accent-text border-l-accent-text'
                  : 'border-l-transparent'
              }`}
            >
              <item.icon size={20} />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="border-t border-border py-4">
          {user && (
            <button
              onClick={() => {
                handleLogout()
                closeMobile()
              }}
              className="flex items-center gap-3 w-full px-5 py-3 transition-colors text-error"
            >
              <LogOut size={20} />
              <span className="text-sm font-medium">Cerrar sesión</span>
            </button>
          )}
          <Link
            to="/"
            onClick={closeMobile}
            className="flex items-center gap-3 w-full px-5 py-3 transition-colors text-muted"
          >
            <Home size={20} />
            <span className="text-sm font-medium">Ver sitio</span>
          </Link>
        </div>
      </aside>
    </>
  )
}
