import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/constants'

const HomePage = () => {
  const { user, isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="max-w-3xl mx-auto text-center">
          {/* Welcome badge */}
          {isAuthenticated && user && (
            <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-[#1e1e1e] border border-[#2e2e2e] text-blue-400 rounded-full text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Xin chào, {user.username}!
            </div>
          )}
          
          {/* Main heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Tra cứu thông tin
            <span className="block text-blue-500">máy tính của bạn</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            {isAuthenticated 
              ? 'Xem thông tin chi tiết về máy tính được gán cho bạn trong công ty.'
              : 'Hệ thống giúp nhân viên tra cứu thông tin máy tính được gán cho mình một cách nhanh chóng và dễ dàng.'
            }
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {isAuthenticated ? (
              <Link 
                to={ROUTES.MY_COMPUTER}
                className="px-8 py-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Xem máy tính của tôi
              </Link>
            ) : (
              <>
                <Link 
                  to={ROUTES.LOGIN}
                  className="px-8 py-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link 
                  to={ROUTES.REGISTER}
                  className="px-8 py-4 bg-[#1e1e1e] text-white font-medium rounded-lg border border-[#2e2e2e] hover:bg-[#2a2a2a] transition-colors"
                >
                  Đăng ký tài khoản
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Features Section - Only for non-authenticated */}
      {!isAuthenticated && (
        <div className="border-t border-[#1e1e1e]">
          <div className="container mx-auto px-4 py-16">
            <h2 className="text-2xl font-semibold text-white text-center mb-12">
              Hệ thống giúp bạn
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {/* Feature 1 */}
              <div className="p-6 bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl">
                <div className="w-12 h-12 bg-blue-600/10 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Xem máy tính của bạn</h3>
                <p className="text-gray-500 text-sm">Tra cứu thông tin máy tính đang được gán cho bạn sử dụng.</p>
              </div>

              {/* Feature 2 */}
              <div className="p-6 bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl">
                <div className="w-12 h-12 bg-green-600/10 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Thông tin chi tiết</h3>
                <p className="text-gray-500 text-sm">Xem cấu hình, số serial, và các thông tin kỹ thuật khác.</p>
              </div>

              {/* Feature 3 */}
              <div className="p-6 bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl">
                <div className="w-12 h-12 bg-purple-600/10 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Truy cập mọi lúc</h3>
                <p className="text-gray-500 text-sm">Tra cứu thông tin bất cứ lúc nào bạn cần, 24/7.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Section for authenticated users */}
      {isAuthenticated && (
        <div className="border-t border-[#1e1e1e]">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-2xl mx-auto">
              <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-8 text-center">
                <div className="w-16 h-16 bg-blue-600/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-white mb-3">Máy tính của tôi</h2>
                <p className="text-gray-400 mb-6">
                  Xem thông tin chi tiết về máy tính đang được gán cho bạn sử dụng tại công ty.
                </p>
                <Link 
                  to={ROUTES.MY_COMPUTER}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Xem ngay
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HomePage
