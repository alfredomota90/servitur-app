import { useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { useTheme } from '@/lib/theme'

export default function AdminTopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const { colors } = useTheme()
  const location = useLocation()
  if (!location.pathname.startsWith('/admin')) return null

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 md:hidden"
      style={{
        backgroundColor: colors.adminBg,
        borderBottom: `1px solid ${colors.border}`,
      }}
    >
      <button onClick={onMenuClick} style={{ color: colors.adminText }}>
        <Menu size={24} />
      </button>
      <span className="font-bold text-lg tracking-wide" style={{ color: colors.adminAccent }}>
        SERVITUR
      </span>
      <div className="w-6" />
    </nav>
  )
}
