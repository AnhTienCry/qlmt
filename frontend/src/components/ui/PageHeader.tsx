// Page Header component - Modern Dark Theme
interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
  icon?: React.ReactNode
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, actions, icon }) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-[#2a2a2a] rounded-2xl p-6 mb-6">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
      </div>
      
      <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          {icon && (
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              {icon}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{title}</h1>
            {subtitle && <p className="text-gray-400 mt-1 text-sm">{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </div>
  )
}

export default PageHeader
