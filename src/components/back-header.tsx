import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface BackHeaderProps {
  to?: string
  label?: string
}

export default function BackHeader({ to, label = 'Volver' }: BackHeaderProps) {
  const navigate = useNavigate()

  return (
    <header className="hidden md:block shadow-sm sticky top-0 z-40 bg-background-secondary border-b border-border">
      <div className="px-4 py-4">
        <button
          onClick={() => (to ? navigate(to) : navigate(-1))}
          className="flex items-center gap-2 font-medium transition-colors text-muted"
        >
          <ArrowLeft size={20} />
          <span>{label}</span>
        </button>
      </div>
    </header>
  )
}
