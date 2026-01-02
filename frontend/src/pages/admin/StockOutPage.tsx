import { useState, useEffect } from 'react'
import axios from '@/libs/axios'
import { Button, Card, Badge, Modal, Table, PageHeader, SearchInput, SelectWithAdd, AddHangHoaModal, AddKhoModal, AddNhanVienModal } from '@/components/ui'
import { Download } from 'lucide-react'
import { exportStockOut } from '@/libs/excel'

interface XuatHang {
  MaXuat: number
  SoPhieuX: string
  NgayXuat: string
  MaHang: number
  TenHang?: string
  MaKho: number
  TenKho?: string
  NguoiGiao: number
  TenNguoiGiao?: string
  NguoiNhan: number
  TenNguoiNhan?: string
  DienGiai?: string
}

interface HangHoa { MaHang: number; TenHang: string }
interface Kho { maKho: number; tenKho: string }
interface NhanVien { maNV: number; tenNV: string }

const StockOutPage = () => {
  const [items, setItems] = useState<XuatHang[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [saving, setSaving] = useState(false)
  
  const [hangHoas, setHangHoas] = useState<HangHoa[]>([])
  const [khos, setKhos] = useState<Kho[]>([])
  const [nhanViens, setNhanViens] = useState<NhanVien[]>([])
  const [soPhieuMoi, setSoPhieuMoi] = useState('')
  const [tonKho, setTonKho] = useState<number | null>(null)

  // State cho các modal thêm mới
  const [showAddHangHoa, setShowAddHangHoa] = useState(false)
  const [showAddKho, setShowAddKho] = useState(false)
  const [showAddNhanVien, setShowAddNhanVien] = useState(false)

  const [formData, setFormData] = useState({
    NgayXuat: new Date().toISOString().split('T')[0],
    MaHang: '',
    MaKho: '',
    NguoiGiao: '',
    NguoiNhan: '',
    DienGiai: ''
  })

  const fetchData = async () => {
    try {
      setLoading(true)
      const params = searchKeyword ? { search: searchKeyword } : {}
      const [xhRes, hhRes, khoRes, nvRes] = await Promise.all([
        axios.get('/stock/xuathang', { params }),
        axios.get('/hanghoa'), // Lấy tất cả hàng hóa
        axios.get('/warehouses'),
        axios.get('/employees')
      ])
      
      setItems(xhRes.data.data || [])
      setHangHoas(hhRes.data.data || [])
      setKhos(khoRes.data.data || [])
      setNhanViens(nvRes.data.data || [])
    } catch (error) {
      console.error('Lỗi:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const openAddModal = async () => {
    try {
      const res = await axios.get('/stock/xuathang/sophieu')
      setSoPhieuMoi(res.data.data.soPhieu)
    } catch {
      setSoPhieuMoi('')
    }
    setEditingId(null)
    setFormData({
      NgayXuat: new Date().toISOString().split('T')[0],
      MaHang: '',
      MaKho: '',
      NguoiGiao: '',
      NguoiNhan: '',
      DienGiai: ''
    })
    setShowModal(true)
  }

  const handleEdit = (item: XuatHang) => {
    setEditingId(item.MaXuat)
    setSoPhieuMoi(item.SoPhieuX)
    setFormData({
      NgayXuat: item.NgayXuat ? item.NgayXuat.split('T')[0] : new Date().toISOString().split('T')[0],
      MaHang: item.MaHang?.toString() || '',
      MaKho: item.MaKho?.toString() || '',
      NguoiGiao: item.NguoiGiao?.toString() || '',
      NguoiNhan: item.NguoiNhan?.toString() || '',
      DienGiai: item.DienGiai || ''
    })
    setShowModal(true)
  }

  // Khi chọn hàng hóa
  const handleSelectHangHoa = (maHang: string) => {
    setFormData({ ...formData, MaHang: maHang, MaKho: '' })
    setTonKho(null)
  }

  // Khi chọn kho, check tồn kho
  const handleSelectKho = async (maKho: string) => {
    setFormData({ ...formData, MaKho: maKho })
    
    if (formData.MaHang && maKho) {
      try {
        const res = await axios.get(`/stock/tonkho/${formData.MaHang}/${maKho}`)
        setTonKho(res.data.data.ton)
      } catch {
        setTonKho(0)
      }
    } else {
      setTonKho(null)
    }
  }

  const handleSave = async () => {
    try {
      if (!formData.MaHang || !formData.MaKho) {
        alert('Vui lòng chọn hàng hóa và kho')
        return
      }

      // Kiểm tra tồn kho trước khi xuất
      if (tonKho !== null && tonKho <= 0) {
        const tenHang = hangHoas.find(h => h.MaHang === parseInt(formData.MaHang))?.TenHang
        const tenKho = khos.find(k => k.maKho === parseInt(formData.MaKho))?.tenKho
        alert(`Mặt hàng "${tenHang}" đã hết trong kho "${tenKho}"!\nTồn hiện tại: ${tonKho}`)
        return
      }

      setSaving(true)
      const payload = {
        NgayXuat: formData.NgayXuat,
        MaHang: parseInt(formData.MaHang),
        MaKho: parseInt(formData.MaKho),
        NguoiGiao: formData.NguoiGiao ? parseInt(formData.NguoiGiao) : null,
        NguoiNhan: formData.NguoiNhan ? parseInt(formData.NguoiNhan) : null,
        DienGiai: formData.DienGiai || null
      }

      if (editingId) {
        await axios.put(`/stock/xuathang/${editingId}`, payload)
      } else {
        await axios.post('/stock/xuathang', payload)
      }
      
      setShowModal(false)
      fetchData()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (item: XuatHang) => {
    if (!confirm(`Bạn có chắc muốn xóa phiếu "${item.SoPhieuX}"?`)) return
    try {
      await axios.delete(`/stock/xuathang/${item.MaXuat}`)
      fetchData()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra')
    }
  }

  // Callback khi tạo mới thành công từ Modal
  const onHangHoaCreated = (newItem: any) => {
    setHangHoas(prev => [...prev, newItem])
    setFormData(prev => ({ ...prev, MaHang: String(newItem.MaHang) }))
  }

  const onKhoCreated = (newItem: any) => {
    setKhos(prev => [...prev, newItem])
    setFormData(prev => ({ ...prev, MaKho: String(newItem.maKho) }))
  }

  const onNhanVienCreated = (newItem: any) => {
    setNhanViens(prev => [...prev, newItem])
    // Không tự động chọn vì có 2 field NguoiGiao và NguoiNhan
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN')
  }

  const columns = [
    { 
      key: 'SoPhieuX', 
      header: 'Số phiếu',
      render: (item: XuatHang) => (
        <Badge variant="danger" className="font-mono">{item.SoPhieuX}</Badge>
      )
    },
    { 
      key: 'NgayXuat', 
      header: 'Ngày xuất',
      render: (item: XuatHang) => <span className="text-gray-300">{formatDate(item.NgayXuat)}</span>
    },
    { 
      key: 'TenHang', 
      header: 'Hàng hóa',
      render: (item: XuatHang) => <span className="text-white font-medium">{item.TenHang}</span>
    },
    { 
      key: 'TenKho', 
      header: 'Từ kho',
      render: (item: XuatHang) => <span className="text-gray-300">{item.TenKho}</span>
    },
    { 
      key: 'TenNguoiGiao', 
      header: 'Người giao (NV)',
      render: (item: XuatHang) => (
        <div className="flex items-center">
          <svg className="w-4 h-4 mr-2 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="text-gray-300">{item.TenNguoiGiao || '-'}</span>
        </div>
      )
    },
    { 
      key: 'TenNguoiNhan', 
      header: 'Người nhận (NV)',
      render: (item: XuatHang) => (
        <div className="flex items-center">
          <svg className="w-4 h-4 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
          <span className="text-gray-300">{item.TenNguoiNhan || '-'}</span>
        </div>
      )
    },
    { 
      key: 'actions', 
      header: '',
      headerClassName: 'text-right',
      className: 'text-right',
      render: (item: XuatHang) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); handleEdit(item) }}
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
        title="Xuất Hàng" 
        subtitle={`Tổng: ${items.length} phiếu xuất`}
        icon={
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4m-2-2v4" />
          </svg>
        }
        actions={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => exportStockOut(items.map(i => ({
              MaXuat: i.MaXuat,
              TenHang: i.TenHang,
              TenKho: i.TenKho,
              TenNV: i.TenNguoiNhan,
              SoLuong: 1,
              NgayXuat: i.NgayXuat,
              NguoiNhan: i.TenNguoiNhan,
              LyDo: i.DienGiai
            })))}>
              <Download className="w-4 h-4 mr-2" />
              Xuất Excel
            </Button>
            <Button onClick={openAddModal}>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Tạo phiếu xuất
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
            onSearch={fetchData}
            placeholder="Tìm theo số phiếu, tên hàng..."
            className="flex-1 max-w-md"
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
          data={items}
          loading={loading}
          emptyText="Chưa có phiếu xuất hàng"
          rowKey="MaXuat"
        />
      </Card>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? "Sửa phiếu xuất hàng" : "Tạo phiếu xuất hàng"}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Hủy</Button>
            <Button onClick={handleSave} loading={saving}>{editingId ? 'Cập nhật' : 'Lưu phiếu'}</Button>
          </>
        }
      >
        <div className="space-y-5">
          {/* Số phiếu tự động */}
          <div className="p-4 bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Số phiếu xuất</span>
              <span className="text-red-400 font-mono font-bold text-lg">{soPhieuMoi}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Ngày xuất *</label>
            <input
              type="date"
              value={formData.NgayXuat}
              onChange={(e) => setFormData({ ...formData, NgayXuat: e.target.value })}
              className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2e2e2e] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <SelectWithAdd
            label="Hàng hóa *"
            options={hangHoas.map(h => ({ value: h.MaHang, label: h.TenHang }))}
            value={formData.MaHang}
            onChange={handleSelectHangHoa}
            placeholder="Chọn hàng hóa..."
            onAddClick={() => setShowAddHangHoa(true)}
            addTitle="Thêm hàng hóa mới"
          />

          <SelectWithAdd
            label="Từ kho *"
            options={khos.map(k => ({ value: k.maKho, label: k.tenKho }))}
            value={formData.MaKho}
            onChange={handleSelectKho}
            placeholder="Chọn kho..."
            onAddClick={() => setShowAddKho(true)}
            addTitle="Thêm kho mới"
          />

          {/* Hiển thị tồn kho */}
          {tonKho !== null && (
            <div className={`p-3 rounded-lg border ${
              tonKho > 0 
                ? 'bg-green-500/10 border-green-500/30' 
                : 'bg-red-500/10 border-red-500/30'
            }`}>
              <div className="flex items-center gap-2">
                {tonKho > 0 ? (
                  <>
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-green-400">Tồn kho: <strong>{tonKho}</strong> - Có thể xuất</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-red-400"><strong>Hết hàng trong kho này!</strong> Tồn: {tonKho}</span>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <SelectWithAdd
              label="Người giao (NV kho)"
              options={nhanViens.map(nv => ({ value: nv.maNV, label: nv.tenNV }))}
              value={formData.NguoiGiao}
              onChange={(v) => setFormData({ ...formData, NguoiGiao: v })}
              placeholder="Chọn nhân viên..."
              onAddClick={() => setShowAddNhanVien(true)}
              addTitle="Thêm nhân viên mới"
            />
            <SelectWithAdd
              label="Người nhận (NV)"
              options={nhanViens.map(nv => ({ value: nv.maNV, label: nv.tenNV }))}
              value={formData.NguoiNhan}
              onChange={(v) => setFormData({ ...formData, NguoiNhan: v })}
              placeholder="Chọn nhân viên..."
              onAddClick={() => setShowAddNhanVien(true)}
              addTitle="Thêm nhân viên mới"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Diễn giải</label>
            <textarea
              value={formData.DienGiai}
              onChange={(e) => setFormData({ ...formData, DienGiai: e.target.value })}
              className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2e2e2e] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              rows={3}
              placeholder="Ghi chú thêm..."
            />
          </div>
        </div>
      </Modal>

      {/* Các Modal thêm mới */}
      <AddHangHoaModal 
        isOpen={showAddHangHoa} 
        onClose={() => setShowAddHangHoa(false)} 
        onSuccess={onHangHoaCreated} 
      />
      <AddKhoModal 
        isOpen={showAddKho} 
        onClose={() => setShowAddKho(false)} 
        onSuccess={onKhoCreated} 
      />
      <AddNhanVienModal 
        isOpen={showAddNhanVien} 
        onClose={() => setShowAddNhanVien(false)} 
        onSuccess={onNhanVienCreated} 
      />
    </div>
  )
}

export default StockOutPage
