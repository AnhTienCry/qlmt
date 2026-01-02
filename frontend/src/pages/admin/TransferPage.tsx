import { useState, useEffect } from 'react'
import axios from '@/libs/axios'
import { Button, Card, Badge, Modal, Select, Table, PageHeader, SearchInput } from '@/components/ui'
import { Download } from 'lucide-react'
import { exportTransfer } from '@/libs/excel'

interface DieuChuyen {
  MaDC: number
  SoPhieuDC: string
  NgayDC: string
  MaHang: number
  TenHang?: string
  NguoiGiao?: number
  TenNVGiao?: string
  NguoiNhan?: number
  TenNVNhan?: string
  DienGiai?: string
}

interface HangHoa {
  MaHang: number
  TenHang: string
  TenNV?: string
  MaNV_DangDung?: number
}

interface NhanVien {
  maNV: number
  tenNV: string
}

const TransferPage = () => {
  const [items, setItems] = useState<DieuChuyen[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [saving, setSaving] = useState(false)
  
  const [hangHoas, setHangHoas] = useState<HangHoa[]>([])
  const [nhanViens, setNhanViens] = useState<NhanVien[]>([])
  const [soPhieuMoi, setSoPhieuMoi] = useState('')

  const [formData, setFormData] = useState({
    NgayDC: new Date().toISOString().split('T')[0],
    MaHang: '',
    NguoiGiao: '',
    NguoiNhan: '',
    DienGiai: ''
  })

  const fetchData = async () => {
    try {
      setLoading(true)
      const params = searchKeyword ? { search: searchKeyword } : {}
      const [dcRes, hhRes, nvRes] = await Promise.all([
        axios.get('/transfer', { params }),
        axios.get('/stock/hangdaxuat'), // Lấy từ bảng Xuất - chỉ hàng đã xuất mới điều chuyển được
        axios.get('/employees')
      ])
      
      setItems(dcRes.data.data || [])
      // Map lại dữ liệu cho phù hợp với interface HangHoa
      setHangHoas((hhRes.data.data || []).map((h: any) => ({
        MaHang: h.MaHang,
        TenHang: h.TenHang,
        TenNV: h.TenNV_DangDung,
        MaNV_DangDung: h.MaNV_DangDung
      })))
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
      const res = await axios.get('/transfer/sophieu')
      setSoPhieuMoi(res.data.data.soPhieu)
    } catch {
      setSoPhieuMoi('')
    }
    setFormData({
      NgayDC: new Date().toISOString().split('T')[0],
      MaHang: '',
      NguoiGiao: '',
      NguoiNhan: '',
      DienGiai: ''
    })
    setShowModal(true)
  }

  // Khi chọn hàng hóa, tự động điền người đang giữ
  const handleSelectHangHoa = (maHang: string) => {
    const selected = hangHoas.find(h => h.MaHang === parseInt(maHang))
    setFormData({
      ...formData,
      MaHang: maHang,
      NguoiGiao: selected?.MaNV_DangDung?.toString() || ''
    })
  }

  const handleSave = async () => {
    try {
      if (!formData.MaHang || !formData.NguoiGiao || !formData.NguoiNhan) {
        alert('Vui lòng điền đầy đủ thông tin')
        return
      }

      if (formData.NguoiGiao === formData.NguoiNhan) {
        alert('Người giao và người nhận không được trùng nhau')
        return
      }

      setSaving(true)
      await axios.post('/transfer', {
        NgayDC: formData.NgayDC,
        MaHang: parseInt(formData.MaHang),
        NguoiGiao: parseInt(formData.NguoiGiao),
        NguoiNhan: parseInt(formData.NguoiNhan),
        DienGiai: formData.DienGiai || null
      })
      
      setShowModal(false)
      fetchData()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (item: DieuChuyen) => {
    if (!confirm(`Bạn có chắc muốn xóa phiếu "${item.SoPhieuDC}"?`)) return
    try {
      await axios.delete(`/transfer/${item.MaDC}`)
      fetchData()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra')
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN')
  }

  const columns = [
    { 
      key: 'SoPhieuDC', 
      header: 'Số phiếu',
      render: (item: DieuChuyen) => (
        <Badge variant="info" className="font-mono">{item.SoPhieuDC}</Badge>
      )
    },
    { 
      key: 'NgayDC', 
      header: 'Ngày',
      render: (item: DieuChuyen) => <span className="text-gray-300">{formatDate(item.NgayDC)}</span>
    },
    { 
      key: 'TenHang', 
      header: 'Hàng hóa',
      render: (item: DieuChuyen) => <span className="text-white font-medium">{item.TenHang}</span>
    },
    { 
      key: 'TenNVGiao', 
      header: 'Người giao',
      render: (item: DieuChuyen) => (
        <div className="flex items-center">
          <svg className="w-4 h-4 mr-2 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="text-gray-300">{item.TenNVGiao || '-'}</span>
        </div>
      )
    },
    { 
      key: 'TenNVNhan', 
      header: 'Người nhận',
      render: (item: DieuChuyen) => (
        <div className="flex items-center">
          <svg className="w-4 h-4 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
          <span className="text-gray-300">{item.TenNVNhan || '-'}</span>
        </div>
      )
    },
    { 
      key: 'DienGiai', 
      header: 'Diễn giải',
      render: (item: DieuChuyen) => (
        <span className="text-gray-400 text-sm line-clamp-2">{item.DienGiai || '-'}</span>
      )
    },
    { 
      key: 'actions', 
      header: '',
      headerClassName: 'text-right',
      className: 'text-right',
      render: (item: DieuChuyen) => (
        <button
          onClick={(e) => { e.stopPropagation(); handleDelete(item) }}
          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          title="Xóa"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )
    }
  ]

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Điều Chuyển Hàng Hóa" 
        subtitle={`Tổng: ${items.length} phiếu điều chuyển`}
        icon={
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        }
        actions={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => exportTransfer(items.map(i => ({
              MaDC: i.MaDC,
              TenHang: i.TenHang,
              TenNVNhan: i.TenNVNhan,
              TenNVGiao: i.TenNVGiao,
              NgayDC: i.NgayDC,
              LyDo: i.DienGiai
            })))}>
              <Download className="w-4 h-4 mr-2" />
              Xuất Excel
            </Button>
            <Button onClick={openAddModal}>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Tạo phiếu mới
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
            placeholder="Tìm theo số phiếu, tên hàng, tên NV..."
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
          emptyText="Chưa có phiếu điều chuyển nào"
          rowKey="MaDC"
        />
      </Card>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Tạo phiếu điều chuyển"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Hủy</Button>
            <Button onClick={handleSave} loading={saving}>Lưu phiếu</Button>
          </>
        }
      >
        <div className="space-y-5">
          {/* Số phiếu tự động */}
          <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Số phiếu điều chuyển</span>
              <span className="text-blue-400 font-mono font-bold text-lg">{soPhieuMoi}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Ngày điều chuyển *</label>
            <input
              type="date"
              value={formData.NgayDC}
              onChange={(e) => setFormData({ ...formData, NgayDC: e.target.value })}
              className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2e2e2e] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <Select
            label="Hàng hóa cần điều chuyển *"
            options={hangHoas.map(h => ({ 
              value: h.MaHang, 
              label: `${h.TenHang}${h.TenNV ? ` (đang: ${h.TenNV})` : ''}`
            }))}
            value={formData.MaHang}
            onChange={handleSelectHangHoa}
            placeholder="-- Chọn hàng hóa --"
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Người giao (đang giữ) *"
              options={nhanViens.map(nv => ({ value: nv.maNV, label: `${nv.maNV} - ${nv.tenNV}` }))}
              value={formData.NguoiGiao}
              onChange={(v) => setFormData({ ...formData, NguoiGiao: v })}
              placeholder="-- Chọn nhân viên --"
            />
            <Select
              label="Người nhận *"
              options={nhanViens.map(nv => ({ value: nv.maNV, label: `${nv.maNV} - ${nv.tenNV}` }))}
              value={formData.NguoiNhan}
              onChange={(v) => setFormData({ ...formData, NguoiNhan: v })}
              placeholder="-- Chọn nhân viên --"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Diễn giải</label>
            <textarea
              value={formData.DienGiai}
              onChange={(e) => setFormData({ ...formData, DienGiai: e.target.value })}
              className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2e2e2e] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              rows={3}
              placeholder="Lý do điều chuyển..."
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default TransferPage
