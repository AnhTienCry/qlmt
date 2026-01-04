import { useState, useEffect } from 'react'
import { getProposals, approveProposal, rejectProposal, directorSendFeedback } from '@/libs/proposal'
import { Proposal } from '@/types/proposal.types'
import { PROPOSAL_STATUS, PROPOSAL_TYPES } from '@/constants'
import { useToast, FeedbackTimeline, DirectorFeedbackTimeline } from '@/components/ui'

export default function DirectorProposalsPage() {
  const toast = useToast()
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [ghiChu, setGhiChu] = useState('')
  // Feedback states
  const [showFeedbackForm, setShowFeedbackForm] = useState(false)
  const [feedbackContent, setFeedbackContent] = useState('')
  const [feedbackRecipient, setFeedbackRecipient] = useState<'user' | 'it' | 'both'>('user')

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

  const handleApprove = async (id: number) => {
    setActionLoading(true)
    try {
      await approveProposal(id, ghiChu)
      toast.success('Đã duyệt đề xuất thành công!')
      await fetchProposals()
      setSelectedProposal(null)
      setGhiChu('')
    } catch (error: any) {
      console.error('Error approving:', error)
      toast.error(error.response?.data?.message || 'Lỗi duyệt đề xuất')
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
      await rejectProposal(id, ghiChu)
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

  const handleSendFeedback = async (id: number) => {
    if (!feedbackContent.trim()) {
      toast.warning('Vui lòng nhập nội dung phản hồi')
      return
    }
    setActionLoading(true)
    try {
      await directorSendFeedback(id, feedbackContent, feedbackRecipient)
      toast.success('Đã gửi phản hồi!')
      setFeedbackContent('')
      setShowFeedbackForm(false)
      await fetchProposals()
      // Refresh selectedProposal
      const response = await getProposals()
      const updated = response.data.find(p => p.maYC === id)
      if (updated) setSelectedProposal(updated)
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
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${colorClasses[statusInfo.color]}`}>
        {statusInfo.label}
      </span>
    )
  }

  // Lọc chỉ hiển thị đề xuất chờ duyệt
  const waitingProposals = proposals.filter((p) => p.trangThai === 'waiting_approval')
  const otherProposals = proposals.filter((p) => p.trangThai !== 'waiting_approval')

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Duyệt đề xuất</h1>
        <p className="text-gray-400 mt-1">Các đề xuất cần duyệt</p>
      </div>

      {/* Chờ duyệt */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Chờ duyệt ({waitingProposals.length})</h2>
        {waitingProposals.length === 0 ? (
          <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-6 text-center">
            <p className="text-gray-400">Không có đề xuất nào cần duyệt</p>
          </div>
        ) : (
          <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#2e2e2e]">
                <tr>
                  <th className="text-left text-gray-400 font-medium px-6 py-3">Mã</th>
                  <th className="text-left text-gray-400 font-medium px-6 py-3">Tiêu đề</th>
                  <th className="text-left text-gray-400 font-medium px-6 py-3">Loại</th>
                  <th className="text-left text-gray-400 font-medium px-6 py-3">IT ghi chú</th>
                  <th className="text-left text-gray-400 font-medium px-6 py-3">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2e2e2e]">
                {waitingProposals.map((proposal) => (
                  <tr key={proposal.maYC} className="hover:bg-[#2e2e2e]/50">
                    <td className="px-6 py-4 text-gray-300">#{proposal.maYC}</td>
                    <td className="px-6 py-4 text-white">{proposal.tieuDe}</td>
                    <td className="px-6 py-4 text-gray-300">
                      {PROPOSAL_TYPES[proposal.loaiYC as keyof typeof PROPOSAL_TYPES]}
                    </td>
                    <td className="px-6 py-4 text-gray-400 max-w-xs truncate">
                      {proposal.itXuLy.ghiChu || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedProposal(proposal)}
                        className="text-purple-400 hover:text-purple-300"
                      >
                        Xem & Duyệt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Đã xử lý */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Lịch sử ({otherProposals.length})</h2>
        <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#2e2e2e]">
              <tr>
                <th className="text-left text-gray-400 font-medium px-6 py-3">Mã</th>
                <th className="text-left text-gray-400 font-medium px-6 py-3">Tiêu đề</th>
                <th className="text-left text-gray-400 font-medium px-6 py-3">Trạng thái</th>
                <th className="text-left text-gray-400 font-medium px-6 py-3">Ngày</th>
                <th className="text-left text-gray-400 font-medium px-6 py-3">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2e2e2e]">
              {otherProposals.slice(0, 10).map((proposal) => (
                <tr key={proposal.maYC} className="hover:bg-[#2e2e2e]/50 cursor-pointer" onClick={() => setSelectedProposal(proposal)}>
                  <td className="px-6 py-4 text-gray-300">#{proposal.maYC}</td>
                  <td className="px-6 py-4 text-white">{proposal.tieuDe}</td>
                  <td className="px-6 py-4">{getStatusBadge(proposal.trangThai)}</td>
                  <td className="px-6 py-4 text-gray-400">
                    {new Date(proposal.ngayCapNhat).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-purple-400 hover:text-purple-300 text-sm">
                      Xem chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal chi tiết/duyệt */}
      {selectedProposal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                {selectedProposal.trangThai === 'waiting_approval' ? 'Duyệt' : 'Chi tiết'} đề xuất #{selectedProposal.maYC}
              </h2>
              <button onClick={() => setSelectedProposal(null)} className="text-gray-400 hover:text-white">
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
                  <p className="text-gray-400 text-sm">Mức độ ưu tiên</p>
                  <p className="text-white">{selectedProposal.mucDoUuTien}</p>
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

              {/* Ghi chú từ IT (ghi chú thường khi xử lý/chuyển GĐ) */}
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
                viewerRole="director"
              />

              {/* Phản hồi đã gửi từ GĐ */}
              <DirectorFeedbackTimeline
                ghiChuGD={selectedProposal.ghiChuGD}
                viewerRole="director"
              />

              {/* ===== GỬI PHẢN HỒI (GĐ) ===== */}
              {selectedProposal.trangThai === 'waiting_approval' && (
                <div className="bg-[#2e2e2e] rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-purple-400 text-sm font-medium">💬 Phản hồi User/IT</p>
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
                            onClick={() => setFeedbackRecipient('it')}
                            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                              feedbackRecipient === 'it'
                                ? 'bg-cyan-600 text-white'
                                : 'bg-[#3e3e3e] text-gray-300 hover:bg-[#4e4e4e]'
                            }`}
                          >
                            🔧 IT
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
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm"
                      >
                        Gửi phản hồi
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Nếu chờ duyệt -> hiện form duyệt/từ chối */}
              {selectedProposal.trangThai === 'waiting_approval' ? (
                <div className="pt-4 border-t border-[#2e2e2e] space-y-4">
                  <textarea
                    value={ghiChu}
                    onChange={(e) => setGhiChu(e.target.value)}
                    placeholder="Ghi chú của Giám đốc..."
                    className="w-full bg-[#2e2e2e] border border-[#3e3e3e] text-white rounded-lg px-4 py-3"
                    rows={2}
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(selectedProposal.maYC)}
                      disabled={actionLoading}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      ✓ Duyệt
                    </button>
                    <button
                      onClick={() => handleReject(selectedProposal.maYC)}
                      disabled={actionLoading}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      ✗ Từ chối
                    </button>
                  </div>
                </div>
              ) : (
                /* Nếu đã xử lý -> hiện kết quả */
                <div className="pt-4 border-t border-[#2e2e2e] space-y-3">
                  {/* Trạng thái quyết định của GĐ */}
                  <div className={`rounded-lg p-3 ${
                    selectedProposal.trangThai === 'approved' || selectedProposal.trangThai === 'completed'
                      ? 'bg-green-500/10 border border-green-500/30'
                      : selectedProposal.trangThai === 'rejected'
                        ? 'bg-red-500/10 border border-red-500/30'
                        : 'bg-gray-500/10 border border-gray-500/30'
                  }`}>
                    <p className={`text-sm font-medium ${
                      selectedProposal.trangThai === 'approved' || selectedProposal.trangThai === 'completed'
                        ? 'text-green-400'
                        : selectedProposal.trangThai === 'rejected'
                          ? 'text-red-400'
                          : 'text-gray-400'
                    }`}>
                      {selectedProposal.trangThai === 'approved' && '✓ Bạn đã duyệt đề xuất này'}
                      {selectedProposal.trangThai === 'completed' && '✓ Đã hoàn thành'}
                      {selectedProposal.trangThai === 'rejected' && '✗ Bạn đã từ chối đề xuất này'}
                      {!['approved', 'completed', 'rejected'].includes(selectedProposal.trangThai) && getStatusBadge(selectedProposal.trangThai)}
                    </p>
                    {selectedProposal.giamDoc.ngayDuyet && (
                      <p className="text-gray-400 text-xs mt-1">
                        Ngày: {new Date(selectedProposal.giamDoc.ngayDuyet).toLocaleString('vi-VN')}
                      </p>
                    )}
                  </div>
                  {/* Kết quả thực hiện */}
                  {selectedProposal.ketQua && (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                      <p className="text-green-400 text-sm font-medium mb-1">📋 Kết quả thực hiện:</p>
                      <p className="text-white text-sm">{selectedProposal.ketQua}</p>
                    </div>
                  )}
                  {selectedProposal.ngayHoanThanh && (
                    <p className="text-gray-400 text-sm">
                      Ngày hoàn thành: {new Date(selectedProposal.ngayHoanThanh).toLocaleString('vi-VN')}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
