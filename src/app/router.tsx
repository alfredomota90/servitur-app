import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { ErrorElement } from '@/app/routes/error-element'
import ProtectedRoute from '@/components/protected-route'

const Landing = lazy(() => import('@/pages/landing'))
const Services = lazy(() => import('@/pages/services'))
const Contact = lazy(() => import('@/pages/contact'))
const Admin = lazy(() => import('@/pages/admin'))
const Dashboard = lazy(() => import('@/pages/admin/dashboard'))
const Trips = lazy(() => import('@/pages/admin/trips'))
const ClientsAdmin = lazy(() => import('@/pages/admin/clients-admin'))
const ClientDetail = lazy(() => import('@/pages/admin/client-detail'))
const ProjectDetail = lazy(() => import('@/pages/admin/project-detail'))
const RequirementsPage = lazy(() => import('@/pages/admin/requirements-page'))
const Login = lazy(() => import('@/pages/admin/login'))

function PageFallback() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground" />
    </div>
  )
}

export function AppRouter() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/" element={<Landing />} errorElement={<ErrorElement />} />
        <Route path="/servicios" element={<Services />} errorElement={<ErrorElement />} />
        <Route path="/contacto" element={<Contact />} errorElement={<ErrorElement />} />
        <Route path="/login" element={<Login />} errorElement={<ErrorElement />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
          errorElement={<ErrorElement />}
        >
          <Route index element={<Dashboard />} errorElement={<ErrorElement />} />
          <Route path="viajes" element={<Trips />} errorElement={<ErrorElement />} />
          <Route path="clientes" element={<ClientsAdmin />} errorElement={<ErrorElement />} />
          <Route path="clientes/:id" element={<ClientDetail />} errorElement={<ErrorElement />} />
          <Route
            path="clientes/:clientId/proyectos/:projectId"
            element={<ProjectDetail />}
            errorElement={<ErrorElement />}
          />
          <Route
            path="clientes/:id/requisitos"
            element={<RequirementsPage />}
            errorElement={<ErrorElement />}
          />
        </Route>
      </Routes>
    </Suspense>
  )
}
