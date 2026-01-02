import { Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout, DashboardLayout } from '@/components/layout'
import { ProtectedRoute } from '@/components/auth'
import { useAuth } from '@/hooks/useAuth'
import HomePage from '@/pages/clients/HomePage'
import LoginPage from '@/pages/both/LoginPage'
import RegisterPage from '@/pages/both/RegisterPage'
import DashboardPage from '@/pages/admin/DashboardPage'
import ComputersPage from '@/pages/admin/ComputersPage'
import NotFoundPage from '@/pages/both/NotFoundPage'
import { ROUTES } from '@/constants'

// Component điều hướng sau khi đăng nhập
const AuthRedirect = () => {
  const { user } = useAuth()
  
  if (user?.role === 'admin') {
    return <Navigate to={ROUTES.DASHBOARD} replace />
  }
  return <Navigate to={ROUTES.HOME} replace />
}

function App() {
  return (
    <Routes>
      {/* Public routes - no layout */}
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
      
      {/* Redirect helper */}
      <Route path="/auth-redirect" element={<AuthRedirect />} />
      
      {/* User routes - với MainLayout */}
      <Route element={<MainLayout />}>
        <Route path={ROUTES.HOME} element={<HomePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      
      {/* Admin routes - với DashboardLayout */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="computers" element={<ComputersPage />} />
      </Route>
    </Routes>
  )
}

export default App
