import { useState } from 'react'
import { useLocation } from 'react-router-dom'

import AdminSidebar from '@/components/admin-sidebar'
import AdminTopBar from '@/components/admin-top-bar'
import GlobalThemeToggle from '@/components/global-theme-toggle'
import MobileNav from '@/components/mobile-nav'
import { ToastContainer } from '@/components/notifications'
import PublicSidebar from '@/components/public-sidebar'

import { AppRouter } from './router'

export function AppLayout() {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')
  const isLogin = location.pathname === '/login'
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen transition-colors bg-background text-foreground">
      <GlobalThemeToggle />
      <ToastContainer />
      {isAdmin && !isLogin && (
        <>
          <AdminTopBar onMenuClick={() => setSidebarOpen(true)} />
          <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        </>
      )}
      {!isAdmin && !isLogin && <PublicSidebar />}
      <div
        className={`min-h-screen transition-all duration-300 ${
          isAdmin ? 'md:ml-[260px] pt-14 md:pt-0' : !isLogin ? 'md:ml-[220px]' : ''
        }`}
      >
        <AppRouter />
      </div>
      {!isAdmin && !isLogin && <MobileNav />}
    </div>
  )
}
