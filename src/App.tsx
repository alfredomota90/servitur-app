import { AppProvider } from '@/app/provider'
import { AppLayout } from '@/app/layout'

export default function App() {
  return (
    <AppProvider>
      <AppLayout />
    </AppProvider>
  )
}
