import { useAuth } from '@/hooks/useAuth'

const MyComputerPage = () => {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-white">Máy tính của tôi</h1>
          <p className="text-gray-500 mt-1">Xem thông tin máy tính được gán cho bạn</p>
        </div>

        {/* Computer Info Card */}
        <div className="max-w-2xl">
          <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-6">
            {/* User Info */}
            <div className="flex items-center gap-4 pb-6 border-b border-[#2e2e2e]">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-lg">
                  {user?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-white font-medium">{user?.username}</p>
                <p className="text-gray-500 text-sm capitalize">{user?.role}</p>
              </div>
            </div>

            {/* Computer Status */}
            <div className="py-12 text-center">
              <div className="w-20 h-20 bg-[#2a2a2a] rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-lg font-medium text-white mb-2">Chưa có máy tính được gán</h2>
              <p className="text-gray-500 max-w-sm mx-auto">
                Hiện tại bạn chưa được gán máy tính nào. Vui lòng liên hệ quản trị viên nếu cần hỗ trợ.
              </p>
            </div>

            {/* Help Section */}
            <div className="pt-6 border-t border-[#2e2e2e]">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-600/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">
                    Khi được gán máy tính, bạn sẽ thấy thông tin chi tiết về:
                  </p>
                  <ul className="mt-2 space-y-1 text-gray-500 text-sm">
                    <li>• Tên và mã máy tính</li>
                    <li>• Số serial</li>
                    <li>• Cấu hình phần cứng</li>
                    <li>• Phòng ban</li>
                    <li>• Trạng thái hoạt động</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MyComputerPage
