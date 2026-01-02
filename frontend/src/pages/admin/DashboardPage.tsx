import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants'
import { useEffect, useState } from 'react'
import axios from '@/libs/axios'
import { 
  Package, 
  Warehouse, 
  Users, 
  Building2, 
  TrendingUp, 
  TrendingDown,
  ArrowRightLeft,
  FileText,
  ChevronRight,
  Box,
  Truck,
  BarChart3,
  Activity
} from 'lucide-react'

interface DashboardStats {
  totalHangHoa: number
  hangHoaTrongKho: number
  hangHoaDangDung: number
  hangHoaHong: number
  totalNhapHang: number
  totalXuatHang: number
  totalDieuChuyen: number
  totalKho: number
  totalNCC: number
  totalNhanVien: number
  totalPhongBan: number
}

interface RecentActivity {
  type: 'nhap' | 'xuat' | 'dieuchuyen'
  title: string
  description: string
  date: string
}

const AdminDashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalHangHoa: 0,
    hangHoaTrongKho: 0,
    hangHoaDangDung: 0,
    hangHoaHong: 0,
    totalNhapHang: 0,
    totalXuatHang: 0,
    totalDieuChuyen: 0,
    totalKho: 0,
    totalNCC: 0,
    totalNhanVien: 0,
    totalPhongBan: 0
  })
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch all data in parallel
        const [hanghoaRes, nhapRes, xuatRes, dieuChuyenRes, khoRes, nccRes, nhanVienRes, phongBanRes] = await Promise.all([
          axios.get('/hanghoa').catch(() => ({ data: { data: [] } })),
          axios.get('/stock/nhaphang').catch(() => ({ data: { data: [] } })),
          axios.get('/stock/xuathang').catch(() => ({ data: { data: [] } })),
          axios.get('/transfer').catch(() => ({ data: { data: [] } })),
          axios.get('/warehouses').catch(() => ({ data: { data: [] } })),
          axios.get('/ncc').catch(() => ({ data: { data: [] } })),
          axios.get('/employees').catch(() => ({ data: { data: [] } })),
          axios.get('/departments').catch(() => ({ data: { data: [] } }))
        ])

        const hangHoaList = hanghoaRes.data?.data || []
        const nhapList = nhapRes.data?.data || []
        const xuatList = xuatRes.data?.data || []
        const dieuChuyenList = dieuChuyenRes.data?.data || []

        setStats({
          totalHangHoa: hangHoaList.length,
          hangHoaTrongKho: hangHoaList.filter((h: any) => h.TrangThai === 'Trong kho').length,
          hangHoaDangDung: hangHoaList.filter((h: any) => h.TrangThai === 'Đang sử dụng').length,
          hangHoaHong: hangHoaList.filter((h: any) => h.TrangThai === 'Hỏng').length,
          totalNhapHang: nhapList.length,
          totalXuatHang: xuatList.length,
          totalDieuChuyen: dieuChuyenList.length,
          totalKho: khoRes.data?.data?.length || 0,
          totalNCC: nccRes.data?.data?.length || 0,
          totalNhanVien: nhanVienRes.data?.data?.length || 0,
          totalPhongBan: phongBanRes.data?.data?.length || 0
        })

        // Build recent activities
        const activities: RecentActivity[] = []
        
        nhapList.slice(0, 3).forEach((item: any) => {
          activities.push({
            type: 'nhap',
            title: `Nhập hàng: ${item.TenHang || 'N/A'}`,
            description: `Kho: ${item.TenKho || 'N/A'}`,
            date: item.NgayNhap
          })
        })

        xuatList.slice(0, 3).forEach((item: any) => {
          activities.push({
            type: 'xuat',
            title: `Xuất hàng: ${item.TenHang || 'N/A'}`,
            description: `Cho: ${item.TenNVNhan || 'N/A'}`,
            date: item.NgayXuat
          })
        })

        dieuChuyenList.slice(0, 3).forEach((item: any) => {
          activities.push({
            type: 'dieuchuyen',
            title: `Điều chuyển: ${item.TenHang || 'N/A'}`,
            description: `${item.TenNV1 || 'N/A'} → ${item.TenNV2 || 'N/A'}`,
            date: item.NgayDC
          })
        })

        // Sort by date and take top 5
        activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        setRecentActivities(activities.slice(0, 5))

      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const mainStats = [
    {
      title: 'Tổng Hàng Hóa',
      value: stats.totalHangHoa,
      change: `${stats.hangHoaTrongKho} trong kho`,
      icon: Package,
      color: 'from-blue-600 to-blue-400',
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-400'
    },
    {
      title: 'Phiếu Nhập',
      value: stats.totalNhapHang,
      change: 'Tổng phiếu nhập kho',
      icon: TrendingUp,
      color: 'from-green-600 to-green-400',
      bgColor: 'bg-green-500/10',
      textColor: 'text-green-400'
    },
    {
      title: 'Phiếu Xuất',
      value: stats.totalXuatHang,
      change: 'Tổng phiếu xuất kho',
      icon: TrendingDown,
      color: 'from-orange-600 to-orange-400',
      bgColor: 'bg-orange-500/10',
      textColor: 'text-orange-400'
    },
    {
      title: 'Điều Chuyển',
      value: stats.totalDieuChuyen,
      change: 'Tổng phiếu điều chuyển',
      icon: ArrowRightLeft,
      color: 'from-purple-600 to-purple-400',
      bgColor: 'bg-purple-500/10',
      textColor: 'text-purple-400'
    }
  ]

  const quickLinks = [
    { label: 'Hàng hóa', path: '/dashboard/hanghoa', icon: Box, color: 'text-blue-400' },
    { label: 'Nhập hàng', path: ROUTES.STOCK_IN, icon: TrendingUp, color: 'text-green-400' },
    { label: 'Xuất hàng', path: ROUTES.STOCK_OUT, icon: TrendingDown, color: 'text-orange-400' },
    { label: 'Điều chuyển', path: '/dashboard/transfer', icon: ArrowRightLeft, color: 'text-purple-400' },
    { label: 'Kho hàng', path: ROUTES.WAREHOUSES, icon: Warehouse, color: 'text-cyan-400' },
    { label: 'Nhà cung cấp', path: '/dashboard/ncc', icon: Truck, color: 'text-pink-400' },
    { label: 'Nhân viên', path: ROUTES.EMPLOYEES, icon: Users, color: 'text-yellow-400' },
    { label: 'Phòng ban', path: ROUTES.DEPARTMENTS, icon: Building2, color: 'text-indigo-400' },
  ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'nhap':
        return <TrendingUp className="w-4 h-4 text-green-400" />
      case 'xuat':
        return <TrendingDown className="w-4 h-4 text-orange-400" />
      case 'dieuchuyen':
        return <ArrowRightLeft className="w-4 h-4 text-purple-400" />
      default:
        return <FileText className="w-4 h-4 text-gray-400" />
    }
  }

  const getActivityBg = (type: string) => {
    switch (type) {
      case 'nhap':
        return 'bg-green-500/10'
      case 'xuat':
        return 'bg-orange-500/10'
      case 'dieuchuyen':
        return 'bg-purple-500/10'
      default:
        return 'bg-gray-500/10'
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner with Gradient */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 border border-[#2a2a2a] rounded-2xl p-6">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Xin chào, Admin!</h1>
              <p className="text-gray-400">Quản lý hệ thống kho hàng và tài sản của bạn</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mainStats.map((stat, index) => (
          <div
            key={index}
            className="group relative bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#3a3a3a] rounded-2xl p-5 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${stat.bgColor} ${stat.textColor}`}>
                <Activity className="w-3 h-3 inline mr-1" />
                Live
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-white mb-1">
                {loading ? (
                  <span className="inline-block w-12 h-8 bg-[#2a2a2a] rounded animate-pulse" />
                ) : (
                  stat.value.toLocaleString()
                )}
              </p>
              <p className="text-sm font-medium text-gray-400">{stat.title}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
            </div>
            {/* Decorative gradient line at bottom */}
            <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color} rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity`} />
          </div>
        ))}
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center">
            <Warehouse className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <p className="text-xl font-bold text-white">{loading ? '...' : stats.totalKho}</p>
            <p className="text-xs text-gray-500">Kho hàng</p>
          </div>
        </div>
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-pink-500/10 rounded-lg flex items-center justify-center">
            <Truck className="w-5 h-5 text-pink-400" />
          </div>
          <div>
            <p className="text-xl font-bold text-white">{loading ? '...' : stats.totalNCC}</p>
            <p className="text-xs text-gray-500">Nhà cung cấp</p>
          </div>
        </div>
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <p className="text-xl font-bold text-white">{loading ? '...' : stats.totalNhanVien}</p>
            <p className="text-xs text-gray-500">Nhân viên</p>
          </div>
        </div>
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <p className="text-xl font-bold text-white">{loading ? '...' : stats.totalPhongBan}</p>
            <p className="text-xs text-gray-500">Phòng ban</p>
          </div>
        </div>
      </div>

      {/* Quick Links & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Links */}
        <div className="lg:col-span-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-5">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Box className="w-5 h-5 text-blue-400" />
            Truy cập nhanh
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {quickLinks.map((link, index) => (
              <Link
                key={index}
                to={link.path}
                className="flex items-center gap-3 p-3 bg-[#252525] hover:bg-[#2a2a2a] border border-transparent hover:border-[#3a3a3a] rounded-xl transition-all group"
              >
                <link.icon className={`w-5 h-5 ${link.color}`} />
                <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{link.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Inventory Status */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-5">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-green-400" />
            Trạng thái hàng hóa
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="text-gray-400">Trong kho</span>
              </div>
              <span className="text-white font-semibold">{stats.hangHoaTrongKho}</span>
            </div>
            <div className="w-full bg-[#252525] rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${stats.totalHangHoa > 0 ? (stats.hangHoaTrongKho / stats.totalHangHoa) * 100 : 0}%` }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                <span className="text-gray-400">Đang sử dụng</span>
              </div>
              <span className="text-white font-semibold">{stats.hangHoaDangDung}</span>
            </div>
            <div className="w-full bg-[#252525] rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${stats.totalHangHoa > 0 ? (stats.hangHoaDangDung / stats.totalHangHoa) * 100 : 0}%` }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <span className="text-gray-400">Hỏng/Bảo trì</span>
              </div>
              <span className="text-white font-semibold">{stats.hangHoaHong}</span>
            </div>
            <div className="w-full bg-[#252525] rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-red-500 to-red-400 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${stats.totalHangHoa > 0 ? (stats.hangHoaHong / stats.totalHangHoa) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-400" />
              Hoạt động gần đây
            </h3>
          </div>
          
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-3 p-3 bg-[#252525] rounded-xl animate-pulse">
                  <div className="w-8 h-8 bg-[#2a2a2a] rounded-lg" />
                  <div className="flex-1">
                    <div className="h-4 bg-[#2a2a2a] rounded w-3/4 mb-2" />
                    <div className="h-3 bg-[#2a2a2a] rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentActivities.length > 0 ? (
            <div className="space-y-3">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-[#252525] rounded-xl hover:bg-[#2a2a2a] transition-colors">
                  <div className={`w-8 h-8 ${getActivityBg(activity.type)} rounded-lg flex items-center justify-center`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{activity.title}</p>
                    <p className="text-xs text-gray-500 truncate">{activity.description}</p>
                  </div>
                  <div className="text-xs text-gray-500">
                    {activity.date ? new Date(activity.date).toLocaleDateString('vi-VN') : ''}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-600" />
              <p className="text-gray-500">Chưa có hoạt động</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to={ROUTES.STOCK_IN}
          className="flex items-center justify-between p-4 bg-gradient-to-r from-green-600/10 to-green-600/5 border border-green-500/20 rounded-xl hover:border-green-500/40 transition-all group"
        >
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <span className="text-white font-medium">Tạo phiếu nhập mới</span>
          </div>
          <ChevronRight className="w-5 h-5 text-green-400 group-hover:translate-x-1 transition-transform" />
        </Link>
        <Link
          to={ROUTES.STOCK_OUT}
          className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-600/10 to-orange-600/5 border border-orange-500/20 rounded-xl hover:border-orange-500/40 transition-all group"
        >
          <div className="flex items-center gap-3">
            <TrendingDown className="w-5 h-5 text-orange-400" />
            <span className="text-white font-medium">Tạo phiếu xuất mới</span>
          </div>
          <ChevronRight className="w-5 h-5 text-orange-400 group-hover:translate-x-1 transition-transform" />
        </Link>
        <Link
          to="/dashboard/transfer"
          className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-600/10 to-purple-600/5 border border-purple-500/20 rounded-xl hover:border-purple-500/40 transition-all group"
        >
          <div className="flex items-center gap-3">
            <ArrowRightLeft className="w-5 h-5 text-purple-400" />
            <span className="text-white font-medium">Tạo phiếu điều chuyển</span>
          </div>
          <ChevronRight className="w-5 h-5 text-purple-400 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  )
}

export default AdminDashboardPage
