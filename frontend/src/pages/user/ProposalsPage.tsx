import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getProposals } from '@/libs/proposal'
import { Proposal } from '@/types/proposal.types'
import { ROUTES, PROPOSAL_TYPES, PRIORITY_LEVELS, IT_STATUS, GD_STATUS } from '@/constants'
import { FeedbackTimeline, DirectorFeedbackTimeline } from '@/components/ui'

export default function UserProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null)

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

  // Chuyển đổi trạng thái chung -> trạng thái IT riêng
  const getITStatus = (proposal: Proposal) => {
    const { trangThai, ngayHoanThanh } = proposal
    if (ngayHoanThanh) return IT_STATUS.completed
    switch (trangThai) {
      case 'pending': return IT_STATUS.pending
      case 'it_processing': return IT_STATUS.processing
      case 'waiting_approval': return IT_STATUS.forwarded
      case 'it_approved': return IT_STATUS.approved
      case 'approved': return IT_STATUS.forwarded  // IT đã chuyển, GĐ duyệt
      case 'rejected': return IT_STATUS.forwarded  // IT đã chuyển, GĐ từ chối
      case 'it_rejected': return IT_STATUS.rejected
      case 'completed': return IT_STATUS.completed
      default: return IT_STATUS.pending
    }
  }

  // Chuyển đổi trạng thái chung -> trạng thái GĐ riêng
  const getGDStatus = (proposal: Proposal) => {
    const { trangThai } = proposal
    switch (trangThai) {
      case 'pending': return GD_STATUS.none
      case 'it_processing': return GD_STATUS.none
      case 'it_approved': return GD_STATUS.none  // IT duyệt nhỏ, không cần GĐ
      case 'it_rejected': return GD_STATUS.none  // IT từ chối
      case 'waiting_approval': return GD_STATUS.pending
      case 'approved': return GD_STATUS.approved
      case 'rejected': return GD_STATUS.rejected
      case 'completed': 
        // Nếu có giamDoc.ngayDuyet thì GĐ đã duyệt, không thì IT duyệt nhỏ
        return proposal.giamDoc.ngayDuyet ? GD_STATUS.approved : GD_STATUS.none
      default: return GD_STATUS.none
    }
  }

  const getCustomStatusBadge = (statusInfo: { label: string; color: string }) => {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Đề xuất của tôi</h1>
          <p className="text-gray-400 mt-1">Danh sách các đề xuất bạn đã tạo</p>
        </div>
        <Link
          to={ROUTES.USER_PROPOSALS_NEW}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tạo đề xuất mới
        </Link>
      </div>

      {proposals.length === 0 ? (
        <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-8 text-center">
          <p className="text-gray-400 mb-4">Bạn chưa có đề xuất nào</p>
          <Link
            to={ROUTES.USER_PROPOSALS_NEW}
            className="text-green-500 hover:text-green-400"
          >
            Tạo đề xuất đầu tiên →
          </Link>
        </div>
      ) : (
        <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#2e2e2e]">
              <tr>
                <th className="text-left text-gray-400 font-medium px-4 py-3">Mã</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3">Tiêu đề</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3">Loại</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3">IT</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3">GĐ</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3">Ngày tạo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2e2e2e]">
              {proposals.map((proposal) => (
                <tr key={proposal.maYC} className="hover:bg-[#2e2e2e]/50 cursor-pointer" onClick={() => setSelectedProposal(proposal)}>
                  <td className="px-4 py-4 text-gray-300">#{proposal.maYC}</td>
                  <td className="px-4 py-4 text-white">{proposal.tieuDe}</td>
                  <td className="px-4 py-4 text-gray-300">
                    {PROPOSAL_TYPES[proposal.loaiYC as keyof typeof PROPOSAL_TYPES]}
                  </td>
                  <td className="px-4 py-4">{getCustomStatusBadge(getITStatus(proposal))}</td>
                  <td className="px-4 py-4">{getCustomStatusBadge(getGDStatus(proposal))}</td>
                  <td className="px-4 py-4 text-gray-400">
                    {new Date(proposal.ngayTao).toLocaleDateString('vi-VN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal chi tiết đề xuất */}
      {selectedProposal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Chi tiết đề xuất #{selectedProposal.maYC}</h2>
              <button onClick={() => setSelectedProposal(null)} className="text-gray-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Thông tin cơ bản */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Loại đề xuất</p>
                  <p className="text-white">{PROPOSAL_TYPES[selectedProposal.loaiYC as keyof typeof PROPOSAL_TYPES]}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Mức độ ưu tiên</p>
                  {getPriorityBadge(selectedProposal.mucDoUuTien)}
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Ngày tạo</p>
                  <p className="text-white">{new Date(selectedProposal.ngayTao).toLocaleDateString('vi-VN')}</p>
                </div>
              </div>

              {/* ===== TRẠNG THÁI IT + GĐ RIÊNG BIỆT ===== */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
                  <p className="text-cyan-400 text-sm font-medium mb-2">🔧 Trạng thái IT</p>
                  <div className="mb-2">{getCustomStatusBadge(getITStatus(selectedProposal))}</div>
                  {selectedProposal.itXuLy.tenNV && (
                    <p className="text-gray-300 text-xs">Xử lý: {selectedProposal.itXuLy.tenNV}</p>
                  )}
                  {selectedProposal.itXuLy.ngayXuLy && (
                    <p className="text-gray-400 text-xs">{new Date(selectedProposal.itXuLy.ngayXuLy).toLocaleDateString('vi-VN')}</p>
                  )}
                </div>
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                  <p className="text-purple-400 text-sm font-medium mb-2">👔 Trạng thái GĐ</p>
                  <div className="mb-2">{getCustomStatusBadge(getGDStatus(selectedProposal))}</div>
                  {selectedProposal.giamDoc.tenNV && (
                    <p className="text-gray-300 text-xs">Duyệt: {selectedProposal.giamDoc.tenNV}</p>
                  )}
                  {selectedProposal.giamDoc.ngayDuyet && (
                    <p className="text-gray-400 text-xs">{new Date(selectedProposal.giamDoc.ngayDuyet).toLocaleDateString('vi-VN')}</p>
                  )}
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
                      {selectedProposal.giamDoc.ghiChu && (
                        <p className="text-gray-300 text-xs">Ghi chú: {selectedProposal.giamDoc.ghiChu}</p>
                      )}
                    </div>
                  )}

                  {/* IT duyệt trực tiếp */}
                  {selectedProposal.trangThai === 'it_approved' && selectedProposal.itXuLy.ngayXuLy && (
                    <div className="relative">
                      <div className="absolute -left-4 w-3 h-3 rounded-full bg-green-500"></div>
                      <p className="text-green-400 text-sm font-medium">IT duyệt trực tiếp</p>
                      <p className="text-gray-400 text-xs">{new Date(selectedProposal.itXuLy.ngayXuLy).toLocaleString('vi-VN')}</p>
                    </div>
                  )}

                  {/* IT từ chối */}
                  {selectedProposal.trangThai === 'it_rejected' && (
                    <div className="relative">
                      <div className="absolute -left-4 w-3 h-3 rounded-full bg-red-500"></div>
                      <p className="text-red-400 text-sm font-medium">IT từ chối</p>
                      <p className="text-gray-400 text-xs">{selectedProposal.itXuLy.ngayXuLy ? new Date(selectedProposal.itXuLy.ngayXuLy).toLocaleString('vi-VN') : ''}</p>
                    </div>
                  )}

                  {/* Bước 4: Hoàn thành */}
                  {selectedProposal.ngayHoanThanh && (
                    <div className="relative">
                      <div className="absolute -left-4 w-3 h-3 rounded-full bg-green-500"></div>
                      <p className="text-green-400 text-sm font-medium">Hoàn thành</p>
                      <p className="text-gray-400 text-xs">{new Date(selectedProposal.ngayHoanThanh).toLocaleString('vi-VN')}</p>
                      {selectedProposal.ketQua && (
                        <p className="text-gray-300 text-xs">Kết quả: {selectedProposal.ketQua}</p>
                      )}
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

              {/* Ghi chú từ IT (ghi chú thường, không phải phản hồi) */}
              {selectedProposal.ghiChuIT && (() => {
                const normalNotes = selectedProposal.ghiChuIT
                  .split('\n')
                  .filter(l => l.trim() && !l.includes('[IT→') && !l.includes('[Phản hồi '))
                  .join('\n')
                
                if (!normalNotes) return null
                return (
                  <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3">
                    <p className="text-cyan-400 text-sm font-medium mb-1">📝 Ghi chú từ IT:</p>
                    <p className="text-white text-sm whitespace-pre-wrap">{normalNotes}</p>
                  </div>
                )
              })()}

              {/* Phản hồi từ IT */}
              <FeedbackTimeline
                ghiChuIT={selectedProposal.ghiChuIT}
                viewerRole="user"
              />

              {/* Phản hồi từ Giám đốc */}
              <DirectorFeedbackTimeline
                ghiChuGD={selectedProposal.ghiChuGD}
                viewerRole="user"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
