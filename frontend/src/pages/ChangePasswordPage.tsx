import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { KeyRound, Eye, EyeOff, Lock, ArrowLeft, Check } from 'lucide-react'
import { authApi } from '@/libs/auth'
import { ROUTES } from '@/constants'
import { PageHeader } from '@/components/ui/PageHeader'
import Button from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'

export default function ChangePasswordPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (formData.newPassword !== formData.confirmNewPassword) {
      setError('Mật khẩu mới không khớp')
      return
    }

    if (formData.newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự')
      return
    }

    try {
      setLoading(true)
      await authApi.changePassword(formData)
      setSuccess(true)
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      })
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đổi mật khẩu thất bại')
    } finally {
      setLoading(false)
    }
  }

  const getBackRoute = () => {
    switch (user?.role) {
      case 'admin':
        return ROUTES.ADMIN_DASHBOARD
      case 'it':
        return ROUTES.IT_DASHBOARD
      case 'director':
        return ROUTES.DIRECTOR_DASHBOARD
      default:
        return ROUTES.USER_DASHBOARD
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] p-6">
      <div className="max-w-xl mx-auto">
        <button
          onClick={() => navigate(getBackRoute())}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </button>

        <PageHeader
          title="Đổi mật khẩu"
          subtitle="Thay đổi mật khẩu đăng nhập của bạn"
          icon={<KeyRound className="w-6 h-6" />}
        />

        <div className="mt-6 bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6">
          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Đổi mật khẩu thành công!
              </h3>
              <p className="text-gray-400 mb-6">
                Mật khẩu của bạn đã được cập nhật.
              </p>
              <Button onClick={() => navigate(getBackRoute())}>
                Quay về trang chủ
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Mật khẩu hiện tại
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#252525] border border-[#2a2a2a] rounded-xl px-4 py-3 pl-11 pr-11 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors"
                    placeholder="Nhập mật khẩu hiện tại"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(p => ({ ...p, current: !p.current }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className="w-full bg-[#252525] border border-[#2a2a2a] rounded-xl px-4 py-3 pl-11 pr-11 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors"
                    placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(p => ({ ...p, new: !p.new }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Xác nhận mật khẩu mới
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    name="confirmNewPassword"
                    value={formData.confirmNewPassword}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#252525] border border-[#2a2a2a] rounded-xl px-4 py-3 pl-11 pr-11 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors"
                    placeholder="Nhập lại mật khẩu mới"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(p => ({ ...p, confirm: !p.confirm }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="pt-4">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
