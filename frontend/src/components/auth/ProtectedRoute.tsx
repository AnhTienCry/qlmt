import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/constants'
import { UserRole } from '@/types/auth.types'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Chưa đăng nhập -> redirect to login
  if (!user) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
  }

  // Kiểm tra role nếu có yêu cầu
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect về dashboard tương ứng với role
    const roleDefaultRoutes: Record<UserRole, string> = {
      admin: ROUTES.DASHBOARD,
      it: ROUTES.IT_DASHBOARD,
      director: ROUTES.DIRECTOR_DASHBOARD,
      user: ROUTES.USER_DASHBOARD,
    }
    return <Navigate to={roleDefaultRoutes[user.role]} replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
