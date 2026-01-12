// Table component - Modern Dark Theme
interface Column<T> {
  key: string
  header: string
  render?: (item: T, index: number) => React.ReactNode
  className?: string
  headerClassName?: string
}

interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  emptyText?: string
  emptyIcon?: React.ReactNode
  onRowClick?: (item: T) => void
  rowKey?: keyof T | ((item: T) => string | number)
  // Selection props
  selectable?: boolean
  selectedIds?: (string | number)[]
  onSelectChange?: (ids: (string | number)[]) => void
}

export function Table<T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  emptyText = 'Không có dữ liệu',
  emptyIcon,
  onRowClick,
  rowKey,
  selectable = false,
  selectedIds = [],
  onSelectChange
}: TableProps<T>) {
  const getRowKey = (item: T, index: number): string | number => {
    if (!rowKey) return index
    if (typeof rowKey === 'function') return rowKey(item)
    return item[rowKey] as string | number
  }

  const handleSelectAll = () => {
    if (!onSelectChange) return
    if (selectedIds.length === data.length) {
      onSelectChange([])
    } else {
      onSelectChange(data.map((item, i) => getRowKey(item, i)))
    }
  }

  const handleSelectRow = (id: string | number) => {
    if (!onSelectChange) return
    if (selectedIds.includes(id)) {
      onSelectChange(selectedIds.filter(i => i !== id))
    } else {
      onSelectChange([...selectedIds, id])
    }
  }

  const totalColumns = selectable ? columns.length + 1 : columns.length

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-[#1f1f1f]">
            {selectable && (
              <th className="w-10 px-4 py-3 first:rounded-tl-lg">
                <input
                  type="checkbox"
                  checked={data.length > 0 && selectedIds.length === data.length}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded border-gray-600 bg-[#2a2a2a] text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                />
              </th>
            )}
            {columns.map((col, idx) => (
              <th
                key={col.key}
                className={`px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider ${!selectable && idx === 0 ? 'first:rounded-tl-lg' : ''} ${idx === columns.length - 1 ? 'last:rounded-tr-lg' : ''} ${col.headerClassName || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#252525]">
          {loading ? (
            <tr>
              <td colSpan={totalColumns} className="px-4 py-16 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 border-2 border-[#2a2a2a] rounded-full"></div>
                    <div className="absolute top-0 w-10 h-10 border-2 border-blue-500 rounded-full animate-spin border-t-transparent"></div>
                  </div>
                  <span className="text-gray-500 text-sm">Đang tải dữ liệu...</span>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={totalColumns} className="px-4 py-16 text-center">
                <div className="flex flex-col items-center gap-3">
                  {emptyIcon || (
                    <div className="w-16 h-16 bg-[#1f1f1f] rounded-2xl flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                    </div>
                  )}
                  <span className="text-gray-500 text-sm">{emptyText}</span>
                </div>
              </td>
            </tr>
          ) : (
            data.map((item, index) => {
              const rowId = getRowKey(item, index)
              const isSelected = selectedIds.includes(rowId)
              return (
                <tr
                  key={rowId}
                  onClick={() => onRowClick?.(item)}
                  className={`hover:bg-[#1f1f1f] transition-colors ${onRowClick ? 'cursor-pointer' : ''} ${isSelected ? 'bg-blue-900/20' : ''}`}
                >
                  {selectable && (
                    <td className="w-10 px-4 py-3.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => { e.stopPropagation(); handleSelectRow(rowId) }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 rounded border-gray-600 bg-[#2a2a2a] text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key} className={`px-4 py-3.5 text-sm ${col.className || ''}`}>
                      {col.render ? col.render(item, index) : item[col.key]}
                    </td>
                  ))}
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}

export default Table
