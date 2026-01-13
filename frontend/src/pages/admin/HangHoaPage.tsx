import { useState, useEffect, useCallback } from 'react'
import axios from '@/libs/axios'
import { Button, Input, Card, Select, Badge, Modal, Table, PageHeader, SearchInput } from '@/components/ui'
import { Download, Plus } from 'lucide-react'
import { exportHangHoa } from '@/libs/excel'

type LoaiHang = string

interface HangHoa {
  MaHang: number
  MaTS?: string
  TenHang: string
  LoaiHang: LoaiHang
  Hang?: string
  Model?: string
  NamSX?: number
  TrangThai: string
  ThongTinChiTiet?: string
}

interface LoaiHangOption {
  MaLoai: number
  MaLoaiText: string
  TenLoai: string
}

interface TrangThaiOption {
  MaTrangThai: number
  MaTrangThaiText: string
  TenTrangThai: string
  MauSac?: string
}

// Fallback options nếu API fail
const DEFAULT_LOAI_HANG = [
  { value: 'may_tinh', label: 'Máy tính' },
  { value: 'man_hinh', label: 'Màn hình' },
  { value: 'phim', label: 'Bàn phím' },
  { value: 'chuot', label: 'Chuột' },
  { value: 'dau_chuyen', label: 'Đầu chuyển đổi' },
  { value: 'khac', label: 'Khác' }
]

const DEFAULT_TRANG_THAI = [
  { value: 'Mới', label: 'Mới' },
  { value: 'Đang dùng', label: 'Đang dùng' },
  { value: 'Hỏng', label: 'Hỏng' },
  { value: 'Thanh lý', label: 'Thanh lý' }
]

const HangHoaPage = () => {
  const [hangHoas, setHangHoas] = useState<HangHoa[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<HangHoa | null>(null)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [filterLoai, setFilterLoai] = useState('')
  const [filterTrangThai, setFilterTrangThai] = useState('')
  const [saving, setSaving] = useState(false)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  
  // Dynamic options from API
  const [loaiHangOptions, setLoaiHangOptions] = useState<{value: string, label: string}[]>(DEFAULT_LOAI_HANG)
  const [trangThaiOptions, setTrangThaiOptions] = useState<{value: string, label: string}[]>(DEFAULT_TRANG_THAI)

  // Quick add modals
  const [showAddLoaiModal, setShowAddLoaiModal] = useState(false)
  const [showAddTrangThaiModal, setShowAddTrangThaiModal] = useState(false)
  const [newLoai, setNewLoai] = useState({ MaLoaiText: '', TenLoai: '' })
  const [newTrangThai, setNewTrangThai] = useState({ MaTrangThaiText: '', TenTrangThai: '', MauSac: 'blue' })
  const [savingQuick, setSavingQuick] = useState(false)

  const [formData, setFormData] = useState({
    MaTS: '',
    TenHang: '',
    LoaiHang: 'may_tinh',
    Hang: '',
    Model: '',
    NamSX: '',
    TrangThai: 'Mới',
    ThongTinChiTiet: ''
  })

  // Fetch loại hàng và trạng thái từ API
  const fetchOptions = useCallback(async () => {
    try {
      const [loaiRes, ttRes] = await Promise.all([
        axios.get('/loaihang'),
        axios.get('/trangthai')
      ])
      
      if (loaiRes.data.data && loaiRes.data.data.length > 0) {
        setLoaiHangOptions(loaiRes.data.data.map((item: LoaiHangOption) => ({
          value: item.MaLoaiText,
          label: item.TenLoai
        })))
      }
      
      if (ttRes.data.data && ttRes.data.data.length > 0) {
        setTrangThaiOptions(ttRes.data.data.map((item: TrangThaiOption) => ({
          value: item.TenTrangThai,
          label: item.TenTrangThai
        })))
      }
    } catch (error) {
      console.warn('Không thể load options từ API, sử dụng mặc định')
    }
  }, [])

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const params: any = {}
      if (searchKeyword) params.search = searchKeyword
      if (filterLoai) params.loaiHang = filterLoai
      if (filterTrangThai) params.trangThai = filterTrangThai
      
      const hhRes = await axios.get('/hanghoa', { params })
      setHangHoas(hhRes.data.data || [])
    } catch (error) {
      console.error('Lỗi:', error)
    } finally {
      setLoading(false)
    }
  }, [searchKeyword, filterLoai, filterTrangThai])

  useEffect(() => {
    fetchOptions()
    fetchData()
  }, [filterLoai, filterTrangThai])

  const openAddModal = () => {
    setEditingItem(null)
    setFormData({
      MaTS: '', TenHang: '', LoaiHang: 'may_tinh',
      Hang: '', Model: '', NamSX: '',
      TrangThai: 'Mới', ThongTinChiTiet: ''
    })
    setShowModal(true)
  }

  const openEditModal = (item: HangHoa) => {
    setEditingItem(item)
    setFormData({
      MaTS: item.MaTS || '',
      TenHang: item.TenHang,
      LoaiHang: item.LoaiHang,
      Hang: item.Hang || '',
      Model: item.Model || '',
      NamSX: item.NamSX?.toString() || '',
      TrangThai: item.TrangThai,
      ThongTinChiTiet: item.ThongTinChiTiet || ''
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    try {
      if (!formData.TenHang.trim()) {
        alert('Vui lòng nhập tên hàng hóa')
        return
      }
      setSaving(true)

      const payload = {
        ...formData,
        NamSX: formData.NamSX ? parseInt(formData.NamSX) : null
      }

      if (editingItem) {
        await axios.put(`/hanghoa/${editingItem.MaHang}`, payload)
      } else {
        await axios.post('/hanghoa', payload)
      }
      setShowModal(false)
      fetchData()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (item: HangHoa) => {
    if (!confirm(`Bạn có chắc muốn xóa "${item.TenHang}"?`)) return
    try {
      await axios.delete(`/hanghoa/${item.MaHang}`)
      setSelectedIds(prev => prev.filter(id => id !== item.MaHang))
      fetchData()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra')
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return
    if (!confirm(`Bạn có chắc muốn xóa ${selectedIds.length} hàng hóa đã chọn?`)) return
    
    try {
      await Promise.all(selectedIds.map(id => axios.delete(`/hanghoa/${id}`)))
      setSelectedIds([])
      fetchData()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi xóa')
    }
  }

  const getLoaiHangLabel = (loai: LoaiHang) => loaiHangOptions.find(o => o.value === loai)?.label || loai

  const getTrangThaiBadge = (trangThai: string) => {
    const variants: Record<string, 'success' | 'info' | 'danger' | 'default'> = {
      'Mới': 'success',
      'Đang dùng': 'info',
      'Hỏng': 'danger',
      'Thanh lý': 'default'
    }
    return <Badge variant={variants[trangThai] || 'default'}>{trangThai}</Badge>
  }

  // Quick add Loại hàng
  const handleAddLoaiHang = async () => {
    if (!newLoai.MaLoaiText.trim() || !newLoai.TenLoai.trim()) {
      alert('Vui lòng nhập đầy đủ thông tin')
      return
    }
    try {
      setSavingQuick(true)
      await axios.post('/loaihang', newLoai)
      setShowAddLoaiModal(false)
      setNewLoai({ MaLoaiText: '', TenLoai: '' })
      await fetchOptions() // Refresh options
      setFormData(prev => ({ ...prev, LoaiHang: newLoai.MaLoaiText }))
    } catch (error: any) {
      alert(error.response?.data?.error || 'Có lỗi xảy ra')
    } finally {
      setSavingQuick(false)
    }
  }

  // Quick add Trạng thái
  const handleAddTrangThai = async () => {
    if (!newTrangThai.MaTrangThaiText.trim() || !newTrangThai.TenTrangThai.trim()) {
      alert('Vui lòng nhập đầy đủ thông tin')
      return
    }
    try {
      setSavingQuick(true)
      await axios.post('/trangthai', newTrangThai)
      setShowAddTrangThaiModal(false)
      setNewTrangThai({ MaTrangThaiText: '', TenTrangThai: '', MauSac: 'blue' })
      await fetchOptions() // Refresh options
      setFormData(prev => ({ ...prev, TrangThai: newTrangThai.TenTrangThai }))
    } catch (error: any) {
      alert(error.response?.data?.error || 'Có lỗi xảy ra')
    } finally {
      setSavingQuick(false)
    }
  }

  const columns = [
    { 
      key: 'MaHang', 
      header: 'Mã',
      render: (item: HangHoa) => <span className="text-gray-400">#{item.MaHang}</span>
    },
    { 
      key: 'MaTS', 
      header: 'Mã TS',
      render: (item: HangHoa) => <span className="text-gray-300 font-mono">{item.MaTS || '-'}</span>
    },
    { 
      key: 'TenHang', 
      header: 'Tên hàng hóa',
      render: (item: HangHoa) => (
        <div>
          <p className="text-white font-medium">{item.TenHang}</p>
          <p className="text-gray-500 text-xs">{item.Hang} {item.Model && `/ ${item.Model}`}</p>
        </div>
      )
    },
    { 
      key: 'LoaiHang', 
      header: 'Loại',
      render: (item: HangHoa) => <Badge variant="purple">{getLoaiHangLabel(item.LoaiHang)}</Badge>
    },
    { 
      key: 'TrangThai', 
      header: 'Trạng thái',
      render: (item: HangHoa) => getTrangThaiBadge(item.TrangThai)
    },
    { 
      key: 'actions', 
      header: '',
      headerClassName: 'text-right',
      className: 'text-right',
      render: (item: HangHoa) => (
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
        title="Quản lý Hàng Hóa" 
        subtitle={`Tổng: ${hangHoas.length} hàng hóa`}
        icon={
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        }
        actions={
          <div className="flex gap-3">
            {selectedIds.length > 0 && (
              <Button variant="danger" onClick={handleBulkDelete}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Xóa ({selectedIds.length})
              </Button>
            )}
            <Button variant="secondary" onClick={() => exportHangHoa(hangHoas)}>
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

      {/* Filters */}
      <Card>
        <div className="flex flex-wrap gap-4">
          <SearchInput
            value={searchKeyword}
            onChange={setSearchKeyword}
            onSearch={fetchData}
            placeholder="Tìm theo tên, mã tài sản..."
            className="w-64"
          />
          <Select
            options={loaiHangOptions}
            value={filterLoai}
            onChange={setFilterLoai}
            placeholder="-- Tất cả loại --"
            className="w-48"
          />
          <Select
            options={trangThaiOptions}
            value={filterTrangThai}
            onChange={setFilterTrangThai}
            placeholder="-- Tất cả trạng thái --"
            className="w-48"
          />
          <Button variant="secondary" onClick={fetchData}>
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
          data={hangHoas}
          loading={loading}
          emptyText="Chưa có hàng hóa nào"
          rowKey="MaHang"
          selectable
          selectedIds={selectedIds}
          onSelectChange={(ids) => setSelectedIds(ids as number[])}
        />
      </Card>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingItem ? 'Sửa hàng hóa' : 'Thêm hàng hóa mới'}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Hủy</Button>
            <Button onClick={handleSave} loading={saving}>
              {editingItem ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Mã tài sản"
              value={formData.MaTS}
              onChange={(e) => setFormData({ ...formData, MaTS: e.target.value })}
              placeholder="VD: TS001"
            />
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Loại hàng *</label>
              <div className="flex gap-2">
                <Select
                  options={loaiHangOptions}
                  value={formData.LoaiHang}
                  onChange={(v) => setFormData({ ...formData, LoaiHang: v })}
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={() => setShowAddLoaiModal(true)}
                  className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  title="Thêm loại hàng mới"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <Input
            label="Tên hàng hóa *"
            value={formData.TenHang}
            onChange={(e) => setFormData({ ...formData, TenHang: e.target.value })}
            placeholder="Nhập tên hàng hóa"
          />

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Hãng sản xuất"
              value={formData.Hang}
              onChange={(e) => setFormData({ ...formData, Hang: e.target.value })}
              placeholder="VD: Dell, HP"
            />
            <Input
              label="Model"
              value={formData.Model}
              onChange={(e) => setFormData({ ...formData, Model: e.target.value })}
              placeholder="VD: OptiPlex 3080"
            />
            <Input
              label="Năm SX"
              type="number"
              value={formData.NamSX}
              onChange={(e) => setFormData({ ...formData, NamSX: e.target.value })}
              placeholder="2024"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Trạng thái</label>
            <div className="flex gap-2">
              <Select
                options={trangThaiOptions}
                value={formData.TrangThai}
                onChange={(v) => setFormData({ ...formData, TrangThai: v })}
                className="flex-1"
              />
              <button
                type="button"
                onClick={() => setShowAddTrangThaiModal(true)}
                className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                title="Thêm trạng thái mới"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Thông tin chi tiết</label>
            <textarea
              value={formData.ThongTinChiTiet}
              onChange={(e) => setFormData({ ...formData, ThongTinChiTiet: e.target.value })}
              className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2e2e2e] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              rows={3}
              placeholder="CPU, RAM, SSD, thông số kỹ thuật..."
            />
          </div>
        </div>
      </Modal>

      {/* Quick Add Loại hàng Modal */}
      <Modal
        isOpen={showAddLoaiModal}
        onClose={() => setShowAddLoaiModal(false)}
        title="Thêm loại hàng mới"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAddLoaiModal(false)}>Hủy</Button>
            <Button onClick={handleAddLoaiHang} loading={savingQuick}>Thêm</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Mã loại *"
            value={newLoai.MaLoaiText}
            onChange={(e) => setNewLoai({ ...newLoai, MaLoaiText: e.target.value })}
            placeholder="VD: may_tinh, phu_kien"
          />
          <Input
            label="Tên loại *"
            value={newLoai.TenLoai}
            onChange={(e) => setNewLoai({ ...newLoai, TenLoai: e.target.value })}
            placeholder="VD: Máy tính, Phụ kiện"
          />
        </div>
      </Modal>

      {/* Quick Add Trạng thái Modal */}
      <Modal
        isOpen={showAddTrangThaiModal}
        onClose={() => setShowAddTrangThaiModal(false)}
        title="Thêm trạng thái mới"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAddTrangThaiModal(false)}>Hủy</Button>
            <Button onClick={handleAddTrangThai} loading={savingQuick}>Thêm</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Mã trạng thái *"
            value={newTrangThai.MaTrangThaiText}
            onChange={(e) => setNewTrangThai({ ...newTrangThai, MaTrangThaiText: e.target.value })}
            placeholder="VD: moi, dang_dung"
          />
          <Input
            label="Tên trạng thái *"
            value={newTrangThai.TenTrangThai}
            onChange={(e) => setNewTrangThai({ ...newTrangThai, TenTrangThai: e.target.value })}
            placeholder="VD: Mới, Đang dùng"
          />
          <Select
            label="Màu sắc"
            options={[
              { value: 'blue', label: 'Xanh dương' },
              { value: 'green', label: 'Xanh lá' },
              { value: 'red', label: 'Đỏ' },
              { value: 'yellow', label: 'Vàng' },
              { value: 'purple', label: 'Tím' },
              { value: 'gray', label: 'Xám' }
            ]}
            value={newTrangThai.MauSac}
            onChange={(v) => setNewTrangThai({ ...newTrangThai, MauSac: v })}
          />
        </div>
      </Modal>
    </div>
  )
}

export default HangHoaPage
