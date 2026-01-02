import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/constants'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: ('admin' | 'user')[]
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
    // User không có quyền -> redirect về trang phù hợp
    if (user.role === 'user') {
      return <Navigate to={ROUTES.HOME} replace />
    }
    if (user.role === 'admin') {
      return <Navigate to={ROUTES.DASHBOARD} replace />
    }
  }

  return <>{children}</>
}

export default ProtectedRoute
