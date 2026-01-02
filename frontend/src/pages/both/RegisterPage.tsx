import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { authApi } from '@/libs/auth'
import { ROUTES } from '@/constants'
import { Input, Button } from '@/components/ui'

const RegisterPage = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formData, setFormData] = useState({ 
    username: '', 
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate
    if (!formData.username || !formData.password || !formData.confirmPassword) {
      setError('Vui lòng điền đầy đủ thông tin')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp')
      return
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự')
      return
    }

    setLoading(true)

    try {
      const result = await authApi.register(formData)
      login(result.user, result.token)
      navigate(ROUTES.HOME)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đăng ký thất bại')
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-white">Đăng ký</h2>
            <p className="mt-2 text-sm text-gray-500">
              Tạo tài khoản mới
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
              placeholder="Nhập tên đăng nhập"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />

            <Input
              label="Mật khẩu"
              type="password"
              placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />

            <Input
              label="Xác nhận mật khẩu"
              type="password"
              placeholder="Nhập lại mật khẩu"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
            />

            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={loading}
              disabled={loading}
            >
              {loading ? 'Đang đăng ký...' : 'Đăng ký'}
            </Button>

            <div className="text-center text-sm">
              <span className="text-gray-500">Đã có tài khoản? </span>
              <Link to={ROUTES.LOGIN} className="text-blue-500 hover:text-blue-400">
                Đăng nhập ngay
              </Link>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <Link to={ROUTES.HOME} className="text-sm text-gray-500 hover:text-gray-400">
              ← Quay lại trang chủ
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
