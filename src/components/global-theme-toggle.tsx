import { Sun, Moon } from 'lucide-react'
import { useTheme } from '@/lib/theme'

export default function GlobalThemeToggle() {
  const { theme, toggleTheme, colors } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="fixed top-4 right-4 z-[60] p-2 rounded-full shadow-lg transition-colors"
      style={{
        backgroundColor: colors.card,
        border: `1px solid ${colors.border}`,
        color: colors.text,
      }}
      title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
    >
      {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  )
}
