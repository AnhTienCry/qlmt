import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants'

const stats = [
  {
    title: 'Tổng máy tính',
    value: '0',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    color: 'blue',
  },
  {
    title: 'Đang sử dụng',
    value: '0',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    color: 'green',
  },
  {
    title: 'Bảo trì',
    value: '0',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
      </svg>
    ),
    color: 'yellow',
  },
  {
    title: 'Người dùng',
    value: '0',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    color: 'purple',
  },
]

const quickActions = [
  { label: 'Quản lý máy tính', path: ROUTES.COMPUTERS, icon: '💻' },
]

const DashboardPage = () => {
  const getColorClass = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-600/10 text-blue-500',
      green: 'bg-green-600/10 text-green-500',
      yellow: 'bg-yellow-600/10 text-yellow-500',
      purple: 'bg-purple-600/10 text-purple-500',
    }
    return colors[color] || colors.blue
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-6">
        <h1 className="text-xl font-semibold text-white mb-1">Chào mừng đến Dashboard!</h1>
        <p className="text-gray-500">Quản lý hệ thống máy tính của bạn tại đây.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
                <p className="text-2xl font-semibold text-white">{stat.value}</p>
              </div>
              <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${getColorClass(stat.color)}`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions & Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-5">
          <h3 className="text-lg font-medium text-white mb-4">Thao tác nhanh</h3>
          <div className="space-y-3">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.path}
                className="flex items-center gap-3 p-3 bg-[#2a2a2a] rounded-lg hover:bg-[#3a3a3a] transition-colors"
              >
                <span className="text-xl">{action.icon}</span>
                <span className="text-white font-medium">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="lg:col-span-2 bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-5">
          <h3 className="text-lg font-medium text-white mb-4">Hoạt động gần đây</h3>
          <div className="text-center py-12">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-gray-500">Chưa có hoạt động nào</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
