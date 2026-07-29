import { AppLayout } from '@/app/layout'
import { AppProvider } from '@/app/provider'

export default function App() {
  return (
    <AppProvider>
      <AppLayout />
    </AppProvider>
  )
}
