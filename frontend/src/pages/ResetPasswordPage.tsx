import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants'
import { Input, Button } from '@/components/ui'
import api from '@/libs/axios'

const ResetPasswordPage = () => {
  const [step, setStep] = useState<'input' | 'success'>('input')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<{ username: string; newPassword: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!username.trim()) {
      setError('Vui lòng nhập tên đăng nhập hoặc mã nhân viên')
      return
    }

    setLoading(true)
    try {
      const res = await api.post('/auth/reset-password-public', { username: username.trim() })
      if (res.data?.success) {
        setResult(res.data.data)
        setStep('success')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không tìm thấy tài khoản')
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
            <div className="w-14 h-14 bg-yellow-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-white">
              {step === 'input' ? 'Đặt lại mật khẩu' : 'Đặt lại thành công!'}
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              {step === 'input' 
                ? 'Nhập tên đăng nhập để đặt lại mật khẩu về mặc định'
                : 'Mật khẩu đã được đặt lại thành công'
              }
            </p>
          </div>

          {step === 'input' ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <Input
                label="Tên đăng nhập / Mã nhân viên"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toUpperCase())}
                placeholder="VD: NV001, IT001, admin..."
                required
              />

              <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-yellow-400 text-sm">
                  <strong>⚠️ Lưu ý:</strong> Mật khẩu sẽ được đặt lại về: <span className="font-mono">username@123</span>. 
                  Bạn có thể đổi mật khẩu sau khi đăng nhập.
                </p>
              </div>

              <Button type="submit" className="w-full" size="lg" loading={loading}>
                Đặt lại mật khẩu
              </Button>

              <div className="text-center text-sm">
                <Link to={ROUTES.LOGIN} className="text-blue-500 hover:text-blue-400">
                  ← Quay lại đăng nhập
                </Link>
              </div>
            </form>
          ) : (
            <div className="space-y-5">
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-green-400 font-medium">Đặt lại mật khẩu thành công!</span>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-300">
                    <span className="text-gray-500">Tài khoản:</span>{' '}
                    <span className="font-mono text-white">{result?.username}</span>
                  </p>
                  <p className="text-gray-300">
                    <span className="text-gray-500">Mật khẩu mới:</span>{' '}
                    <span className="font-mono text-yellow-400 font-bold">{result?.newPassword}</span>
                  </p>
                </div>
              </div>

              <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-blue-400 text-sm">
                  💡 Hãy ghi nhớ mật khẩu mới và đổi mật khẩu ngay sau khi đăng nhập để bảo mật tài khoản.
                </p>
              </div>

              <Link to={ROUTES.LOGIN}>
                <Button className="w-full" size="lg">
                  Đăng nhập ngay
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResetPasswordPage
