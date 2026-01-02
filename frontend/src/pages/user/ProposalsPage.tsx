import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getProposals } from '@/libs/proposal'
import { Proposal } from '@/types/proposal.types'
import { ROUTES, PROPOSAL_STATUS, PROPOSAL_TYPES } from '@/constants'

export default function UserProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)

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
                <th className="text-left text-gray-400 font-medium px-6 py-3">Mã</th>
                <th className="text-left text-gray-400 font-medium px-6 py-3">Tiêu đề</th>
                <th className="text-left text-gray-400 font-medium px-6 py-3">Loại</th>
                <th className="text-left text-gray-400 font-medium px-6 py-3">Trạng thái</th>
                <th className="text-left text-gray-400 font-medium px-6 py-3">Ngày tạo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2e2e2e]">
              {proposals.map((proposal) => (
                <tr key={proposal.maYC} className="hover:bg-[#2e2e2e]/50">
                  <td className="px-6 py-4 text-gray-300">#{proposal.maYC}</td>
                  <td className="px-6 py-4 text-white">{proposal.tieuDe}</td>
                  <td className="px-6 py-4 text-gray-300">
                    {PROPOSAL_TYPES[proposal.loaiYC as keyof typeof PROPOSAL_TYPES]}
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(proposal.trangThai)}</td>
                  <td className="px-6 py-4 text-gray-400">
                    {new Date(proposal.ngayTao).toLocaleDateString('vi-VN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
