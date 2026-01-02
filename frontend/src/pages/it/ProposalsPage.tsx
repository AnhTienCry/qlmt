import { useState, useEffect } from 'react'
import { getProposals, processProposal, submitToDirector, itRejectProposal, completeProposal } from '@/libs/proposal'
import { Proposal } from '@/types/proposal.types'
import { PROPOSAL_STATUS, PROPOSAL_TYPES } from '@/constants'

export default function ITProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [ghiChu, setGhiChu] = useState('')
  const [ketQua, setKetQua] = useState('')

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
      await fetchProposals()
      setSelectedProposal(null)
      setGhiChu('')
    } catch (error) {
      console.error('Error processing:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleSubmitToDirector = async (id: number) => {
    setActionLoading(true)
    try {
      await submitToDirector(id, ghiChu)
      await fetchProposals()
      setSelectedProposal(null)
      setGhiChu('')
    } catch (error) {
      console.error('Error submitting:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async (id: number) => {
    if (!ghiChu.trim()) {
      alert('Vui lòng nhập lý do từ chối')
      return
    }
    setActionLoading(true)
    try {
      await itRejectProposal(id, ghiChu)
      await fetchProposals()
      setSelectedProposal(null)
      setGhiChu('')
    } catch (error) {
      console.error('Error rejecting:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleComplete = async (id: number) => {
    if (!ketQua.trim()) {
      alert('Vui lòng nhập kết quả thực hiện')
      return
    }
    setActionLoading(true)
    try {
      await completeProposal(id, ketQua)
      await fetchProposals()
      setSelectedProposal(null)
      setKetQua('')
    } catch (error) {
      console.error('Error completing:', error)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Xử lý đề xuất</h1>
        <p className="text-gray-400 mt-1">Danh sách đề xuất cần xử lý</p>
      </div>

      <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#2e2e2e]">
            <tr>
              <th className="text-left text-gray-400 font-medium px-6 py-3">Mã</th>
              <th className="text-left text-gray-400 font-medium px-6 py-3">Tiêu đề</th>
              <th className="text-left text-gray-400 font-medium px-6 py-3">Người tạo</th>
              <th className="text-left text-gray-400 font-medium px-6 py-3">Loại</th>
              <th className="text-left text-gray-400 font-medium px-6 py-3">Trạng thái</th>
              <th className="text-left text-gray-400 font-medium px-6 py-3">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2e2e2e]">
            {proposals.map((proposal) => (
              <tr key={proposal.maYC} className="hover:bg-[#2e2e2e]/50">
                <td className="px-6 py-4 text-gray-300">#{proposal.maYC}</td>
                <td className="px-6 py-4 text-white">{proposal.tieuDe}</td>
                <td className="px-6 py-4 text-gray-300">{proposal.nguoiTao.username}</td>
                <td className="px-6 py-4 text-gray-300">
                  {PROPOSAL_TYPES[proposal.loaiYC as keyof typeof PROPOSAL_TYPES]}
                </td>
                <td className="px-6 py-4">{getStatusBadge(proposal.trangThai)}</td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => setSelectedProposal(proposal)}
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
                  <p className="text-gray-400 text-sm">Trạng thái</p>
                  {getStatusBadge(selectedProposal.trangThai)}
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Người tạo</p>
                  <p className="text-white">{selectedProposal.nguoiTao.username}</p>
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

              {selectedProposal.lyDo && (
                <div>
                  <p className="text-gray-400 text-sm">Lý do</p>
                  <p className="text-white">{selectedProposal.lyDo}</p>
                </div>
              )}

              {/* Actions */}
              {selectedProposal.trangThai === 'pending' && (
                <div className="pt-4 border-t border-[#2e2e2e] space-y-4">
                  <textarea
                    value={ghiChu}
                    onChange={(e) => setGhiChu(e.target.value)}
                    placeholder="Ghi chú (tùy chọn)..."
                    className="w-full bg-[#2e2e2e] border border-[#3e3e3e] text-white rounded-lg px-4 py-3"
                    rows={2}
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleProcess(selectedProposal.maYC)}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50"
                    >
                      Bắt đầu xử lý
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

              {selectedProposal.trangThai === 'it_processing' && (
                <div className="pt-4 border-t border-[#2e2e2e] space-y-4">
                  <textarea
                    value={ghiChu}
                    onChange={(e) => setGhiChu(e.target.value)}
                    placeholder="Ghi chú cho Giám đốc..."
                    className="w-full bg-[#2e2e2e] border border-[#3e3e3e] text-white rounded-lg px-4 py-3"
                    rows={2}
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleSubmitToDirector(selectedProposal.maYC)}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                    >
                      Chuyển lên GĐ duyệt
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

              {selectedProposal.trangThai === 'approved' && (
                <div className="pt-4 border-t border-[#2e2e2e] space-y-4">
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
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
