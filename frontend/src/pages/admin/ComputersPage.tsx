import { useState } from 'react'
import { Button } from '@/components/ui'

interface Computer {
  id: number
  name: string
  serial: string
  department: string
  status: string
  employee: string | null
}

const ComputersPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [computers] = useState<Computer[]>([])

  const filteredComputers = computers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.serial.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-500/10 text-green-500 border border-green-500/20',
      maintenance: 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20',
      inactive: 'bg-gray-500/10 text-gray-400 border border-gray-500/20',
    }
    const labels = {
      active: 'Đang sử dụng',
      maintenance: 'Bảo trì',
      inactive: 'Không sử dụng',
    }
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white">Quản lý Máy tính</h1>
          <p className="text-gray-500 text-sm mt-1">Danh sách tất cả máy tính trong hệ thống</p>
        </div>
        <Button className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Thêm máy tính
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc serial..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#0f0f0f] border border-[#2e2e2e] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select className="px-4 py-2.5 bg-[#0f0f0f] border border-[#2e2e2e] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang sử dụng</option>
            <option value="maintenance">Bảo trì</option>
            <option value="inactive">Không sử dụng</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2e2e2e]">
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Máy tính</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Serial</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Phòng ban</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Người sử dụng</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th className="text-right px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2e2e2e]">
              {filteredComputers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <svg className="w-12 h-12 mx-auto mb-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-500">Chưa có máy tính nào</p>
                    <p className="text-gray-600 text-sm mt-1">Thêm máy tính mới để bắt đầu</p>
                  </td>
                </tr>
              ) : (
                filteredComputers.map((computer) => (
                  <tr key={computer.id} className="hover:bg-[#2a2a2a] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600/10 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <span className="font-medium text-white">{computer.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-400 font-mono text-sm">{computer.serial}</td>
                    <td className="px-6 py-4 text-gray-400">{computer.department}</td>
                    <td className="px-6 py-4 text-gray-400">{computer.employee || <span className="text-gray-600">Chưa gán</span>}</td>
                    <td className="px-6 py-4">{getStatusBadge(computer.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button className="p-2 text-gray-500 hover:text-yellow-500 hover:bg-yellow-500/10 rounded-lg transition">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-[#2e2e2e] flex items-center justify-between">
          <p className="text-sm text-gray-500">Hiển thị {filteredComputers.length} kết quả</p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-sm text-gray-400 border border-[#2e2e2e] rounded-lg hover:bg-[#2a2a2a] disabled:opacity-50" disabled>
              Trước
            </button>
            <button className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg">1</button>
            <button className="px-3 py-1.5 text-sm text-gray-400 border border-[#2e2e2e] rounded-lg hover:bg-[#2a2a2a] disabled:opacity-50" disabled>
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ComputersPage
