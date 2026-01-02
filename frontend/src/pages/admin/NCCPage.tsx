import { useState, useEffect } from 'react'
import axios from '@/libs/axios'
import { Button, Input, Card, Modal, Table, PageHeader, SearchInput } from '@/components/ui'
import { Download } from 'lucide-react'
import { exportNCC } from '@/libs/excel'

interface NCC {
  MaNCC: number
  TenNCC: string
  DiaChi?: string
  SoDienThoai?: string
  Email?: string
  NguoiLienHe?: string
  GhiChu?: string
}

const NCCPage = () => {
  const [nccs, setNccs] = useState<NCC[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingNcc, setEditingNcc] = useState<NCC | null>(null)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    TenNCC: '',
    DiaChi: '',
    SoDienThoai: '',
    Email: '',
    NguoiLienHe: '',
    GhiChu: ''
  })

  const fetchNccs = async () => {
    try {
      setLoading(true)
      const params = searchKeyword ? { search: searchKeyword } : {}
      const res = await axios.get('/ncc', { params })
      setNccs(res.data.data || [])
    } catch (error) {
      console.error('Lỗi lấy danh sách NCC:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNccs()
  }, [])

  const openAddModal = () => {
    setEditingNcc(null)
    setFormData({
      TenNCC: '',
      DiaChi: '',
      SoDienThoai: '',
      Email: '',
      NguoiLienHe: '',
      GhiChu: ''
    })
    setShowModal(true)
  }

  const openEditModal = (ncc: NCC) => {
    setEditingNcc(ncc)
    setFormData({
      TenNCC: ncc.TenNCC,
      DiaChi: ncc.DiaChi || '',
      SoDienThoai: ncc.SoDienThoai || '',
      Email: ncc.Email || '',
      NguoiLienHe: ncc.NguoiLienHe || '',
      GhiChu: ncc.GhiChu || ''
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    try {
      if (!formData.TenNCC.trim()) {
        alert('Vui lòng nhập tên nhà cung cấp')
        return
      }
      setSaving(true)

      if (editingNcc) {
        await axios.put(`/ncc/${editingNcc.MaNCC}`, formData)
      } else {
        await axios.post('/ncc', formData)
      }
      setShowModal(false)
      fetchNccs()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (ncc: NCC) => {
    if (!confirm(`Bạn có chắc muốn xóa "${ncc.TenNCC}"?`)) return
    try {
      await axios.delete(`/ncc/${ncc.MaNCC}`)
      fetchNccs()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra')
    }
  }

  const columns = [
    { 
      key: 'MaNCC', 
      header: 'Mã',
      render: (item: NCC) => <span className="text-gray-400">#{item.MaNCC}</span>
    },
    { 
      key: 'TenNCC', 
      header: 'Tên nhà cung cấp',
      render: (item: NCC) => (
        <div>
          <p className="text-white font-medium">{item.TenNCC}</p>
          {item.NguoiLienHe && (
            <p className="text-gray-500 text-xs flex items-center mt-1">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {item.NguoiLienHe}
            </p>
          )}
        </div>
      )
    },
    { 
      key: 'SoDienThoai', 
      header: 'Số điện thoại',
      render: (item: NCC) => (
        <span className="text-gray-300 flex items-center">
          {item.SoDienThoai ? (
            <>
              <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {item.SoDienThoai}
            </>
          ) : '-'}
        </span>
      )
    },
    { 
      key: 'Email', 
      header: 'Email',
      render: (item: NCC) => (
        <span className="text-gray-300 flex items-center">
          {item.Email ? (
            <>
              <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {item.Email}
            </>
          ) : '-'}
        </span>
      )
    },
    { 
      key: 'DiaChi', 
      header: 'Địa chỉ',
      render: (item: NCC) => (
        <span className="text-gray-400 text-sm line-clamp-2">{item.DiaChi || '-'}</span>
      )
    },
    { 
      key: 'actions', 
      header: '',
      headerClassName: 'text-right',
      className: 'text-right',
      render: (item: NCC) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); openEditModal(item) }}
            className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
            title="Sửa"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDelete(item) }}
            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            title="Xóa"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Quản lý Nhà Cung Cấp" 
        subtitle={`Tổng: ${nccs.length} nhà cung cấp`}
        actions={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => exportNCC(nccs)}>
              <Download className="w-4 h-4 mr-2" />
              Xuất Excel
            </Button>
            <Button onClick={openAddModal}>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Thêm mới
            </Button>
          </div>
        }
      />

      {/* Search */}
      <Card>
        <div className="flex gap-4">
          <SearchInput
            value={searchKeyword}
            onChange={setSearchKeyword}
            onSearch={fetchNccs}
            placeholder="Tìm theo tên, địa chỉ, SĐT, email..."
            className="flex-1 max-w-md"
          />
          <Button variant="secondary" onClick={fetchNccs}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Làm mới
          </Button>
        </div>
      </Card>

      {/* Table */}
      <Card noPadding>
        <Table
          columns={columns}
          data={nccs}
          loading={loading}
          emptyText="Chưa có nhà cung cấp nào"
          rowKey="MaNCC"
        />
      </Card>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingNcc ? 'Sửa nhà cung cấp' : 'Thêm nhà cung cấp mới'}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Hủy</Button>
            <Button onClick={handleSave} loading={saving}>
              {editingNcc ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Tên nhà cung cấp *"
            value={formData.TenNCC}
            onChange={(e) => setFormData({ ...formData, TenNCC: e.target.value })}
            placeholder="Nhập tên nhà cung cấp"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Số điện thoại"
              value={formData.SoDienThoai}
              onChange={(e) => setFormData({ ...formData, SoDienThoai: e.target.value })}
              placeholder="0123456789"
            />
            <Input
              label="Email"
              type="email"
              value={formData.Email}
              onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
              placeholder="email@example.com"
            />
          </div>

          <Input
            label="Người liên hệ"
            value={formData.NguoiLienHe}
            onChange={(e) => setFormData({ ...formData, NguoiLienHe: e.target.value })}
            placeholder="Họ tên người liên hệ"
          />

          <Input
            label="Địa chỉ"
            value={formData.DiaChi}
            onChange={(e) => setFormData({ ...formData, DiaChi: e.target.value })}
            placeholder="Địa chỉ nhà cung cấp"
          />

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Ghi chú</label>
            <textarea
              value={formData.GhiChu}
              onChange={(e) => setFormData({ ...formData, GhiChu: e.target.value })}
              className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2e2e2e] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              rows={3}
              placeholder="Ghi chú thêm về nhà cung cấp..."
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default NCCPage
