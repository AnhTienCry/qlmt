// Stats Card cho Dashboard
interface StatsCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: {
    value: number
    isUp: boolean
  }
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'cyan'
}

const colorClasses = {
  blue: 'from-blue-600 to-blue-700',
  green: 'from-green-600 to-green-700',
  yellow: 'from-yellow-500 to-yellow-600',
  red: 'from-red-600 to-red-700',
  purple: 'from-purple-600 to-purple-700',
  cyan: 'from-cyan-600 to-cyan-700',
}

const iconBgClasses = {
  blue: 'bg-blue-500/20',
  green: 'bg-green-500/20',
  yellow: 'bg-yellow-500/20',
  red: 'bg-red-500/20',
  purple: 'bg-purple-500/20',
  cyan: 'bg-cyan-500/20',
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  trend,
  color = 'blue'
}) => {
  return (
    <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-6 hover:border-[#3e3e3e] transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-white mt-2">{value}</p>
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${trend.isUp ? 'text-green-400' : 'text-red-400'}`}>
              <svg className={`w-4 h-4 ${trend.isUp ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              <span>{trend.value}%</span>
            </div>
          )}
        </div>
        <div className={`w-14 h-14 rounded-xl ${iconBgClasses[color]} flex items-center justify-center`}>
          <div className={`bg-gradient-to-br ${colorClasses[color]} p-2.5 rounded-lg text-white`}>
            {icon}
          </div>
        </div>
      </div>
    </div>
  )
}

export default StatsCard
