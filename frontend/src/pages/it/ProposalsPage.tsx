import { useState, useEffect } from 'react'
import { getProposals, processProposal, submitToDirector, itRejectProposal, completeProposal, updatePriority, itDirectApprove, sendFeedback } from '@/libs/proposal'
import { Proposal } from '@/types/proposal.types'
import { PROPOSAL_STATUS, PROPOSAL_TYPES, PRIORITY_LEVELS } from '@/constants'
import { useToast, FeedbackTimeline, DirectorFeedbackTimeline, UserFeedbackTimeline, SearchInput } from '@/components/ui'
import { exportToExcel } from '@/libs/excel'

export default function ITProposalsPage() {
  const toast = useToast()
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [ghiChu, setGhiChu] = useState('')
  const [ketQua, setKetQua] = useState('')
  const [newPriority, setNewPriority] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  // Feedback states
  const [showFeedbackForm, setShowFeedbackForm] = useState(false)
  const [feedbackContent, setFeedbackContent] = useState('')
  const [feedbackRecipient, setFeedbackRecipient] = useState<'user' | 'director' | 'both'>('user')
  // Edit mode for IT approved proposals
  const [editMode, setEditMode] = useState(false)
  const [editAction, setEditAction] = useState<'none' | 'forward' | 'reject'>('none')

  // Lọc theo search
  const filteredProposals = proposals.filter(p => {
    const search = searchTerm.toLowerCase()
    return (
      p.tieuDe.toLowerCase().includes(search) ||
      p.nguoiTao.username.toLowerCase().includes(search) ||
      p.maYC.toString().includes(search) ||
      (PROPOSAL_TYPES[p.loaiYC as keyof typeof PROPOSAL_TYPES] || '').toLowerCase().includes(search)
    )
  })

  useEffect(() => {
    fetchProposals()
  }, [])

  const fetchProposals = async () => {
    try {
      const response = await getProposals()
      setProposals(response.data)
    } catch (error) {
      console.error('Error fetching proposals:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProcess = async (id: number) => {
    setActionLoading(true)
    try {
      await processProposal(id, ghiChu)
      toast.success('Đã bắt đầu xử lý đề xuất!')
      await fetchProposals()
      setSelectedProposal(null)
      setGhiChu('')
    } catch (error: any) {
      console.error('Error processing:', error)
      toast.error(error.response?.data?.message || 'Lỗi xử lý đề xuất')
    } finally {
      setActionLoading(false)
    }
  }

  const handleSubmitToDirector = async (id: number) => {
    setActionLoading(true)
    try {
      await submitToDirector(id, ghiChu)
      toast.success('Đã chuyển đề xuất lên Giám đốc!')
      await fetchProposals()
      setSelectedProposal(null)
      setGhiChu('')
    } catch (error: any) {
      console.error('Error submitting:', error)
      toast.error(error.response?.data?.message || 'Lỗi chuyển đề xuất')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async (id: number) => {
    if (!ghiChu.trim()) {
      toast.warning('Vui lòng nhập lý do từ chối')
      return
    }
    setActionLoading(true)
    try {
      await itRejectProposal(id, ghiChu)
      toast.success('Đã từ chối đề xuất!')
      await fetchProposals()
      setSelectedProposal(null)
      setGhiChu('')
    } catch (error: any) {
      console.error('Error rejecting:', error)
      toast.error(error.response?.data?.message || 'Lỗi từ chối đề xuất')
    } finally {
      setActionLoading(false)
    }
  }

  const handleComplete = async (id: number) => {
    if (!ketQua.trim()) {
      toast.warning('Vui lòng nhập kết quả thực hiện')
      return
    }
    setActionLoading(true)
    try {
      await completeProposal(id, ketQua)
      toast.success('Đề xuất đã hoàn thành!')
      await fetchProposals()
      setSelectedProposal(null)
      setKetQua('')
    } catch (error: any) {
      console.error('Error completing:', error)
      toast.error(error.response?.data?.message || 'Lỗi hoàn thành đề xuất')
    } finally {
      setActionLoading(false)
    }
  }

  // ===== MỚI: Chỉnh mức độ ưu tiên =====
  const handleUpdatePriority = async (id: number) => {
    if (!newPriority) {
      toast.warning('Vui lòng chọn mức độ ưu tiên')
      return
    }
    setActionLoading(true)
    try {
      const response = await updatePriority(id, newPriority, ghiChu)
      // Cập nhật selectedProposal ngay từ response
      if (response.data) {
        setSelectedProposal(response.data as any)
      }
      // Refresh danh sách
      await fetchProposals()
      toast.success('Đã cập nhật mức độ ưu tiên!')
    } catch (error: any) {
      console.error('Error updating priority:', error)
      toast.error(error.response?.data?.message || 'Lỗi cập nhật mức độ ưu tiên')
    } finally {
      setActionLoading(false)
    }
  }

  // ===== IT duyệt trực tiếp (sửa chữa nhỏ) =====
  const handleItDirectApprove = async (id: number) => {
    setActionLoading(true)
    try {
      await itDirectApprove(id, ghiChu)
      toast.success('IT đã duyệt trực tiếp đề xuất!')
      await fetchProposals()
      setSelectedProposal(null)
      setGhiChu('')
    } catch (error: any) {
      console.error('Error IT approving:', error)
      toast.error(error.response?.data?.message || 'Lỗi duyệt đề xuất')
    } finally {
      setActionLoading(false)
    }
  }

  // ===== IT gửi phản hồi cho User/GĐ =====
  const handleSendFeedback = async (id: number) => {
    if (!feedbackContent.trim()) {
      toast.warning('Vui lòng nhập nội dung phản hồi')
      return
    }
    setActionLoading(true)
    try {
      const response = await sendFeedback(id, feedbackContent, feedbackRecipient)
      if (response.data) {
        setSelectedProposal(response.data as any)
      }
      await fetchProposals()
      toast.success('Đã gửi phản hồi thành công!')
      setShowFeedbackForm(false)
      setFeedbackContent('')
      setFeedbackRecipient('user')
    } catch (error: any) {
      console.error('Error sending feedback:', error)
      toast.error(error.response?.data?.message || 'Lỗi gửi phản hồi')
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusInfo = PROPOSAL_STATUS[status as keyof typeof PROPOSAL_STATUS] || { label: status, color: 'gray' }
    const colorClasses: Record<string, string> = {
      yellow: 'bg-yellow-500/20 text-yellow-400',
      blue: 'bg-blue-500/20 text-blue-400',
      purple: 'bg-purple-500/20 text-purple-400',
      green: 'bg-green-500/20 text-green-400',
      red: 'bg-red-500/20 text-red-400',
      gray: 'bg-gray-500/20 text-gray-400',
      cyan: 'bg-cyan-500/20 text-cyan-400',
      orange: 'bg-orange-500/20 text-orange-400',
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${colorClasses[statusInfo.color]}`}>
        {statusInfo.label}
      </span>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const priorityInfo = PRIORITY_LEVELS[priority as keyof typeof PRIORITY_LEVELS] || { label: priority, color: 'gray' }
    const colorClasses: Record<string, string> = {
      gray: 'bg-gray-500/20 text-gray-400',
      yellow: 'bg-yellow-500/20 text-yellow-400',
      orange: 'bg-orange-500/20 text-orange-400',
      red: 'bg-red-500/20 text-red-400',
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${colorClasses[priorityInfo.color]}`}>
        {priorityInfo.label}
      </span>
    )
  }

  // Xuất Excel
  const handleExportExcel = () => {
    const columns = [
      { key: 'maYC' as const, title: 'Mã' },
      { key: 'tieuDe' as const, title: 'Tiêu đề' },
      { key: 'nguoiTao' as const, title: 'Người tạo' },
      { key: 'loaiYC' as const, title: 'Loại' },
      { key: 'mucDoUuTien' as const, title: 'Ưu tiên' },
      { key: 'trangThai' as const, title: 'Trạng thái' },
      { key: 'ngayTao' as const, title: 'Ngày tạo' },
      { key: 'itXuLy' as const, title: 'IT xử lý' },
      { key: 'ngayXuLy' as const, title: 'Ngày xử lý' },
    ]
    const data = filteredProposals.map(p => ({
      maYC: p.maYC,
      tieuDe: p.tieuDe,
      nguoiTao: p.nguoiTao.username,
      loaiYC: PROPOSAL_TYPES[p.loaiYC as keyof typeof PROPOSAL_TYPES] || p.loaiYC,
      mucDoUuTien: p.mucDoUuTien,
      trangThai: PROPOSAL_STATUS[p.trangThai as keyof typeof PROPOSAL_STATUS]?.label || p.trangThai,
      ngayTao: new Date(p.ngayTao).toLocaleDateString('vi-VN'),
      itXuLy: p.itXuLy.tenNV || '',
      ngayXuLy: p.itXuLy.ngayXuLy ? new Date(p.itXuLy.ngayXuLy).toLocaleDateString('vi-VN') : '',
    }))
    exportToExcel(data, columns, { filename: `De_xuat_${new Date().toISOString().slice(0,10)}` })
    toast.success('Đã xuất Excel thành công!')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Xử lý đề xuất</h1>
          <p className="text-gray-400 mt-1">Danh sách đề xuất cần xử lý</p>
        </div>
        <button
          onClick={handleExportExcel}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Xuất Excel
        </button>
      </div>

      {/* Thanh tìm kiếm */}
      <div className="w-full max-w-md">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Tìm theo mã, tiêu đề, người tạo..."
        />
      </div>

      <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#2e2e2e]">
            <tr>
              <th className="text-left text-gray-400 font-medium px-6 py-3">Mã</th>
              <th className="text-left text-gray-400 font-medium px-6 py-3">Tiêu đề</th>
              <th className="text-left text-gray-400 font-medium px-6 py-3">Người tạo</th>
              <th className="text-left text-gray-400 font-medium px-6 py-3">Loại</th>
              <th className="text-left text-gray-400 font-medium px-6 py-3">Ưu tiên</th>
              <th className="text-left text-gray-400 font-medium px-6 py-3">Trạng thái</th>
              <th className="text-left text-gray-400 font-medium px-6 py-3">Ngày tạo</th>
              <th className="text-left text-gray-400 font-medium px-6 py-3">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2e2e2e]">
            {filteredProposals.map((proposal) => (
              <tr key={proposal.maYC} className="hover:bg-[#2e2e2e]/50">
                <td className="px-6 py-4 text-gray-300">#{proposal.maYC}</td>
                <td className="px-6 py-4 text-white">{proposal.tieuDe}</td>
                <td className="px-6 py-4 text-gray-300">{proposal.nguoiTao.username}</td>
                <td className="px-6 py-4 text-gray-300">
                  {PROPOSAL_TYPES[proposal.loaiYC as keyof typeof PROPOSAL_TYPES]}
                </td>
                <td className="px-6 py-4">{getPriorityBadge(proposal.mucDoUuTien)}</td>
                <td className="px-6 py-4">{getStatusBadge(proposal.trangThai)}</td>
                <td className="px-6 py-4 text-gray-400">{new Date(proposal.ngayTao).toLocaleDateString('vi-VN')}</td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => {
                      setSelectedProposal(proposal)
                      setNewPriority(proposal.mucDoUuTien)
                    }}
                    className="text-cyan-400 hover:text-cyan-300"
                  >
                    Xem chi tiết
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal chi tiết */}
      {selectedProposal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Chi tiết đề xuất #{selectedProposal.maYC}</h2>
              <button onClick={() => { setSelectedProposal(null); setGhiChu(''); setKetQua(''); setNewPriority(''); }} className="text-gray-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Loại đề xuất</p>
                  <p className="text-white">{PROPOSAL_TYPES[selectedProposal.loaiYC as keyof typeof PROPOSAL_TYPES]}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Trạng thái</p>
                  {getStatusBadge(selectedProposal.trangThai)}
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Người tạo</p>
                  <p className="text-white">{selectedProposal.nguoiTao.username}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Mức độ ưu tiên hiện tại</p>
                  {getPriorityBadge(selectedProposal.mucDoUuTien)}
                </div>
              </div>

              <div>
                <p className="text-gray-400 text-sm">Tiêu đề</p>
                <p className="text-white">{selectedProposal.tieuDe}</p>
              </div>

              {selectedProposal.moTa && (
                <div>
                  <p className="text-gray-400 text-sm">Mô tả</p>
                  <p className="text-white">{selectedProposal.moTa}</p>
                </div>
              )}

              {selectedProposal.lyDo && (
                <div>
                  <p className="text-gray-400 text-sm">Lý do</p>
                  <p className="text-white">{selectedProposal.lyDo}</p>
                </div>
              )}

              {/* ===== TIMELINE LỊCH SỬ XỬ LÝ ===== */}
              <div className="bg-[#2e2e2e] rounded-lg p-4">
                <p className="text-white text-sm font-medium mb-3">📋 Lịch sử xử lý</p>
                <div className="relative pl-6 space-y-4">
                  {/* Dọc line */}
                  <div className="absolute left-2 top-1 bottom-1 w-0.5 bg-[#3e3e3e]"></div>
                  
                  {/* Bước 1: Tạo đề xuất */}
                  <div className="relative">
                    <div className="absolute -left-4 w-3 h-3 rounded-full bg-green-500"></div>
                    <p className="text-green-400 text-sm font-medium">Tạo đề xuất</p>
                    <p className="text-gray-400 text-xs">{new Date(selectedProposal.ngayTao).toLocaleString('vi-VN')}</p>
                    <p className="text-gray-300 text-xs">Bởi: {selectedProposal.nguoiTao.username}</p>
                  </div>

                  {/* Bước 2: IT tiếp nhận */}
                  {selectedProposal.itXuLy.ngayXuLy && (
                    <div className="relative">
                      <div className="absolute -left-4 w-3 h-3 rounded-full bg-cyan-500"></div>
                      <p className="text-cyan-400 text-sm font-medium">IT xử lý</p>
                      <p className="text-gray-400 text-xs">{new Date(selectedProposal.itXuLy.ngayXuLy).toLocaleString('vi-VN')}</p>
                      <p className="text-gray-300 text-xs">Bởi: {selectedProposal.itXuLy.tenNV || 'IT'}</p>
                    </div>
                  )}

                  {/* Bước 3: GĐ duyệt */}
                  {selectedProposal.giamDoc.ngayDuyet && (
                    <div className="relative">
                      <div className={`absolute -left-4 w-3 h-3 rounded-full ${
                        selectedProposal.trangThai === 'rejected' ? 'bg-red-500' : 'bg-purple-500'
                      }`}></div>
                      <p className={`text-sm font-medium ${
                        selectedProposal.trangThai === 'rejected' ? 'text-red-400' : 'text-purple-400'
                      }`}>
                        {selectedProposal.trangThai === 'rejected' ? 'GĐ từ chối' : 'GĐ duyệt'}
                      </p>
                      <p className="text-gray-400 text-xs">{new Date(selectedProposal.giamDoc.ngayDuyet).toLocaleString('vi-VN')}</p>
                      <p className="text-gray-300 text-xs">Bởi: {selectedProposal.giamDoc.tenNV || 'Giám đốc'}</p>
                    </div>
                  )}

                  {/* IT duyệt trực tiếp */}
                  {selectedProposal.trangThai === 'it_approved' && selectedProposal.itXuLy.ngayXuLy && (
                    <div className="relative">
                      <div className="absolute -left-4 w-3 h-3 rounded-full bg-green-500"></div>
                      <p className="text-green-400 text-sm font-medium">IT duyệt trực tiếp</p>
                      <p className="text-gray-400 text-xs">{new Date(selectedProposal.itXuLy.ngayXuLy).toLocaleString('vi-VN')}</p>
                      <p className="text-gray-300 text-xs">Bởi: {selectedProposal.itXuLy.tenNV || 'IT'}</p>
                    </div>
                  )}

                  {/* IT từ chối */}
                  {selectedProposal.trangThai === 'it_rejected' && (
                    <div className="relative">
                      <div className="absolute -left-4 w-3 h-3 rounded-full bg-red-500"></div>
                      <p className="text-red-400 text-sm font-medium">IT từ chối</p>
                      <p className="text-gray-400 text-xs">{selectedProposal.itXuLy.ngayXuLy ? new Date(selectedProposal.itXuLy.ngayXuLy).toLocaleString('vi-VN') : ''}</p>
                      <p className="text-gray-300 text-xs">Bởi: {selectedProposal.itXuLy.tenNV || 'IT'}</p>
                    </div>
                  )}

                  {/* Bước 4: Hoàn thành */}
                  {selectedProposal.ngayHoanThanh && (
                    <div className="relative">
                      <div className="absolute -left-4 w-3 h-3 rounded-full bg-green-500"></div>
                      <p className="text-green-400 text-sm font-medium">Hoàn thành</p>
                      <p className="text-gray-400 text-xs">{new Date(selectedProposal.ngayHoanThanh).toLocaleString('vi-VN')}</p>
                      <p className="text-gray-300 text-xs">Bởi: {selectedProposal.itXuLy.tenNV || 'IT'}</p>
                    </div>
                  )}

                  {/* Trạng thái chờ */}
                  {selectedProposal.trangThai === 'pending' && (
                    <div className="relative">
                      <div className="absolute -left-4 w-3 h-3 rounded-full bg-yellow-500 animate-pulse"></div>
                      <p className="text-yellow-400 text-sm font-medium">Chờ IT xử lý...</p>
                    </div>
                  )}
                  {selectedProposal.trangThai === 'it_processing' && (
                    <div className="relative">
                      <div className="absolute -left-4 w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
                      <p className="text-blue-400 text-sm font-medium">IT đang xử lý...</p>
                    </div>
                  )}
                  {selectedProposal.trangThai === 'waiting_approval' && (
                    <div className="relative">
                      <div className="absolute -left-4 w-3 h-3 rounded-full bg-purple-500 animate-pulse"></div>
                      <p className="text-purple-400 text-sm font-medium">Chờ GĐ duyệt...</p>
                    </div>
                  )}
                  {(selectedProposal.trangThai === 'approved' || selectedProposal.trangThai === 'it_approved') && !selectedProposal.ngayHoanThanh && (
                    <div className="relative">
                      <div className="absolute -left-4 w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                      <p className="text-green-400 text-sm font-medium">Đã duyệt - Chờ hoàn thành...</p>
                    </div>
                  )}
                </div>
              </div>

              {/* ===== CHỈNH MỨC ĐỘ ƯU TIÊN (IT) ===== */}
              {(selectedProposal.trangThai === 'pending' || selectedProposal.trangThai === 'it_processing') && (
                <div className="bg-[#2e2e2e] rounded-lg p-4 space-y-3">
                  <p className="text-cyan-400 text-sm font-medium">⚙️ Chỉnh mức độ ưu tiên</p>
                  <div className="flex gap-2 flex-wrap">
                    {Object.entries(PRIORITY_LEVELS).map(([key, value]) => (
                      <button
                        key={key}
                        onClick={() => setNewPriority(key)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          newPriority === key 
                            ? 'bg-cyan-600 text-white' 
                            : 'bg-[#3e3e3e] text-gray-300 hover:bg-[#4e4e4e]'
                        }`}
                      >
                        {value.label}
                      </button>
                    ))}
                  </div>
                  {newPriority !== selectedProposal.mucDoUuTien && (
                    <button
                      onClick={() => handleUpdatePriority(selectedProposal.maYC)}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 text-sm"
                    >
                      Lưu mức ưu tiên mới
                    </button>
                  )}
                </div>
              )}
              {/* Hiện thị lịch sử phản hồi (IT xem tất cả) */}
              <FeedbackTimeline
                ghiChuIT={selectedProposal.ghiChuIT}
                viewerRole="it"
              />
              {/* Phản hồi từ Giám đốc */}
              <DirectorFeedbackTimeline
                ghiChuGD={selectedProposal.ghiChuGD}
                viewerRole="it"
              />
              {/* Phản hồi từ User */}
              <UserFeedbackTimeline
                ghiChuIT={selectedProposal.ghiChuIT}
                ghiChuGD={selectedProposal.ghiChuGD}
                viewerRole="it"
              />
              {/* ===== GỬI PHẢN HỒI (IT) ===== */}
              {(selectedProposal.trangThai === 'pending' || 
                selectedProposal.trangThai === 'it_processing' || 
                selectedProposal.trangThai === 'waiting_approval') && (
                <div className="bg-[#2e2e2e] rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-orange-400 text-sm font-medium">💬 Phản hồi User/Giám đốc</p>
                    <button
                      onClick={() => setShowFeedbackForm(!showFeedbackForm)}
                      className="text-sm text-cyan-400 hover:text-cyan-300"
                    >
                      {showFeedbackForm ? 'Ẩn' : 'Mở form'}
                    </button>
                  </div>
                  
                  {showFeedbackForm && (
                    <div className="space-y-3">
                      <div>
                        <p className="text-gray-400 text-xs mb-2">Gửi cho:</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setFeedbackRecipient('user')}
                            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                              feedbackRecipient === 'user'
                                ? 'bg-blue-600 text-white'
                                : 'bg-[#3e3e3e] text-gray-300 hover:bg-[#4e4e4e]'
                            }`}
                          >
                            👤 User
                          </button>
                          <button
                            onClick={() => setFeedbackRecipient('director')}
                            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                              feedbackRecipient === 'director'
                                ? 'bg-purple-600 text-white'
                                : 'bg-[#3e3e3e] text-gray-300 hover:bg-[#4e4e4e]'
                            }`}
                          >
                            👔 Giám đốc
                          </button>
                          <button
                            onClick={() => setFeedbackRecipient('both')}
                            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                              feedbackRecipient === 'both'
                                ? 'bg-orange-600 text-white'
                                : 'bg-[#3e3e3e] text-gray-300 hover:bg-[#4e4e4e]'
                            }`}
                          >
                            👥 Cả hai
                          </button>
                        </div>
                      </div>
                      <textarea
                        value={feedbackContent}
                        onChange={(e) => setFeedbackContent(e.target.value)}
                        placeholder="Nhập nội dung phản hồi..."
                        className="w-full bg-[#3e3e3e] border border-[#4e4e4e] text-white rounded-lg px-4 py-3 text-sm"
                        rows={3}
                      />
                      <button
                        onClick={() => handleSendFeedback(selectedProposal.maYC)}
                        disabled={actionLoading || !feedbackContent.trim()}
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 text-sm"
                      >
                        Gửi phản hồi
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Actions cho trạng thái PENDING */}
              {selectedProposal.trangThai === 'pending' && (
                <div className="pt-4 border-t border-[#2e2e2e] space-y-4">
                  <div className="flex gap-3 flex-wrap">
                    <button
                      onClick={() => handleProcess(selectedProposal.maYC)}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50"
                    >
                      Xác nhận & Bắt đầu xử lý
                    </button>
                    
                    {/* Nút IT duyệt trực tiếp */}
                    <button
                      onClick={() => handleItDirectApprove(selectedProposal.maYC)}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      ✓ IT duyệt
                    </button>
                    
                    <button
                      onClick={() => handleReject(selectedProposal.maYC)}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      Từ chối
                    </button>
                  </div>
                </div>
              )}

              {/* Actions cho trạng thái IT_PROCESSING */}
              {selectedProposal.trangThai === 'it_processing' && (
                <div className="pt-4 border-t border-[#2e2e2e] space-y-4">
                  <div className="flex gap-3 flex-wrap">
                    <button
                      onClick={() => handleSubmitToDirector(selectedProposal.maYC)}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                    >
                      Chuyển lên GĐ duyệt
                    </button>
                    
                    {/* Nút IT duyệt trực tiếp */}
                    <button
                      onClick={() => handleItDirectApprove(selectedProposal.maYC)}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      ✓ IT duyệt
                    </button>
                    
                    <button
                      onClick={() => handleReject(selectedProposal.maYC)}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      Từ chối
                    </button>
                  </div>
                </div>
              )}

              {/* Actions cho trạng thái APPROVED hoặc IT_APPROVED */}
              {(selectedProposal.trangThai === 'approved' || selectedProposal.trangThai === 'it_approved') && (
                <div className="pt-4 border-t border-[#2e2e2e] space-y-4">
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                    <p className="text-green-400 text-sm">
                      {selectedProposal.trangThai === 'it_approved' 
                        ? '✓ IT đã duyệt trực tiếp' 
                        : '✓ Giám đốc đã duyệt đề xuất này'}
                    </p>
                  </div>
                  
                  {/* Nút Sửa quyết định cho IT_APPROVED */}
                  {selectedProposal.trangThai === 'it_approved' && !editMode && (
                    <button
                      onClick={() => { setEditMode(true); setEditAction('none') }}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                    >
                      ✏️ Sửa quyết định
                    </button>
                  )}

                  {/* Edit mode buttons - hiển thị 3 nút với logic theo yêu cầu */}
                  {selectedProposal.trangThai === 'it_approved' && editMode && (
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 space-y-3">
                      <p className="text-yellow-400 text-sm font-medium">Thay đổi quyết định:</p>
                      <div className="flex gap-3 flex-wrap">
                        {/* Nút Trình GĐ: sáng khi editAction=none, mờ khi đã chọn forward */}
                        <button
                          onClick={() => setEditAction('forward')}
                          disabled={actionLoading || editAction === 'forward'}
                          className={`px-4 py-2 rounded-lg transition-colors ${
                            editAction === 'forward'
                              ? 'bg-purple-800 text-purple-300 cursor-not-allowed opacity-50'
                              : 'bg-purple-600 text-white hover:bg-purple-700'
                          }`}
                        >
                          Trình GĐ
                        </button>
                        {/* Nút Từ chối: sáng khi editAction=none, mờ khi đã chọn reject */}
                        <button
                          onClick={() => setEditAction('reject')}
                          disabled={actionLoading || editAction === 'reject'}
                          className={`px-4 py-2 rounded-lg transition-colors ${
                            editAction === 'reject'
                              ? 'bg-red-800 text-red-300 cursor-not-allowed opacity-50'
                              : 'bg-red-600 text-white hover:bg-red-700'
                          }`}
                        >
                          Từ chối
                        </button>
                        {/* Nút IT duyệt: mờ khi editAction=none, sáng khi đã chọn forward/reject */}
                        <button
                          onClick={() => setEditAction('none')}
                          disabled={actionLoading || editAction === 'none'}
                          className={`px-4 py-2 rounded-lg transition-colors ${
                            editAction === 'none'
                              ? 'bg-green-800 text-green-300 cursor-not-allowed opacity-50'
                              : 'bg-green-600 text-white hover:bg-green-700'
                          }`}
                        >
                          ✓ IT duyệt
                        </button>
                      </div>
                      
                      {/* Xác nhận thay đổi */}
                      <div className="flex gap-3 pt-2">
                        {editAction === 'forward' && (
                          <button
                            onClick={async () => {
                              await handleSubmitToDirector(selectedProposal.maYC)
                              setEditMode(false)
                              setEditAction('none')
                            }}
                            disabled={actionLoading}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                          >
                            Xác nhận chuyển GĐ
                          </button>
                        )}
                        {editAction === 'reject' && (
                          <button
                            onClick={async () => {
                              await handleReject(selectedProposal.maYC)
                              setEditMode(false)
                              setEditAction('none')
                            }}
                            disabled={actionLoading}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                          >
                            Xác nhận từ chối
                          </button>
                        )}
                        <button
                          onClick={() => { setEditMode(false); setEditAction('none') }}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                        >
                          {editAction === 'none' ? 'Giữ nguyên IT duyệt' : 'Hủy'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Phần hoàn thành */}
                  {!editMode && (
                    <>
                      <textarea
                        value={ketQua}
                        onChange={(e) => setKetQua(e.target.value)}
                        placeholder="Nhập kết quả thực hiện..."
                        className="w-full bg-[#2e2e2e] border border-[#3e3e3e] text-white rounded-lg px-4 py-3"
                        rows={3}
                      />
                      <button
                        onClick={() => handleComplete(selectedProposal.maYC)}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        Đánh dấu hoàn thành
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Hiển thị thông tin cho các trạng thái khác */}
              {selectedProposal.trangThai === 'waiting_approval' && (
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                  <p className="text-purple-400 text-sm">⏳ Đang chờ Giám đốc duyệt</p>
                </div>
              )}

              {selectedProposal.trangThai === 'completed' && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                  <p className="text-green-400 text-sm">✅ Đề xuất đã hoàn thành</p>
                  {selectedProposal.ketQua && (
                    <p className="text-white mt-2">Kết quả: {selectedProposal.ketQua}</p>
                  )}
                </div>
              )}

              {(selectedProposal.trangThai === 'rejected' || selectedProposal.trangThai === 'it_rejected') && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                  <p className="text-red-400 text-sm">
                    ❌ {selectedProposal.trangThai === 'it_rejected' ? 'IT từ chối' : 'GĐ từ chối'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
