import { useState, useEffect } from 'react'
import { getProposalStats, getProposals } from '@/libs/proposal'
import { ProposalStats, Proposal } from '@/types/proposal.types'
import { Link } from 'react-router-dom'
import { ROUTES, PROPOSAL_TYPES, PRIORITY_LEVELS } from '@/constants'
import axios from '@/libs/axios'

interface StockStats {
  totalHangHoa: number
  hangHoaTrongKho: number
  totalNhapHang: number
  totalXuatHang: number
}

export default function DirectorDashboardPage() {
  const [stats, setStats] = useState<ProposalStats | null>(null)
  const [stockStats, setStockStats] = useState<StockStats>({ totalHangHoa: 0, hangHoaTrongKho: 0, totalNhapHang: 0, totalXuatHang: 0 })
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
      // Lọc những đề xuất chờ duyệt
      const waitingProposals = (proposalsRes.data || []).filter((p: Proposal) => p.trangThai === 'waiting_approval')
      setRecentProposals(waitingProposals.slice(0, 5))
      
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-[#2e2e2e] rounded-xl p-6">
        <h1 className="text-2xl font-bold text-white">Director Dashboard 👔</h1>
        <p className="text-gray-400 mt-1">Tổng quan duyệt đề xuất và tình hình kho</p>
      </div>

      {/* Proposal Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Chờ duyệt</p>
              <p className="text-3xl font-bold text-purple-400">{stats?.waitingApproval || 0}</p>
            </div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Đã duyệt</p>
              <p className="text-3xl font-bold text-green-400">{stats?.approved || 0}</p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Từ chối</p>
              <p className="text-3xl font-bold text-red-400">{stats?.rejected || 0}</p>
            </div>
            <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Hoàn thành</p>
              <p className="text-3xl font-bold text-blue-400">{stats?.completed || 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Stock Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Tổng thiết bị</p>
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
              <p className="text-gray-400 text-xs">Tổng nhập</p>
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
              <p className="text-gray-400 text-xs">Tổng xuất</p>
              <p className="text-xl font-bold text-red-400">{stockStats.totalXuatHang}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending proposals */}
        <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl overflow-hidden">
          <div className="p-4 border-b border-[#2e2e2e] flex items-center justify-between">
            <h2 className="text-white font-semibold">Đề xuất chờ duyệt</h2>
            <Link to={ROUTES.DIRECTOR_PROPOSALS} className="text-purple-400 text-sm hover:text-purple-300">
              Xem tất cả →
            </Link>
          </div>
          {recentProposals.length === 0 ? (
            <div className="p-8 text-center">
              <svg className="w-12 h-12 mx-auto mb-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-gray-400">Không có đề xuất nào chờ duyệt</p>
            </div>
          ) : (
            <div className="divide-y divide-[#2e2e2e]">
              {recentProposals.map((proposal) => (
                <div key={proposal.maYC} className="p-4 hover:bg-[#2e2e2e]/50 transition">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-white font-medium text-sm">{proposal.tieuDe}</p>
                    {getPriorityBadge(proposal.mucDoUuTien)}
                  </div>
                  <p className="text-gray-500 text-xs">
                    {PROPOSAL_TYPES[proposal.loaiYC as keyof typeof PROPOSAL_TYPES]} • {proposal.nguoiTao?.username}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="space-y-4">
          <h2 className="text-white font-semibold">Truy cập nhanh</h2>
          <div className="grid grid-cols-1 gap-4">
            <Link
              to={ROUTES.DIRECTOR_PROPOSALS}
              className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/50 rounded-xl p-6 hover:border-purple-400 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-600/30 rounded-lg flex items-center justify-center group-hover:bg-purple-600/40 transition">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold">Duyệt đề xuất</h3>
                  <p className="text-gray-400 text-sm">Xem và phê duyệt các đề xuất từ IT</p>
                </div>
                {stats?.waitingApproval && stats.waitingApproval > 0 && (
                  <span className="ml-auto bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                    {stats.waitingApproval} mới
                  </span>
                )}
              </div>
            </Link>

            <Link
              to={ROUTES.DIRECTOR_REPORT}
              className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-6 hover:border-blue-500 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center group-hover:bg-blue-600/30 transition">
                  <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold">Báo cáo nhập xuất tồn</h3>
                  <p className="text-gray-400 text-sm">Xem tình hình nhập xuất kho theo thời gian</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
