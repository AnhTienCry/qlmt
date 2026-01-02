import { useAuth } from '@/hooks/useAuth'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants'

export default function UserDashboardPage() {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Xin chào, {user?.username}!</h1>
        <p className="text-gray-400 mt-1">Trang quản lý thông tin cá nhân</p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          to={ROUTES.USER_MY_COMPUTER}
          className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-6 hover:border-green-500 transition-colors"
        >
          <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-white font-semibold mb-2">Máy tính của tôi</h3>
          <p className="text-gray-400 text-sm">Xem thông tin máy tính được gán cho bạn</p>
        </Link>

        <Link
          to={ROUTES.USER_PROPOSALS}
          className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-6 hover:border-blue-500 transition-colors"
        >
          <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-white font-semibold mb-2">Đề xuất của tôi</h3>
          <p className="text-gray-400 text-sm">Xem và quản lý các đề xuất bạn đã tạo</p>
        </Link>

        <Link
          to={ROUTES.USER_PROPOSALS_NEW}
          className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-6 hover:border-yellow-500 transition-colors"
        >
          <div className="w-12 h-12 bg-yellow-600/20 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h3 className="text-white font-semibold mb-2">Tạo đề xuất mới</h3>
          <p className="text-gray-400 text-sm">Đề xuất nâng cấp, sửa chữa máy tính</p>
        </Link>
      </div>
    </div>
  )
}
