import { useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'

export default function AdminTopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const location = useLocation()
  if (!location.pathname.startsWith('/admin')) return null

  return (
    <nav className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 md:hidden bg-admin-bg border-b border-border">
      <button onClick={onMenuClick} className="text-admin-foreground">
        <Menu size={24} />
      </button>
      <img
        src={`${import.meta.env.BASE_URL}serviture_letter_v2.svg`}
        alt="SERVITUR"
        className="h-6 w-auto"
      />
      <div className="w-6" />
    </nav>
  )
}
