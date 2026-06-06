import { createContext, useContext, useState } from 'react'

export const COLORS = {
  dark: {
    background: '#0d1c2f',
    backgroundSecondary: '#0f2238',
    card: '#132841',
    cardHover: '#1a314d',
    border: '#1e3a5f',
    text: '#cecdc9',
    textMuted: '#8a9aab',
    accent: '#c59d5c',
    accentHover: '#d4ad6c',
    accentMuted: 'rgba(197, 157, 92, 0.15)',
    success: '#4ade80',
    warning: '#fbbf24',
    error: '#f87171',
    adminBg: '#081220',
    adminText: '#cecdc9',
    adminAccent: '#c59d5c',
  },
  light: {
    background: '#f3f4f6',
    backgroundSecondary: '#ffffff',
    card: '#ffffff',
    cardHover: '#f9fafb',
    border: '#e5e7eb',
    text: '#111827',
    textMuted: '#4b5563',
    accent: '#c59d5c',
    accentHover: '#b88d4c',
    accentMuted: 'rgba(197, 157, 92, 0.15)',
    success: '#059669',
    warning: '#d97706',
    error: '#dc2626',
    adminBg: '#ffffff',
    adminText: '#111827',
    adminAccent: '#c59d5c',
  },
}

export type Theme = 'dark' | 'light'
export type Colors = typeof COLORS.dark

const ThemeContext = createContext<{
  theme: Theme
  colors: Colors
  toggleTheme: () => void
}>({
  theme: 'dark',
  colors: COLORS.dark,
  toggleTheme: () => {},
})

export const useTheme = () => useContext(ThemeContext)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
  )
  const colors = COLORS[theme]
  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme }}>{children}</ThemeContext.Provider>
  )
}
