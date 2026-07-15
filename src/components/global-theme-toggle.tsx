import { Sun, Moon } from 'lucide-react'
import { useTheme } from '@/lib/theme'

export default function GlobalThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="fixed top-2 right-4 z-[60] p-2 rounded-full shadow-lg transition-colors bg-card border-border text-foreground border"
      title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
    >
      {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  )
}
