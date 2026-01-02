import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants'
import { useAuth } from '@/hooks/useAuth'

const HomePage = () => {
  const { isAuthenticated, user } = useAuth()
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme')
    return saved ? saved === 'dark' : true
  })

  useEffect(() => {
    localStorage.setItem('theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  // Hàm lấy dashboard route theo role
  const getDashboardByRole = (role: string): string => {
    switch (role) {
      case 'admin': return ROUTES.DASHBOARD
      case 'it': return ROUTES.IT_DASHBOARD
      case 'director': return ROUTES.DIRECTOR_DASHBOARD
      case 'user': return ROUTES.USER_DASHBOARD
      default: return ROUTES.DASHBOARD
    }
  }

  const features = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      title: 'Quản lý Phòng ban',
      description: 'Tổ chức và quản lý cơ cấu phòng ban, nhân sự trong doanh nghiệp một cách hiệu quả.'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      title: 'Quản lý Hàng hóa',
      description: 'Theo dõi danh mục hàng hóa, thiết bị máy tính với đầy đủ thông tin chi tiết.'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
        </svg>
      ),
      title: 'Quản lý Kho hàng',
      description: 'Quản lý nhiều kho hàng, theo dõi vị trí và tình trạng lưu trữ thiết bị.'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
      ),
      title: 'Nhập / Xuất kho',
      description: 'Ghi nhận và theo dõi các phiếu nhập kho, xuất kho với thông tin đầy đủ.'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
      title: 'Điều chuyển',
      description: 'Quản lý việc điều chuyển thiết bị giữa các nhân viên, phòng ban.'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      title: 'Báo cáo thống kê',
      description: 'Xuất báo cáo nhập xuất tồn, thống kê số liệu theo thời gian.'
    },
  ]

  const roles = [
    { name: 'Admin', color: 'blue', desc: 'Quản trị toàn bộ hệ thống' },
    { name: 'IT', color: 'cyan', desc: 'Xử lý đề xuất kỹ thuật' },
    { name: 'Giám đốc', color: 'purple', desc: 'Duyệt các đề xuất' },
    { name: 'Nhân viên', color: 'green', desc: 'Tạo đề xuất, xem máy tính' },
  ]

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-[#0a0a0a] text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 backdrop-blur-lg ${darkMode ? 'bg-[#0a0a0a]/80 border-[#1e1e1e]' : 'bg-white/80 border-gray-200'} border-b`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <span className="font-bold text-xl">QLMT</span>
                <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Quản Lý Máy Tính</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              {/* Theme Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg transition-colors ${darkMode ? 'bg-[#1e1e1e] hover:bg-[#2e2e2e] text-yellow-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
                title={darkMode ? 'Chuyển sang Light Mode' : 'Chuyển sang Dark Mode'}
              >
                {darkMode ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>

              {/* Auth Buttons */}
              {isAuthenticated ? (
                <Link
                  to={getDashboardByRole(user?.role || 'user')}
                  className="px-5 py-2 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-medium rounded-lg transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
                >
                  Vào Dashboard
                </Link>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    to={ROUTES.LOGIN}
                    className={`px-4 py-2 font-medium rounded-lg transition-colors ${darkMode ? 'text-gray-300 hover:text-white hover:bg-[#1e1e1e]' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
                  >
                    Đăng nhập
                  </Link>
                  {/* <Link
                    to={ROUTES.REGISTER}
                    className="px-5 py-2 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-medium rounded-lg transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
                  >
                    Đăng ký
                  </Link> */}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 overflow-hidden">
          <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full ${darkMode ? 'bg-blue-500/10' : 'bg-blue-500/20'} blur-3xl`}></div>
          <div className={`absolute top-40 -left-40 w-80 h-80 rounded-full ${darkMode ? 'bg-purple-500/10' : 'bg-purple-500/20'} blur-3xl`}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Hệ thống Quản lý
              </span>
              <br />
              <span>Máy tính & Thiết bị</span>
            </h1>
            <p className={`text-lg sm:text-xl max-w-2xl mx-auto mb-10 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Giải pháp quản lý tài sản IT toàn diện cho doanh nghiệp. Theo dõi nhập xuất, điều chuyển thiết bị và tạo báo cáo dễ dàng.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to={isAuthenticated ? getDashboardByRole(user?.role || 'user') : ROUTES.LOGIN}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105"
              >
                {isAuthenticated ? 'Vào hệ thống' : 'Bắt đầu ngay'}
              </Link>
              <a
                href="#features"
                className={`px-8 py-3 font-semibold rounded-xl transition-all border ${darkMode ? 'border-[#2e2e2e] hover:bg-[#1e1e1e] text-gray-300' : 'border-gray-300 hover:bg-gray-100 text-gray-700'}`}
              >
                Tìm hiểu thêm
              </a>
            </div>
          </div>

          {/* Stats */}
          <div className={`mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 p-6 rounded-2xl ${darkMode ? 'bg-[#111]/50 border border-[#1e1e1e]' : 'bg-white/50 border border-gray-200'} backdrop-blur-sm`}>
            {[
              { value: '10+', label: 'Modules' },
              { value: '4', label: 'Vai trò' },
              { value: '100%', label: 'Responsive' },
              { value: '24/7', label: 'Hoạt động' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={`py-20 ${darkMode ? 'bg-[#0f0f0f]' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Tính năng nổi bật</h2>
            <p className={`max-w-2xl mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Hệ thống cung cấp đầy đủ các chức năng cần thiết để quản lý tài sản IT hiệu quả
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`p-6 rounded-2xl transition-all hover:scale-105 ${darkMode ? 'bg-[#1a1a1a] hover:bg-[#1e1e1e] border border-[#2e2e2e]' : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'}`}
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${darkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className={`py-20 ${darkMode ? 'bg-[#0a0a0a]' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Phân quyền người dùng</h2>
            <p className={`max-w-2xl mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Hệ thống phân quyền 4 vai trò với chức năng riêng biệt
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {roles.map((role, index) => (
              <div
                key={index}
                className={`p-6 rounded-2xl text-center transition-all hover:scale-105 ${darkMode ? 'bg-[#1a1a1a] border border-[#2e2e2e]' : 'bg-white border border-gray-200 shadow-sm'}`}
              >
                <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-white font-bold text-xl
                  ${role.color === 'blue' ? 'bg-blue-600' : ''}
                  ${role.color === 'cyan' ? 'bg-cyan-600' : ''}
                  ${role.color === 'purple' ? 'bg-purple-600' : ''}
                  ${role.color === 'green' ? 'bg-green-600' : ''}
                `}>
                  {role.name.charAt(0)}
                </div>
                <h3 className="text-lg font-semibold mb-2">{role.name}</h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {role.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-20 ${darkMode ? 'bg-[#0f0f0f]' : 'bg-white'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className={`p-10 rounded-3xl ${darkMode ? 'bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-[#2e2e2e]' : 'bg-gradient-to-br from-blue-50 to-purple-50 border border-gray-200'}`}>
            <h2 className="text-3xl font-bold mb-4">Sẵn sàng bắt đầu?</h2>
            <p className={`mb-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Đăng nhập ngay để trải nghiệm hệ thống quản lý máy tính chuyên nghiệp
            </p>
            <Link
              to={isAuthenticated ? getDashboardByRole(user?.role || 'user') : ROUTES.LOGIN}
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
            >
              {isAuthenticated ? 'Vào Dashboard' : 'Đăng nhập ngay'}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-8 border-t ${darkMode ? 'bg-[#0a0a0a] border-[#1e1e1e]' : 'bg-gray-50 border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="font-semibold">QLMT</span>
            </div>
            <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              © 2026 Hệ thống Quản lý Máy tính. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
