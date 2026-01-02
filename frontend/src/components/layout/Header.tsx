import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/constants'
import { Button } from '@/components/ui'

export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate(ROUTES.LOGIN)
  }

  return (
    <header className="bg-[#1a1a1a] border-b border-[#2e2e2e] sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to={ROUTES.DASHBOARD} className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="hidden sm:block">
              <span className="text-lg font-semibold text-white">QLMT</span>
              <p className="text-xs text-gray-500">Quản Lý Máy Tính</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-3">
            {user ? (
              <>
                {/* User Info */}
                <div className="flex items-center gap-3 pl-3 border-l border-[#2e2e2e]">
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-medium text-white">{user.tenNV || user.username}</p>
                    <p className="text-xs text-gray-500">
                      {user.tenPB ? `${user.tenPB} • ` : ''}{user.role.toUpperCase()}
                    </p>
                  </div>
                  <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {(user.tenNV || user.username)?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <Button onClick={handleLogout} variant="ghost" size="sm">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="hidden sm:inline">Đăng xuất</span>
                </Button>
              </>
            ) : (
              <>
                <Link to={ROUTES.LOGIN}>
                  <Button variant="ghost">Đăng nhập</Button>
                </Link>
                <Link to={ROUTES.REGISTER}>
                  <Button>Đăng ký</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
