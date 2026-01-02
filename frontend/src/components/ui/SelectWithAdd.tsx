import { Select } from './Select'

interface SelectOption {
  value: string | number
  label: string
}

interface SelectWithAddProps {
  label?: string
  options: SelectOption[]
  value: string | number
  onChange: (value: string) => void
  placeholder?: string
  error?: string
  className?: string
  disabled?: boolean
  onAddClick?: () => void  // Callback khi nhấn nút +
  addTitle?: string        // Tooltip cho nút +
}

export const SelectWithAdd: React.FC<SelectWithAddProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = 'Chọn...',
  error,
  className = '',
  disabled = false,
  onAddClick,
  addTitle = 'Thêm mới'
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-400 mb-2">
          {label}
        </label>
      )}
      
      <div className="flex gap-2">
        <div className="flex-1">
          <Select
            options={options}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            error={error}
            disabled={disabled}
          />
        </div>
        
        {onAddClick && (
          <button
            type="button"
            onClick={onAddClick}
            disabled={disabled}
            title={addTitle}
            className={`
              flex items-center justify-center w-11 h-11
              bg-green-600 hover:bg-green-700 
              text-white rounded-xl transition-all
              disabled:opacity-50 disabled:cursor-not-allowed
              focus:ring-2 focus:ring-green-500/50
            `}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        )}
      </div>
      
      {error && !label && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
    </div>
  )
}

export default SelectWithAdd
