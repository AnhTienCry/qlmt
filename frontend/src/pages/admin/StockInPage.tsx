import { useState, useEffect } from 'react'
import axios from '@/libs/axios'
import { Button, Card, Badge, Modal, Select, Table, PageHeader, SearchInput } from '@/components/ui'
import { Download } from 'lucide-react'
import { exportStockIn } from '@/libs/excel'

interface NhapHang {
  MaNhap: number
  SoPhieuN: string
  NgayNhap: string
  MaHang: number
  TenHang?: string
  MaKho: number
  TenKho?: string
  NguoiGiao: number
  TenNCC?: string
  NguoiNhan: number
  TenNV?: string
  DienGiai?: string
}

interface HangHoa { MaHang: number; TenHang: string }
interface Kho { MaKho: number; TenKho: string }
interface NCC { MaNCC: number; TenNCC: string }
interface NhanVien { maNV: number; tenNV: string }

const StockInPage = () => {
  const [items, setItems] = useState<NhapHang[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [saving, setSaving] = useState(false)
  
  const [hangHoas, setHangHoas] = useState<HangHoa[]>([])
  const [khos, setKhos] = useState<Kho[]>([])
  const [nccs, setNccs] = useState<NCC[]>([])
  const [nhanViens, setNhanViens] = useState<NhanVien[]>([])
  const [soPhieuMoi, setSoPhieuMoi] = useState('')

  const [formData, setFormData] = useState({
    NgayNhap: new Date().toISOString().split('T')[0],
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
      const [nhRes, hhRes, khoRes, nccRes, nvRes] = await Promise.all([
        axios.get('/stock/nhaphang', { params }),
        axios.get('/hanghoa'),
        axios.get('/warehouses'),
        axios.get('/ncc'),
        axios.get('/employees')
      ])
      
      setItems(nhRes.data.data || [])
      setHangHoas(hhRes.data.data || [])
      setKhos(khoRes.data.data || [])
      setNccs(nccRes.data.data || [])
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
      const res = await axios.get('/stock/nhaphang/sophieu')
      setSoPhieuMoi(res.data.data.soPhieu)
    } catch {
      setSoPhieuMoi('')
    }
    setFormData({
      NgayNhap: new Date().toISOString().split('T')[0],
      MaHang: '',
      MaKho: '',
      NguoiGiao: '',
      NguoiNhan: '',
      DienGiai: ''
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    try {
      if (!formData.MaHang || !formData.MaKho || !formData.NguoiGiao || !formData.NguoiNhan) {
        alert('Vui lòng điền đầy đủ thông tin')
        return
      }

      setSaving(true)
      await axios.post('/stock/nhaphang', {
        NgayNhap: formData.NgayNhap,
        MaHang: parseInt(formData.MaHang),
        MaKho: parseInt(formData.MaKho),
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

  const handleDelete = async (item: NhapHang) => {
    if (!confirm(`Bạn có chắc muốn xóa phiếu "${item.SoPhieuN}"?`)) return
    try {
      await axios.delete(`/stock/nhaphang/${item.MaNhap}`)
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
      key: 'SoPhieuN', 
      header: 'Số phiếu',
      render: (item: NhapHang) => (
        <Badge variant="success" className="font-mono">{item.SoPhieuN}</Badge>
      )
    },
    { 
      key: 'NgayNhap', 
      header: 'Ngày nhập',
      render: (item: NhapHang) => <span className="text-gray-300">{formatDate(item.NgayNhap)}</span>
    },
    { 
      key: 'TenHang', 
      header: 'Hàng hóa',
      render: (item: NhapHang) => <span className="text-white font-medium">{item.TenHang}</span>
    },
    { 
      key: 'TenKho', 
      header: 'Kho',
      render: (item: NhapHang) => <span className="text-gray-300">{item.TenKho}</span>
    },
    { 
      key: 'TenNCC', 
      header: 'Người giao (NCC)',
      render: (item: NhapHang) => (
        <div className="flex items-center">
          <svg className="w-4 h-4 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span className="text-gray-300">{item.TenNCC}</span>
        </div>
      )
    },
    { 
      key: 'TenNV', 
      header: 'Người nhận (NV)',
      render: (item: NhapHang) => (
        <div className="flex items-center">
          <svg className="w-4 h-4 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-gray-300">{item.TenNV}</span>
        </div>
      )
    },
    { 
      key: 'actions', 
      header: '',
      headerClassName: 'text-right',
      className: 'text-right',
      render: (item: NhapHang) => (
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
        title="Nhập Hàng" 
        subtitle={`Tổng: ${items.length} phiếu nhập`}
        icon={
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
        }
        actions={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => exportStockIn(items.map(i => ({
              MaNhap: i.MaNhap,
              TenHang: i.TenHang,
              TenKho: i.TenKho,
              TenNCC: i.TenNCC,
              SoLuong: 1,
              DonGia: 0,
              NgayNhap: i.NgayNhap,
              NguoiGiao: i.TenNCC,
              GhiChu: i.DienGiai
            })))}>
              <Download className="w-4 h-4 mr-2" />
              Xuất Excel
            </Button>
            <Button onClick={openAddModal}>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Tạo phiếu nhập
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
          emptyText="Chưa có phiếu nhập hàng"
          rowKey="MaNhap"
        />
      </Card>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Tạo phiếu nhập hàng"
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
          <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Số phiếu nhập</span>
              <span className="text-green-400 font-mono font-bold text-lg">{soPhieuMoi}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Ngày nhập *</label>
            <input
              type="date"
              value={formData.NgayNhap}
              onChange={(e) => setFormData({ ...formData, NgayNhap: e.target.value })}
              className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2e2e2e] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Hàng hóa *"
              options={hangHoas.map(h => ({ value: h.MaHang, label: h.TenHang }))}
              value={formData.MaHang}
              onChange={(v) => setFormData({ ...formData, MaHang: v })}
              placeholder="-- Chọn hàng hóa --"
            />
            <Select
              label="Kho hàng *"
              options={khos.map(k => ({ value: k.MaKho, label: k.TenKho }))}
              value={formData.MaKho}
              onChange={(v) => setFormData({ ...formData, MaKho: v })}
              placeholder="-- Chọn kho --"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Người giao (NCC) *"
              options={nccs.map(n => ({ value: n.MaNCC, label: `${n.MaNCC} - ${n.TenNCC}` }))}
              value={formData.NguoiGiao}
              onChange={(v) => setFormData({ ...formData, NguoiGiao: v })}
              placeholder="-- Chọn NCC --"
            />
            <Select
              label="Người nhận (NV) *"
              options={nhanViens.map(nv => ({ value: nv.maNV, label: `${nv.maNV} - ${nv.tenNV}` }))}
              value={formData.NguoiNhan}
              onChange={(v) => setFormData({ ...formData, NguoiNhan: v })}
              placeholder="-- Chọn NV --"
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
    </div>
  )
}

export default StockInPage
