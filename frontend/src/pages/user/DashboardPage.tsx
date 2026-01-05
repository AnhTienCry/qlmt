import { useAuth } from '@/hooks/useAuth'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants'
import { useState, useEffect } from 'react'
import { getProposals } from '@/libs/proposal'
import { Proposal } from '@/types/proposal.types'
import { PROPOSAL_STATUS, PROPOSAL_TYPES } from '@/constants'

export default function UserDashboardPage() {
  const { user } = useAuth()
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMyProposals()
  }, [])

  const fetchMyProposals = async () => {
    try {
      const response = await getProposals()
      setProposals(response.data || [])
    } catch (error) {
      console.error('Error fetching proposals:', error)
    } finally {
      setLoading(false)
    }
  }

  // Tính toán thống kê
  const stats = {
    total: proposals.length,
    pending: proposals.filter(p => p.trangThai === 'pending' || p.trangThai === 'it_processing' || p.trangThai === 'waiting_approval').length,
    approved: proposals.filter(p => p.trangThai === 'approved' || p.trangThai === 'it_approved').length,
    completed: proposals.filter(p => p.trangThai === 'completed').length,
    rejected: proposals.filter(p => p.trangThai === 'rejected' || p.trangThai === 'it_rejected').length,
  }

  const recentProposals = proposals.slice(0, 5)

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
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${colorClasses[statusInfo.color]}`}>
        {statusInfo.label}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-[#2e2e2e] rounded-xl p-6">
        <h1 className="text-2xl font-bold text-white">Xin chào, {user?.tenNV || user?.username}! 👋</h1>
        <p className="text-gray-400 mt-1">Chào mừng bạn đến với hệ thống quản lý máy tính</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Tổng đề xuất</p>
              <p className="text-xl font-bold text-white">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Đang chờ</p>
              <p className="text-xl font-bold text-yellow-400">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Hoàn thành</p>
              <p className="text-xl font-bold text-green-400">{stats.completed}</p>
            </div>
          </div>
        </div>

        <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Từ chối</p>
              <p className="text-xl font-bold text-red-400">{stats.rejected}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to={ROUTES.USER_MY_COMPUTER}
          className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-6 hover:border-green-500 transition-colors group"
        >
          <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-600/30 transition">
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-white font-semibold mb-2">Thiết bị của tôi</h3>
          <p className="text-gray-400 text-sm">Xem thông tin thiết bị được gán cho bạn</p>
        </Link>

        <Link
          to={ROUTES.USER_PROPOSALS}
          className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-6 hover:border-blue-500 transition-colors group"
        >
          <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600/30 transition">
            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-white font-semibold mb-2">Đề xuất của tôi</h3>
          <p className="text-gray-400 text-sm">Xem và theo dõi các đề xuất</p>
        </Link>

        <Link
          to={ROUTES.USER_PROPOSALS_NEW}
          className="bg-gradient-to-br from-green-600/20 to-blue-600/20 border border-green-500/50 rounded-xl p-6 hover:border-green-400 transition-colors group"
        >
          <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-white/20 transition">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h3 className="text-white font-semibold mb-2">Tạo đề xuất mới</h3>
          <p className="text-gray-300 text-sm">Đề xuất nâng cấp, sửa chữa thiết bị</p>
        </Link>
      </div>

      {/* Recent proposals */}
      <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl overflow-hidden">
        <div className="p-4 border-b border-[#2e2e2e] flex items-center justify-between">
          <h2 className="text-white font-semibold">Đề xuất gần đây</h2>
          <Link to={ROUTES.USER_PROPOSALS} className="text-green-400 text-sm hover:text-green-300">
            Xem tất cả →
          </Link>
        </div>
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500 mx-auto"></div>
          </div>
        ) : recentProposals.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">Bạn chưa có đề xuất nào</p>
            <Link to={ROUTES.USER_PROPOSALS_NEW} className="text-green-400 text-sm hover:underline mt-2 inline-block">
              Tạo đề xuất đầu tiên →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[#2e2e2e]">
            {recentProposals.map((proposal) => (
              <div key={proposal.maYC} className="p-4 hover:bg-[#2e2e2e]/50 transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{proposal.tieuDe}</p>
                    <p className="text-gray-500 text-sm">
                      {PROPOSAL_TYPES[proposal.loaiYC as keyof typeof PROPOSAL_TYPES]} • {new Date(proposal.ngayTao).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  {getStatusBadge(proposal.trangThai)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
