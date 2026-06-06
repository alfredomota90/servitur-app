import { Outlet } from 'react-router-dom'

export default function Admin() {
  return (
    <div className="pt-14 min-h-screen bg-background">
      <Outlet />
    </div>
  )
}
