import { useState, useEffect } from 'react'
import api from '@/libs/axios'
import { Download, Plus } from 'lucide-react'
import { exportDepartments } from '@/libs/excel'

interface Department {
  maPB: number
  maPBText: string
  tenPB: string
  moTa: string
  ngayTao: string
}

const DepartmentsPage = () => {
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  
  // Form state
  const [maPBText, setMaPBText] = useState('')
  const [tenPB, setTenPB] = useState('')
  const [moTa, setMoTa] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await api.get('/departments')
      setDepartments(res.data?.data || [])
    } catch (error) {
      console.error('Error fetching departments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!maPBText.trim()) {
      alert('Vui lòng nhập mã phòng ban')
      return
    }
    if (!tenPB.trim()) {
      alert('Vui lòng nhập tên phòng ban')
      return
    }
    
    try {
      setSubmitting(true)
      const data = { maPBText, tenPB, moTa }
      
      if (editingId) {
        await api.put(`/departments/${editingId}`, data)
      } else {
        await api.post('/departments', data)
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

  const handleEdit = (item: Department) => {
    setEditingId(item.maPB)
    setMaPBText(item.maPBText || '')
    setTenPB(item.tenPB || '')
    setMoTa(item.moTa || '')
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa phòng ban này?')) return
    
    try {
      await api.delete(`/departments/${id}`)
      fetchData()
    } catch (error: any) {
      alert(error.response?.data?.error || 'Có lỗi xảy ra')
    }
  }

  const resetForm = () => {
    setEditingId(null)
    setMaPBText('')
    setTenPB('')
    setMoTa('')
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
          <h1 className="text-xl font-semibold text-white">Phòng ban</h1>
          <p className="text-gray-500 text-sm mt-1">Quản lý danh sách phòng ban trong công ty</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => exportDepartments(departments.map(d => ({ MaPB: d.maPBText, TenPB: d.tenPB, MoTa: d.moTa })))}
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
            Thêm phòng ban
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2e2e2e] bg-[#0f0f0f]">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Mã PB</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Tên phòng ban</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Mô tả</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-400 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2e2e2e]">
              {departments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center">
                    <svg className="w-12 h-12 mx-auto mb-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <p className="text-gray-400 font-medium">Chưa có phòng ban nào</p>
                    <p className="text-gray-500 text-sm mt-1">Nhấn "Thêm phòng ban" để tạo mới</p>
                  </td>
                </tr>
              ) : (
                departments.map((item) => (
                  <tr key={item.maPB} className="hover:bg-[#252525] transition">
                    <td className="px-4 py-3 text-sm text-gray-300 font-mono">{item.maPBText}</td>
                    <td className="px-4 py-3 text-sm text-white font-medium">{item.tenPB}</td>
                    <td className="px-4 py-3 text-sm text-gray-400">{item.moTa || '-'}</td>
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
                        onClick={() => handleDelete(item.maPB)}
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
              {editingId ? 'Sửa phòng ban' : 'Thêm phòng ban mới'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Mã phòng ban *</label>
                <input
                  type="text"
                  value={maPBText}
                  onChange={(e) => setMaPBText(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 bg-[#0f0f0f] border border-[#2e2e2e] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 font-mono"
                  placeholder="VD: IT, KT, NS, GD..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Tên phòng ban *</label>
                <input
                  type="text"
                  value={tenPB}
                  onChange={(e) => setTenPB(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0f0f0f] border border-[#2e2e2e] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  placeholder="Nhập tên phòng ban"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Mô tả</label>
                <textarea
                  value={moTa}
                  onChange={(e) => setMoTa(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-[#0f0f0f] border border-[#2e2e2e] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
                  placeholder="Nhập mô tả"
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

export default DepartmentsPage
