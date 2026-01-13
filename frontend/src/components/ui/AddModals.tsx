import { useState, useEffect, useCallback } from 'react'
import axios from '@/libs/axios'
import { Modal, Input, Button, Select } from '@/components/ui'

// ============================================
// MODAL THÊM HÀNG HÓA MỚI
// ============================================
interface AddHangHoaModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (newItem: any) => void
}

// Fallback options nếu API không có dữ liệu
const DEFAULT_LOAI_HANG = [
  { value: 'may_tinh', label: 'Máy tính' },
  { value: 'laptop', label: 'Laptop' },
  { value: 'man_hinh', label: 'Màn hình' },
  { value: 'may_in', label: 'Máy in' },
  { value: 'thiet_bi_mang', label: 'Thiết bị mạng' },
  { value: 'phu_kien', label: 'Phụ kiện' },
  { value: 'khac', label: 'Khác' }
]

const DEFAULT_TRANG_THAI = [
  { value: 'Mới', label: 'Mới' },
  { value: 'Đang dùng', label: 'Đang dùng' },
  { value: 'Hỏng', label: 'Hỏng' },
  { value: 'Thanh lý', label: 'Thanh lý' }
]

export const AddHangHoaModal: React.FC<AddHangHoaModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [saving, setSaving] = useState(false)
  const [loaiHangOptions, setLoaiHangOptions] = useState(DEFAULT_LOAI_HANG)
  const [trangThaiOptions, setTrangThaiOptions] = useState(DEFAULT_TRANG_THAI)
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

  // Fetch options từ API
  const fetchOptions = useCallback(async () => {
    try {
      const [loaiRes, ttRes] = await Promise.all([
        axios.get('/loaihang'),
        axios.get('/trangthai')
      ])
      
      if (loaiRes.data.data && loaiRes.data.data.length > 0) {
        setLoaiHangOptions(loaiRes.data.data.map((item: any) => ({
          value: item.MaLoaiText,
          label: item.TenLoai
        })))
      }
      
      if (ttRes.data.data && ttRes.data.data.length > 0) {
        setTrangThaiOptions(ttRes.data.data.map((item: any) => ({
          value: item.TenTrangThai,
          label: item.TenTrangThai
        })))
      }
    } catch (error) {
      console.warn('Không thể load options từ API')
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      fetchOptions()
    }
  }, [isOpen, fetchOptions])

  const handleSave = async () => {
    if (!formData.TenHang.trim()) {
      alert('Vui lòng nhập tên hàng hóa')
      return
    }

    setSaving(true)
    try {
      const res = await axios.post('/hanghoa', {
        ...formData,
        NamSX: formData.NamSX ? parseInt(formData.NamSX) : null
      })
      onSuccess(res.data.data)
      onClose()
      setFormData({ MaTS: '', TenHang: '', LoaiHang: 'may_tinh', Hang: '', Model: '', NamSX: '', TrangThai: 'Mới', ThongTinChiTiet: '' })
    } catch (error: any) {
      alert(error.response?.data?.message || 'Lỗi khi tạo hàng hóa')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Thêm hàng hóa mới"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Hủy</Button>
          <Button onClick={handleSave} loading={saving}>Thêm mới</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Mã tài sản"
            value={formData.MaTS}
            onChange={(e) => setFormData({ ...formData, MaTS: e.target.value })}
            placeholder="VD: TS001"
          />
          <Select
            label="Loại hàng *"
            options={loaiHangOptions}
            value={formData.LoaiHang}
            onChange={(v) => setFormData({ ...formData, LoaiHang: v })}
          />
        </div>

        <Input
          label="Tên hàng hóa *"
          value={formData.TenHang}
          onChange={(e) => setFormData({ ...formData, TenHang: e.target.value })}
          placeholder="VD: Laptop Dell Latitude 7440"
        />

        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Hãng"
            value={formData.Hang}
            onChange={(e) => setFormData({ ...formData, Hang: e.target.value })}
            placeholder="VD: Dell, HP..."
          />
          <Input
            label="Model"
            value={formData.Model}
            onChange={(e) => setFormData({ ...formData, Model: e.target.value })}
            placeholder="VD: Latitude 7440"
          />
          <Input
            label="Năm SX"
            type="number"
            value={formData.NamSX}
            onChange={(e) => setFormData({ ...formData, NamSX: e.target.value })}
            placeholder="VD: 2024"
          />
        </div>

        <Select
          label="Trạng thái"
          options={trangThaiOptions}
          value={formData.TrangThai}
          onChange={(v) => setFormData({ ...formData, TrangThai: v })}
        />

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
  )
}

// ============================================
// MODAL THÊM KHO MỚI
// ============================================
interface AddKhoModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (newItem: any) => void
}

export const AddKhoModal: React.FC<AddKhoModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    MaKhoText: '',
    TenKho: '',
    DiaChi: ''
  })

  const handleSave = async () => {
    if (!formData.MaKhoText.trim()) {
      alert('Vui lòng nhập mã kho')
      return
    }
    if (!formData.TenKho.trim()) {
      alert('Vui lòng nhập tên kho')
      return
    }

    setSaving(true)
    try {
      const res = await axios.post('/warehouses', formData)
      onSuccess(res.data.data)
      onClose()
      setFormData({ MaKhoText: '', TenKho: '', DiaChi: '' })
    } catch (error: any) {
      alert(error.response?.data?.error || 'Lỗi khi tạo kho')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Thêm kho mới"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Hủy</Button>
          <Button onClick={handleSave} loading={saving}>Thêm mới</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label="Mã kho *"
          value={formData.MaKhoText}
          onChange={(e) => setFormData({ ...formData, MaKhoText: e.target.value })}
          placeholder="VD: KHO01"
        />
        <Input
          label="Tên kho *"
          value={formData.TenKho}
          onChange={(e) => setFormData({ ...formData, TenKho: e.target.value })}
          placeholder="VD: Kho chính"
        />
        <Input
          label="Địa chỉ"
          value={formData.DiaChi}
          onChange={(e) => setFormData({ ...formData, DiaChi: e.target.value })}
          placeholder="Địa chỉ kho..."
        />
      </div>
    </Modal>
  )
}

// ============================================
// MODAL THÊM NHÀ CUNG CẤP MỚI
// ============================================
interface AddNCCModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (newItem: any) => void
}

export const AddNCCModal: React.FC<AddNCCModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    MaSoThue: '',
    TenNCC: '',
    DiaChi: '',
    SoDienThoai: '',
    Email: '',
    NguoiLienHe: '',
    GhiChu: ''
  })

  const handleSave = async () => {
    if (!formData.TenNCC.trim()) {
      alert('Vui lòng nhập tên nhà cung cấp')
      return
    }

    setSaving(true)
    try {
      const res = await axios.post('/ncc', formData)
      onSuccess(res.data.data)
      onClose()
      setFormData({ MaSoThue: '', TenNCC: '', DiaChi: '', SoDienThoai: '', Email: '', NguoiLienHe: '', GhiChu: '' })
    } catch (error: any) {
      alert(error.response?.data?.message || 'Lỗi khi tạo NCC')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Thêm nhà cung cấp mới"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Hủy</Button>
          <Button onClick={handleSave} loading={saving}>Thêm mới</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Mã số thuế"
            value={formData.MaSoThue}
            onChange={(e) => setFormData({ ...formData, MaSoThue: e.target.value })}
            placeholder="VD: 0123456789"
          />
          <Input
            label="Tên NCC *"
            value={formData.TenNCC}
            onChange={(e) => setFormData({ ...formData, TenNCC: e.target.value })}
            placeholder="Tên nhà cung cấp"
          />
        </div>

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
            rows={2}
            placeholder="Ghi chú thêm về nhà cung cấp..."
          />
        </div>
      </div>
    </Modal>
  )
}

// ============================================
// MODAL THÊM NHÂN VIÊN MỚI
// ============================================
interface AddNhanVienModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (newItem: any) => void
}

export const AddNhanVienModal: React.FC<AddNhanVienModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [saving, setSaving] = useState(false)
  const [departments, setDepartments] = useState<{ maPB: number; tenPB: string }[]>([])
  const [formData, setFormData] = useState({
    maNVText: '',
    tenNV: '',
    email: '',
    soDienThoai: '',
    maPB: ''
  })

  // Load phòng ban khi mở modal
  const loadDepartments = async () => {
    try {
      const res = await axios.get('/departments')
      setDepartments(res.data?.data || [])
    } catch (error) {
      console.error('Lỗi load departments:', error)
    }
  }

  // Load departments khi modal mở
  if (isOpen && departments.length === 0) {
    loadDepartments()
  }

  const handleSave = async () => {
    if (!formData.maNVText.trim()) {
      alert('Vui lòng nhập mã nhân viên')
      return
    }
    if (!formData.tenNV.trim()) {
      alert('Vui lòng nhập tên nhân viên')
      return
    }

    setSaving(true)
    try {
      const res = await axios.post('/employees', {
        ...formData,
        maPB: formData.maPB || null
      })
      
      // Thông báo mật khẩu mặc định
      if (res.data?.data?.matKhauMacDinh) {
        alert(`Tạo nhân viên thành công!\n\nTài khoản: ${res.data.data.username}\nMật khẩu mặc định: ${res.data.data.matKhauMacDinh}`)
      }
      
      onSuccess(res.data.data)
      onClose()
      setFormData({ maNVText: '', tenNV: '', email: '', soDienThoai: '', maPB: '' })
    } catch (error: any) {
      alert(error.response?.data?.error || 'Lỗi khi tạo nhân viên')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Thêm nhân viên mới"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Hủy</Button>
          <Button onClick={handleSave} loading={saving}>Thêm mới</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Mã nhân viên *"
            value={formData.maNVText}
            onChange={(e) => setFormData({ ...formData, maNVText: e.target.value })}
            placeholder="VD: NV001"
          />
          <Input
            label="Họ tên *"
            value={formData.tenNV}
            onChange={(e) => setFormData({ ...formData, tenNV: e.target.value })}
            placeholder="Họ và tên nhân viên"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="email@company.com"
          />
          <Input
            label="Số điện thoại"
            value={formData.soDienThoai}
            onChange={(e) => setFormData({ ...formData, soDienThoai: e.target.value })}
            placeholder="0123456789"
          />
        </div>

        <Select
          label="Phòng ban"
          options={departments.map(d => ({ value: d.maPB, label: d.tenPB }))}
          value={formData.maPB}
          onChange={(v) => setFormData({ ...formData, maPB: v })}
          placeholder="Chọn phòng ban..."
        />

        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
          <p className="text-blue-400 text-sm">
            💡 Sau khi tạo, nhân viên có thể đăng nhập với:
            <br />• Tài khoản: <span className="font-mono">{formData.maNVText.toLowerCase() || 'manv'}</span>
            <br />• Mật khẩu mặc định: <span className="font-mono">{formData.maNVText.toLowerCase() || 'manv'}@123</span>
          </p>
        </div>
      </div>
    </Modal>
  )
}
