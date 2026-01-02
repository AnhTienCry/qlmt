// Select component - Modern Dark Theme
interface SelectOption {
  value: string | number
  label: string
}

interface SelectProps {
  label?: string
  options: SelectOption[]
  value: string | number
  onChange: (value: string) => void
  placeholder?: string
  error?: string
  className?: string
  disabled?: boolean
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = 'Chọn...',
  error,
  className = '',
  disabled = false
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-400 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`w-full px-4 py-2.5 bg-[#1a1a1a] border rounded-xl text-white 
            focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 
            transition-all cursor-pointer appearance-none
            ${error ? 'border-red-500 focus:ring-red-500/50' : 'border-[#2a2a2a]'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-[#3a3a3a]'}
          `}
        >
          <option value="" className="bg-[#1a1a1a] text-gray-500">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#1a1a1a]">
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
    </div>
  )
}

export default Select
