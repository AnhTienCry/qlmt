import { useState, useEffect } from 'react'
import { getProposals, approveProposal, rejectProposal } from '@/libs/proposal'
import { Proposal } from '@/types/proposal.types'
import { PROPOSAL_STATUS, PROPOSAL_TYPES } from '@/constants'

export default function DirectorProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [ghiChu, setGhiChu] = useState('')

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
      await fetchProposals()
      setSelectedProposal(null)
      setGhiChu('')
    } catch (error) {
      console.error('Error approving:', error)
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
      await rejectProposal(id, ghiChu)
      await fetchProposals()
      setSelectedProposal(null)
      setGhiChu('')
    } catch (error) {
      console.error('Error rejecting:', error)
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
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2e2e2e]">
              {otherProposals.slice(0, 10).map((proposal) => (
                <tr key={proposal.maYC} className="hover:bg-[#2e2e2e]/50">
                  <td className="px-6 py-4 text-gray-300">#{proposal.maYC}</td>
                  <td className="px-6 py-4 text-white">{proposal.tieuDe}</td>
                  <td className="px-6 py-4">{getStatusBadge(proposal.trangThai)}</td>
                  <td className="px-6 py-4 text-gray-400">
                    {new Date(proposal.ngayCapNhat).toLocaleDateString('vi-VN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal duyệt */}
      {selectedProposal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Duyệt đề xuất #{selectedProposal.maYC}</h2>
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

              {selectedProposal.itXuLy.ghiChu && (
                <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
                  <p className="text-cyan-400 text-sm font-medium">Ghi chú từ IT:</p>
                  <p className="text-white">{selectedProposal.itXuLy.ghiChu}</p>
                </div>
              )}

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
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
