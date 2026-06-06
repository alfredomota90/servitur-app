import { Outlet } from 'react-router-dom'
import { useTheme } from '@/lib/theme'

export default function Admin() {
  const { colors } = useTheme()
  return (
    <div className="pt-14 min-h-screen" style={{ backgroundColor: colors.background }}>
      <Outlet />
    </div>
  )
}
