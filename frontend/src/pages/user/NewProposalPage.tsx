import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createProposal } from '@/libs/proposal'
import { CreateProposalRequest, ProposalType, PriorityLevel } from '@/types/proposal.types'
import { ROUTES } from '@/constants'
import api from '@/libs/axios'
import { useAuth } from '@/hooks/useAuth'

interface ThietBiNhanVien {
  MaHang: number
  MaTS: string
  TenHang: string
  MaNhom: string
  TenNhom: string
  NgayXuat: string
  TuKho: string
}

export default function NewProposalPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [loadingDevices, setLoadingDevices] = useState(false)
  const [error, setError] = useState('')
  const [thietBis, setThietBis] = useState<ThietBiNhanVien[]>([])
  const [formData, setFormData] = useState<CreateProposalRequest>({
    loaiYC: 'sua_chua',
    tieuDe: '',
    moTa: '',
    lyDo: '',
    mucDoUuTien: 'Trung bình',
    maHang: undefined,
  })

  // Load thiết bị đã cấp cho NV khi component mount
  useEffect(() => {
    if (user?.maNV) {
      fetchThietBiCuaNhanVien()
    }
  }, [user?.maNV])

  const fetchThietBiCuaNhanVien = async () => {
    setLoadingDevices(true)
    try {
      const res = await api.get(`/stock/baocao/thietbi-nhanvien/${user?.maNV}`)
      setThietBis(res.data?.data || [])
    } catch (err) {
      console.error('Error fetching devices:', err)
    } finally {
      setLoadingDevices(false)
    }
  }

  // Kiểm tra có phải loại cần chọn thiết bị không
  const requiresDevice = ['sua_chua', 'nang_cap', 'thay_the'].includes(formData.loaiYC)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.tieuDe.trim()) {
      setError('Vui lòng nhập tiêu đề')
      return
    }

    setLoading(true)
    try {
      await createProposal(formData)
      navigate(ROUTES.USER_PROPOSALS)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Tạo đề xuất mới</h1>
        <p className="text-gray-400 mt-1">Đề xuất nâng cấp, sửa chữa hoặc mua mới thiết bị</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-6 space-y-6">
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Loại đề xuất */}
        <div>
          <label className="block text-gray-300 mb-2">Loại đề xuất *</label>
          <select
            value={formData.loaiYC}
            onChange={(e) => setFormData({ ...formData, loaiYC: e.target.value as ProposalType })}
            className="w-full bg-[#2e2e2e] border border-[#3e3e3e] text-white rounded-lg px-4 py-3 focus:outline-none focus:border-green-500"
          >
            <option value="sua_chua">Sửa chữa</option>
            <option value="nang_cap">Nâng cấp</option>
            <option value="mua_moi">Mua mới</option>
            <option value="thay_the">Thay thế</option>
          </select>
        </div>

        {/* Chọn thiết bị - chỉ hiện khi là sửa chữa/nâng cấp/thay thế */}
        {requiresDevice && (
          <div>
            <label className="block text-gray-300 mb-2">
              Chọn thiết bị đã được cấp {formData.loaiYC !== 'mua_moi' && <span className="text-yellow-500 text-sm">(Khuyến nghị)</span>}
            </label>
            {loadingDevices ? (
              <div className="w-full bg-[#2e2e2e] border border-[#3e3e3e] rounded-lg px-4 py-3 text-gray-400">
                Đang tải danh sách thiết bị...
              </div>
            ) : thietBis.length === 0 ? (
              <div className="w-full bg-[#2e2e2e] border border-[#3e3e3e] rounded-lg px-4 py-3 text-gray-400">
                Bạn chưa được cấp thiết bị nào
              </div>
            ) : (
              <select
                value={formData.maHang || ''}
                onChange={(e) => setFormData({ ...formData, maHang: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full bg-[#2e2e2e] border border-[#3e3e3e] text-white rounded-lg px-4 py-3 focus:outline-none focus:border-green-500"
              >
                <option value="">-- Chọn thiết bị --</option>
                {thietBis.map(tb => (
                  <option key={tb.MaHang} value={tb.MaHang}>
                    {tb.MaTS} - {tb.TenHang} ({tb.TenNhom})
                  </option>
                ))}
              </select>
            )}
            {thietBis.length > 0 && (
              <p className="text-gray-500 text-sm mt-1">
                Chọn thiết bị bạn muốn {formData.loaiYC === 'sua_chua' ? 'sửa chữa' : formData.loaiYC === 'nang_cap' ? 'nâng cấp' : 'thay thế'}
              </p>
            )}
          </div>
        )}

        {/* Tiêu đề */}
        <div>
          <label className="block text-gray-300 mb-2">Tiêu đề *</label>
          <input
            type="text"
            value={formData.tieuDe}
            onChange={(e) => setFormData({ ...formData, tieuDe: e.target.value })}
            placeholder="VD: Máy tính bị chậm, cần nâng cấp RAM"
            className="w-full bg-[#2e2e2e] border border-[#3e3e3e] text-white rounded-lg px-4 py-3 focus:outline-none focus:border-green-500"
          />
        </div>

        {/* Mô tả */}
        <div>
          <label className="block text-gray-300 mb-2">Mô tả chi tiết</label>
          <textarea
            value={formData.moTa || ''}
            onChange={(e) => setFormData({ ...formData, moTa: e.target.value })}
            placeholder="Mô tả chi tiết vấn đề hoặc yêu cầu của bạn..."
            rows={4}
            className="w-full bg-[#2e2e2e] border border-[#3e3e3e] text-white rounded-lg px-4 py-3 focus:outline-none focus:border-green-500"
          />
        </div>

        {/* Lý do */}
        <div>
          <label className="block text-gray-300 mb-2">Lý do đề xuất</label>
          <textarea
            value={formData.lyDo || ''}
            onChange={(e) => setFormData({ ...formData, lyDo: e.target.value })}
            placeholder="Tại sao cần thực hiện đề xuất này?"
            rows={2}
            className="w-full bg-[#2e2e2e] border border-[#3e3e3e] text-white rounded-lg px-4 py-3 focus:outline-none focus:border-green-500"
          />
        </div>

        {/* Mức độ ưu tiên */}
        <div>
          <label className="block text-gray-300 mb-2">Mức độ ưu tiên</label>
          <select
            value={formData.mucDoUuTien}
            onChange={(e) => setFormData({ ...formData, mucDoUuTien: e.target.value as PriorityLevel })}
            className="w-full bg-[#2e2e2e] border border-[#3e3e3e] text-white rounded-lg px-4 py-3 focus:outline-none focus:border-green-500"
          >
            <option value="Thấp">Thấp</option>
            <option value="Trung bình">Trung bình</option>
            <option value="Cao">Cao</option>
            <option value="Khẩn cấp">Khẩn cấp</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate(ROUTES.USER_PROPOSALS)}
            className="px-6 py-3 bg-[#2e2e2e] text-gray-300 rounded-lg hover:bg-[#3e3e3e] transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Đang gửi...' : 'Gửi đề xuất'}
          </button>
        </div>
      </form>
    </div>
  )
}
