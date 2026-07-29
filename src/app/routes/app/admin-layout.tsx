import { Outlet } from 'react-router-dom'

export default function Admin() {
  return (
    <div className="min-h-screen bg-background">
      <Outlet />
    </div>
  )
}
