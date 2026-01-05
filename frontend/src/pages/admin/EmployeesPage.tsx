import { useState, useEffect } from 'react'
import api from '@/libs/axios'
import { Download, Plus } from 'lucide-react'
import { exportEmployees } from '@/libs/excel'

interface Employee {
  maNV: number
  maNVText: string
  tenNV: string
  email: string
  soDienThoai: string
  maPB: number
  tenPB: string
  ngayBDLV: string
  ngayTao: string
}

interface Department {
  maPB: number
  tenPB: string
}

const EmployeesPage = () => {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  
  // Form state
  const [maNVText, setMaNVText] = useState('')
  const [tenNV, setTenNV] = useState('')
  const [email, setEmail] = useState('')
  const [soDienThoai, setSoDienThoai] = useState('')
  const [maPB, setMaPB] = useState('')
  const [ngayBDLV, setNgayBDLV] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [empRes, deptRes] = await Promise.all([
        api.get('/employees'),
        api.get('/departments')
      ])
      setEmployees(empRes.data?.data || [])
      setDepartments(deptRes.data?.data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!maNVText.trim()) {
      alert('Vui lòng nhập mã nhân viên')
      return
    }
    if (!tenNV.trim()) {
      alert('Vui lòng nhập tên nhân viên')
      return
    }
    
    try {
      setSubmitting(true)
      const data = { maNVText, tenNV, email, soDienThoai, maPB: maPB || null, ngayBDLV: ngayBDLV || null }
      
      if (editingId) {
        await api.put(`/employees/${editingId}`, data)
      } else {
        // Tạo mới nhân viên với mật khẩu mặc định
        const result = await api.post('/employees', data)
        if (result.data?.data?.matKhauMacDinh) {
          alert(`Tạo nhân viên thành công!\n\nTài khoản: ${result.data.data.username}\nMật khẩu mặc định: ${result.data.data.matKhauMacDinh}\n\nNhân viên có thể đổi mật khẩu sau khi đăng nhập.`)
        }
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

  const handleEdit = (item: Employee) => {
    setEditingId(item.maNV)
    setMaNVText(item.maNVText || '')
    setTenNV(item.tenNV || '')
    setEmail(item.email || '')
    setSoDienThoai(item.soDienThoai || '')
    setMaPB(item.maPB?.toString() || '')
    setNgayBDLV(item.ngayBDLV ? item.ngayBDLV.split('T')[0] : '')
    setShowModal(true)
  }

  const handleViewAccount = (item: Employee) => {
    const username = item.maNVText?.toLowerCase() || ''
    alert(`📋 THÔNG TIN TÀI KHOẢN\n\nNhân viên: ${item.tenNV}\nMã NV: ${item.maNVText}\nPhòng ban: ${item.tenPB || 'Chưa có'}\n\n📌 TÀI KHOẢN ĐĂNG NHẬP:\nUsername: ${username}\nMật khẩu mặc định: ${username}@123\n\n(Nhân viên có thể đổi mật khẩu sau khi đăng nhập)`)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa nhân viên này?')) return
    
    try {
      await api.delete(`/employees/${id}`)
      fetchData()
    } catch (error: any) {
      alert(error.response?.data?.error || 'Có lỗi xảy ra')
    }
  }

  const resetForm = () => {
    setEditingId(null)
    setMaNVText('')
    setTenNV('')
    setEmail('')
    setSoDienThoai('')
    setMaPB('')
    setNgayBDLV('')
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
          <h1 className="text-xl font-semibold text-white">Nhân viên</h1>
          <p className="text-gray-500 text-sm mt-1">Quản lý danh sách nhân viên trong công ty</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => exportEmployees(employees.map(e => ({ MaNV: e.maNV, TenNV: e.tenNV, MaPB: e.maPB, TenPB: e.tenPB, NgayBDLV: e.ngayBDLV, Email: e.email, SoDienThoai: e.soDienThoai })))}
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
            Thêm nhân viên
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2e2e2e] bg-[#0f0f0f]">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Mã NV</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Họ tên</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Phòng ban</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Ngày BĐLV</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Email</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">SĐT</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-400 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2e2e2e]">
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <svg className="w-12 h-12 mx-auto mb-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="text-gray-400 font-medium">Chưa có nhân viên nào</p>
                    <p className="text-gray-500 text-sm mt-1">Nhấn "Thêm nhân viên" để tạo mới</p>
                  </td>
                </tr>
              ) : (
                employees.map((item) => (
                  <tr key={item.maNV} className="hover:bg-[#252525] transition">
                    <td className="px-4 py-3 text-sm text-gray-300 font-mono">{item.maNVText || `#${item.maNV}`}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                          {item.tenNV?.charAt(0)?.toUpperCase()}
                        </div>
                        <span className="text-sm text-white font-medium">{item.tenNV}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {item.tenPB ? (
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                          {item.tenPB}
                        </span>
                      ) : (
                        <span className="text-gray-500 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {item.ngayBDLV ? new Date(item.ngayBDLV).toLocaleDateString('vi-VN') : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">{item.email || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-400">{item.soDienThoai || '-'}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleViewAccount(item)}
                        className="p-1.5 text-gray-400 hover:text-yellow-400 transition"
                        title="Xem tài khoản"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                      </button>
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
                        onClick={() => handleDelete(item.maNV)}
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
              {editingId ? 'Sửa nhân viên' : 'Thêm nhân viên mới'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Mã nhân viên *</label>
                <input
                  type="text"
                  value={maNVText}
                  onChange={(e) => setMaNVText(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 bg-[#0f0f0f] border border-[#2e2e2e] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 font-mono"
                  placeholder="VD: NV001, IT001..."
                />
                {!editingId && (
                  <p className="text-xs text-gray-500 mt-1">Mã nhân viên cũng là tên tài khoản đăng nhập</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Họ tên *</label>
                <input
                  type="text"
                  value={tenNV}
                  onChange={(e) => setTenNV(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0f0f0f] border border-[#2e2e2e] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  placeholder="Nhập họ tên"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0f0f0f] border border-[#2e2e2e] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  placeholder="Nhập email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Số điện thoại</label>
                <input
                  type="text"
                  value={soDienThoai}
                  onChange={(e) => setSoDienThoai(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0f0f0f] border border-[#2e2e2e] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  placeholder="Nhập số điện thoại"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Phòng ban</label>
                <select
                  value={maPB}
                  onChange={(e) => setMaPB(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0f0f0f] border border-[#2e2e2e] rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">-- Chọn phòng ban --</option>
                  {departments.map(dept => (
                    <option key={dept.maPB} value={dept.maPB}>{dept.tenPB}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Ngày bắt đầu làm việc</label>
                <input
                  type="date"
                  value={ngayBDLV}
                  onChange={(e) => setNgayBDLV(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0f0f0f] border border-[#2e2e2e] rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              {!editingId && (
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-yellow-400 text-sm">
                    <strong>Lưu ý:</strong> Mật khẩu mặc định sẽ được tạo tự động. Nhân viên có thể đổi mật khẩu sau khi đăng nhập.
                  </p>
                </div>
              )}
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

export default EmployeesPage
