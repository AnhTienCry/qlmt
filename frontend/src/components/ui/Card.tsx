// Card component - Modern Dark Theme
interface CardProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  action?: React.ReactNode
  className?: string
  noPadding?: boolean
  variant?: 'default' | 'gradient'
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  title, 
  subtitle,
  action,
  className = '',
  noPadding = false,
  variant = 'default'
}) => {
  const baseClasses = variant === 'gradient' 
    ? 'bg-gradient-to-br from-[#1a1a1a] to-[#141414] border border-[#2a2a2a]'
    : 'bg-[#1a1a1a] border border-[#2a2a2a]'

  return (
    <div className={`${baseClasses} rounded-xl shadow-xl shadow-black/20 transition-all duration-300 hover:border-[#3a3a3a] ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2a2a]">
          <div>
            {title && <h3 className="text-base font-semibold text-white">{title}</h3>}
            {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-5'}>{children}</div>
    </div>
  )
}

export default Card
