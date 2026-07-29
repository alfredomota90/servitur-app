import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { ErrorElement } from '@/app/routes/error-element'
import ProtectedRoute from '@/components/protected-route'

const Landing = lazy(() => import('@/app/routes/landing/landing-page'))
const Services = lazy(() => import('@/app/routes/landing/services-page'))
const Contact = lazy(() => import('@/app/routes/landing/contact-page'))
const Login = lazy(() => import('@/app/routes/auth/login-page'))
const Admin = lazy(() => import('@/app/routes/app/admin-layout'))
const Dashboard = lazy(() => import('@/app/routes/app/dashboard-page'))
const Trips = lazy(() => import('@/app/routes/app/trips-page'))
const ClientsAdmin = lazy(() => import('@/app/routes/app/clientes/clients-admin-page'))
const ClientDetail = lazy(() => import('@/app/routes/app/clientes/client-detail-page'))
const ProjectDetail = lazy(() => import('@/app/routes/app/clientes/project-detail-page'))
const RequirementsPage = lazy(() => import('@/app/routes/app/clientes/requirements-page'))

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
