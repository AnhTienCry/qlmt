import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { authApi } from '@/libs/auth'
import { ROUTES } from '@/constants'
import { Input, Button } from '@/components/ui'

const LoginPage = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formData, setFormData] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Hàm lấy route dashboard theo role
  const getDashboardByRole = (role: string): string => {
    switch (role) {
      case 'admin':
        return ROUTES.DASHBOARD
      case 'it':
        return ROUTES.IT_DASHBOARD
      case 'director':
        return ROUTES.DIRECTOR_DASHBOARD
      case 'user':
        return ROUTES.USER_DASHBOARD
      default:
        return ROUTES.DASHBOARD
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await authApi.login(formData)
      login(result.user, result.token)
      
      // Redirect theo role
      const dashboardRoute = getDashboardByRole(result.user.role)
      navigate(dashboardRoute)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f] py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-white">Đăng nhập</h2>
            <p className="mt-2 text-sm text-gray-500">
              Hệ thống quản lý máy tính
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Input
              label="Tên đăng nhập"
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="Nhập tên đăng nhập"
              required
            />

            <Input
              label="Mật khẩu"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Nhập mật khẩu"
              required
            />

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Đăng nhập
            </Button>

            <div className="text-center text-sm">
              <span className="text-gray-500">Chưa có tài khoản? </span>
              <Link to={ROUTES.REGISTER} className="text-blue-500 hover:text-blue-400">
                Đăng ký ngay
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
