import { useState, useEffect } from 'react'
import { getProposalStats } from '@/libs/proposal'
import { ProposalStats } from '@/types/proposal.types'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants'

export default function DirectorDashboardPage() {
  const [stats, setStats] = useState<ProposalStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await getProposalStats()
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
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
      <div>
        <h1 className="text-2xl font-bold text-white">Director Dashboard</h1>
        <p className="text-gray-400 mt-1">Tổng quan duyệt đề xuất</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-6">
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

        <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-6">
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

        <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-6">
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
      </div>

      {/* Quick action */}
      <Link
        to={ROUTES.DIRECTOR_PROPOSALS}
        className="block bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-6 hover:border-purple-500 transition-colors"
      >
        <h3 className="text-white font-semibold mb-2">Duyệt đề xuất</h3>
        <p className="text-gray-400 text-sm">Xem và duyệt các đề xuất từ IT</p>
      </Link>
    </div>
  )
}
