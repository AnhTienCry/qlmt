// Input component - Modern Dark Theme
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

const Input: React.FC<InputProps> = ({ label, error, icon, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-400 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            {icon}
          </div>
        )}
        <input
          className={`w-full px-4 py-2.5 bg-[#1a1a1a] border rounded-xl text-white placeholder-gray-600 
            focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all 
            hover:border-[#3a3a3a] ${
            error ? 'border-red-500 focus:ring-red-500/50' : 'border-[#2a2a2a]'
          } ${icon ? 'pl-10' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
    </div>
  )
}

export default Input
