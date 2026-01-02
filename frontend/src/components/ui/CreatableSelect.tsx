import { useState, useRef, useEffect } from 'react'

interface SelectOption {
  value: string | number
  label: string
}

interface CreatableSelectProps {
  label?: string
  options: SelectOption[]
  value: string | number
  onChange: (value: string) => void
  onCreateNew?: (inputValue: string) => Promise<{ value: string | number; label: string } | null>
  placeholder?: string
  error?: string
  className?: string
  disabled?: boolean
  createLabel?: string // VD: "Thêm NCC mới"
}

export const CreatableSelect: React.FC<CreatableSelectProps> = ({
  label,
  options,
  value,
  onChange,
  onCreateNew,
  placeholder = 'Chọn hoặc nhập mới...',
  error,
  className = '',
  disabled = false,
  createLabel = 'Thêm mới'
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [creating, setCreating] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Lọc options theo input
  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(inputValue.toLowerCase())
  )

  // Kiểm tra xem input có khớp chính xác với option nào không
  const exactMatch = options.some(opt => 
    opt.label.toLowerCase() === inputValue.toLowerCase()
  )

  // Lấy label từ value
  const selectedLabel = options.find(opt => String(opt.value) === String(value))?.label || ''

  // Close dropdown khi click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setInputValue('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (opt: SelectOption) => {
    onChange(String(opt.value))
    setIsOpen(false)
    setInputValue('')
  }

  const handleCreateNew = async () => {
    if (!onCreateNew || !inputValue.trim()) return
    
    setCreating(true)
    try {
      const newOption = await onCreateNew(inputValue.trim())
      if (newOption) {
        onChange(String(newOption.value))
        setIsOpen(false)
        setInputValue('')
      }
    } catch (err) {
      console.error('Error creating new option:', err)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div ref={containerRef} className={`w-full relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-400 mb-2">
          {label}
        </label>
      )}
      
      {/* Input field */}
      <div 
        className={`w-full px-4 py-2.5 bg-[#1a1a1a] border rounded-xl text-white 
          focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-500/50 
          transition-all cursor-pointer flex items-center
          ${error ? 'border-red-500' : 'border-[#2a2a2a]'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-[#3a3a3a]'}
        `}
        onClick={() => {
          if (!disabled) {
            setIsOpen(true)
            setTimeout(() => inputRef.current?.focus(), 0)
          }
        }}
      >
        {isOpen ? (
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={selectedLabel || placeholder}
            className="flex-1 bg-transparent outline-none placeholder-gray-500"
            disabled={disabled}
          />
        ) : (
          <span className={selectedLabel ? 'text-white' : 'text-gray-500'}>
            {selectedLabel || placeholder}
          </span>
        )}
        <div className="ml-2 text-gray-500">
          <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl shadow-xl max-h-72 overflow-auto">
          {/* Hướng dẫn tạo mới - luôn hiển thị */}
          {onCreateNew && (
            <div className="px-4 py-2 bg-green-500/5 border-b border-[#2a2a2a] text-xs text-green-400 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Nhập tên để tạo mới nếu không có trong danh sách
            </div>
          )}

          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => (
              <div
                key={opt.value}
                className={`px-4 py-2.5 cursor-pointer hover:bg-[#2a2a2a] transition-colors
                  ${String(opt.value) === String(value) ? 'bg-blue-500/20 text-blue-400' : 'text-white'}
                `}
                onClick={() => handleSelect(opt)}
              >
                {opt.label}
              </div>
            ))
          ) : inputValue ? (
            <div className="px-4 py-3 text-gray-500 text-sm text-center">
              Không tìm thấy "{inputValue}"
            </div>
          ) : (
            <div className="px-4 py-3 text-gray-500 text-sm text-center">
              Danh sách trống
            </div>
          )}
          
          {/* Nút thêm mới - hiển thị khi có input và không khớp chính xác */}
          {onCreateNew && inputValue.trim() && !exactMatch && (
            <div
              className="px-4 py-3 cursor-pointer bg-green-500/10 hover:bg-green-500/20 transition-colors border-t border-[#2a2a2a] text-green-400 flex items-center gap-2 font-medium"
              onClick={handleCreateNew}
            >
              {creating ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Đang tạo...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  {createLabel}: "{inputValue}"
                </>
              )}
            </div>
          )}
        </div>
      )}

      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
    </div>
  )
}

export default CreatableSelect
