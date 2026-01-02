import { useState, useEffect } from 'react'
import api from '@/libs/axios'
import { Download, Plus } from 'lucide-react'
import { exportWarehouses } from '@/libs/excel'

interface Warehouse {
  maKho: number
  maKhoText: string
  tenKho: string
  diaChi: string
  ngayTao: string
}

const WarehousesPage = () => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  
  // Form state
  const [maKhoText, setMaKhoText] = useState('')
  const [tenKho, setTenKho] = useState('')
  const [diaChi, setDiaChi] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await api.get('/warehouses')
      setWarehouses(res.data?.data || [])
    } catch (error) {
      console.error('Error fetching warehouses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!maKhoText.trim()) {
      alert('Vui lòng nhập mã kho')
      return
    }
    if (!tenKho.trim()) {
      alert('Vui lòng nhập tên kho')
      return
    }
    
    try {
      setSubmitting(true)
      const data = { MaKhoText: maKhoText, TenKho: tenKho, DiaChi: diaChi }
      
      if (editingId) {
        await api.put(`/warehouses/${editingId}`, data)
      } else {
        await api.post('/warehouses', data)
      }
      setShowModal(false)
      resetForm()
      fetchData()
    } catch (error: any) {
      alert(error.response?.data?.error || 'Có lỗi xảy ra')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (item: Warehouse) => {
    setEditingId(item.maKho)
    setMaKhoText(item.maKhoText || '')
    setTenKho(item.tenKho || '')
    setDiaChi(item.diaChi || '')
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa kho này?')) return
    
    try {
      await api.delete(`/warehouses/${id}`)
      fetchData()
    } catch (error: any) {
      alert(error.response?.data?.error || 'Có lỗi xảy ra')
    }
  }

  const resetForm = () => {
    setEditingId(null)
    setMaKhoText('')
    setTenKho('')
    setDiaChi('')
  }

  const openAddModal = () => {
    resetForm()
    setShowModal(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white">Quản lý kho</h1>
          <p className="text-gray-500 text-sm mt-1">Danh sách các kho lưu trữ thiết bị</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => exportWarehouses(warehouses.map(w => ({ MaKho: w.maKhoText, TenKho: w.tenKho, DiaChi: w.diaChi })))}
            className="flex items-center gap-2 px-4 py-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-gray-300 rounded-lg transition"
          >
            <Download className="w-4 h-4" />
            Xuất Excel
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          >
            <Plus className="w-4 h-4" />
            Thêm kho
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2e2e2e] bg-[#0f0f0f]">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Mã kho</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Tên kho</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Địa chỉ</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-400 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2e2e2e]">
              {warehouses.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center">
                    <svg className="w-12 h-12 mx-auto mb-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <p className="text-gray-400 font-medium">Chưa có kho nào</p>
                    <p className="text-gray-500 text-sm mt-1">Nhấn "Thêm kho" để tạo kho mới</p>
                  </td>
                </tr>
              ) : (
                warehouses.map((item) => (
                  <tr key={item.maKho} className="hover:bg-[#252525] transition">
                    <td className="px-4 py-3 text-sm text-gray-300 font-mono">{item.maKhoText}</td>
                    <td className="px-4 py-3 text-sm text-white font-medium">{item.tenKho}</td>
                    <td className="px-4 py-3 text-sm text-gray-400">{item.diaChi || '-'}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-1.5 text-gray-400 hover:text-blue-400 transition"
                        title="Sửa"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(item.maKho)}
                        className="p-1.5 text-gray-400 hover:text-red-400 transition ml-1"
                        title="Xóa"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70" onClick={() => setShowModal(false)} />
          <div className="relative bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              {editingId ? 'Sửa kho' : 'Thêm kho mới'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Mã kho *</label>
                <input
                  type="text"
                  value={maKhoText}
                  onChange={(e) => setMaKhoText(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 bg-[#0f0f0f] border border-[#2e2e2e] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 font-mono"
                  placeholder="VD: KHO01, KHOHCM..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Tên kho *</label>
                <input
                  type="text"
                  value={tenKho}
                  onChange={(e) => setTenKho(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0f0f0f] border border-[#2e2e2e] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  placeholder="Nhập tên kho"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Địa chỉ</label>
                <input
                  type="text"
                  value={diaChi}
                  onChange={(e) => setDiaChi(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0f0f0f] border border-[#2e2e2e] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  placeholder="Nhập địa chỉ kho"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-[#2e2e2e] hover:bg-[#3e3e3e] text-white rounded-lg transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition"
                >
                  {submitting ? 'Đang xử lý...' : (editingId ? 'Cập nhật' : 'Thêm')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default WarehousesPage
