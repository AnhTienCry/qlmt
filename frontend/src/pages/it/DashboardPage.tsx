import { useState, useEffect } from 'react'
import { getProposalStats, getProposals } from '@/libs/proposal'
import { ProposalStats, Proposal } from '@/types/proposal.types'
import { Link } from 'react-router-dom'
import { ROUTES, PROPOSAL_STATUS, PROPOSAL_TYPES, PRIORITY_LEVELS } from '@/constants'
import axios from '@/libs/axios'

interface DashboardStats {
  totalHangHoa: number
  hangHoaTrongKho: number
  totalNhapHang: number
  totalXuatHang: number
}

export default function ITDashboardPage() {
  const [stats, setStats] = useState<ProposalStats | null>(null)
  const [stockStats, setStockStats] = useState<DashboardStats>({ totalHangHoa: 0, hangHoaTrongKho: 0, totalNhapHang: 0, totalXuatHang: 0 })
  const [recentProposals, setRecentProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [statsRes, proposalsRes, hanghoaRes, nhapRes, xuatRes] = await Promise.all([
        getProposalStats(),
        getProposals(),
        axios.get('/hanghoa').catch(() => ({ data: { data: [] } })),
        axios.get('/stock/nhaphang').catch(() => ({ data: { data: [] } })),
        axios.get('/stock/xuathang').catch(() => ({ data: { data: [] } })),
      ])
      setStats(statsRes.data)
      setRecentProposals((proposalsRes.data || []).slice(0, 5))
      
      const hangHoaList = hanghoaRes.data?.data || []
      setStockStats({
        totalHangHoa: hangHoaList.length,
        hangHoaTrongKho: hangHoaList.filter((h: any) => h.TrangThai === 'Trong kho').length,
        totalNhapHang: nhapRes.data?.data?.length || 0,
        totalXuatHang: xuatRes.data?.data?.length || 0,
      })
    } catch (error) {
      console.error('Error fetching data:', error)
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
      cyan: 'bg-cyan-500/20 text-cyan-400',
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border border-[#2e2e2e] rounded-xl p-6">
        <h1 className="text-2xl font-bold text-white">IT Dashboard 🛠️</h1>
        <p className="text-gray-400 mt-1">Tổng quan xử lý đề xuất và quản lý kho</p>
      </div>

      {/* Proposal Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Chờ xử lý</p>
              <p className="text-3xl font-bold text-yellow-400">{stats?.pending || 0}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Đang xử lý</p>
              <p className="text-3xl font-bold text-blue-400">{stats?.processing || 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Chờ GĐ duyệt</p>
              <p className="text-3xl font-bold text-purple-400">{stats?.waitingApproval || 0}</p>
            </div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Hoàn thành</p>
              <p className="text-3xl font-bold text-green-400">{stats?.completed || 0}</p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Stock Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Tổng hàng hóa</p>
              <p className="text-xl font-bold text-white">{stockStats.totalHangHoa}</p>
            </div>
          </div>
        </div>

        <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
              </svg>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Trong kho</p>
              <p className="text-xl font-bold text-blue-400">{stockStats.hangHoaTrongKho}</p>
            </div>
          </div>
        </div>

        <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Phiếu nhập</p>
              <p className="text-xl font-bold text-green-400">{stockStats.totalNhapHang}</p>
            </div>
          </div>
        </div>

        <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Phiếu xuất</p>
              <p className="text-xl font-bold text-red-400">{stockStats.totalXuatHang}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent proposals */}
        <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl overflow-hidden">
          <div className="p-4 border-b border-[#2e2e2e] flex items-center justify-between">
            <h2 className="text-white font-semibold">Đề xuất gần đây</h2>
            <Link to={ROUTES.IT_PROPOSALS} className="text-cyan-400 text-sm hover:text-cyan-300">
              Xem tất cả →
            </Link>
          </div>
          {recentProposals.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">Chưa có đề xuất nào</p>
            </div>
          ) : (
            <div className="divide-y divide-[#2e2e2e]">
              {recentProposals.map((proposal) => (
                <div key={proposal.maYC} className="p-4 hover:bg-[#2e2e2e]/50 transition">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-white font-medium text-sm">{proposal.tieuDe}</p>
                    {getStatusBadge(proposal.trangThai)}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{PROPOSAL_TYPES[proposal.loaiYC as keyof typeof PROPOSAL_TYPES]}</span>
                    <span>•</span>
                    {getPriorityBadge(proposal.mucDoUuTien)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="space-y-4">
          <h2 className="text-white font-semibold">Truy cập nhanh</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link
              to={ROUTES.IT_PROPOSALS}
              className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-4 hover:border-cyan-500 transition-colors group"
            >
              <div className="w-10 h-10 bg-cyan-600/20 rounded-lg flex items-center justify-center mb-3 group-hover:bg-cyan-600/30 transition">
                <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-white font-medium text-sm">Xử lý đề xuất</h3>
            </Link>

            <Link
              to={ROUTES.IT_HANGHOA}
              className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-4 hover:border-blue-500 transition-colors group"
            >
              <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center mb-3 group-hover:bg-blue-600/30 transition">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-white font-medium text-sm">Hàng hóa</h3>
            </Link>

            <Link
              to={ROUTES.IT_STOCK_IN}
              className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-4 hover:border-green-500 transition-colors group"
            >
              <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center mb-3 group-hover:bg-green-600/30 transition">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="text-white font-medium text-sm">Nhập hàng</h3>
            </Link>

            <Link
              to={ROUTES.IT_REPORT}
              className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-4 hover:border-purple-500 transition-colors group"
            >
              <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center mb-3 group-hover:bg-purple-600/30 transition">
                <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-white font-medium text-sm">Báo cáo</h3>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
